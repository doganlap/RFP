# Quick Start: RFP Data Extraction & Analysis Implementation

## Overview

This guide provides step-by-step instructions to implement data extraction, mapping, and analysis capabilities in the RFP platform.

---

## Step 1: Set Up Parser Service Dependencies

### Location: `rfp-autonomous-app-v2/services/parser/`

```bash
cd rfp-autonomous-app-v2/services/parser
```

### Update `requirements.txt`:

```txt
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.4.0
pdfplumber>=0.10.0
python-docx>=1.1.0
pandas>=2.0.0
openpyxl>=3.1.0
pytesseract>=0.3.10
Pillow>=10.0.0
pdf2image>=1.16.0
requests>=2.31.0
aiofiles>=23.2.0
```

### Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Step 2: Implement PDF Parser

### File: `rfp-autonomous-app-v2/services/parser/pdf_parser.py`

```python
import pdfplumber
from typing import Dict, List, Any
import re

class PDFParser:
    def __init__(self):
        self.section_patterns = [
            r'^\d+\.\s+[A-Z][^.]*$',  # Numbered sections: "1. Introduction"
            r'^[A-Z][A-Z\s]+$',       # ALL CAPS headings
            r'^\d+\.\d+\s+[A-Z]',     # Sub-sections: "1.1 Overview"
        ]
    
    def parse(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF and extract structured data"""
        result = {
            'text': '',
            'sections': {},
            'tables': [],
            'metadata': {}
        }
        
        with pdfplumber.open(file_path) as pdf:
            # Extract text
            full_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text.append(text)
            
            result['text'] = '\n\n'.join(full_text)
            
            # Extract tables
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    result['tables'].extend(tables)
            
            # Extract metadata
            if pdf.metadata:
                result['metadata'] = {
                    'title': pdf.metadata.get('Title', ''),
                    'author': pdf.metadata.get('Author', ''),
                    'subject': pdf.metadata.get('Subject', ''),
                    'pages': len(pdf.pages)
                }
        
        # Detect sections
        result['sections'] = self.detect_sections(result['text'])
        
        return result
    
    def detect_sections(self, text: str) -> Dict[str, str]:
        """Detect document sections"""
        sections = {}
        lines = text.split('\n')
        current_section = 'Introduction'
        current_content = []
        
        for line in lines:
            # Check if line is a section heading
            is_heading = any(re.match(pattern, line.strip()) for pattern in self.section_patterns)
            
            if is_heading and len(line.strip()) < 100:
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = line.strip()
                current_content = []
            else:
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
```

---

## Step 3: Implement DOCX Parser

### File: `rfp-autonomous-app-v2/services/parser/docx_parser.py`

```python
from docx import Document
from typing import Dict, Any, List

class DOCXParser:
    def parse(self, file_path: str) -> Dict[str, Any]:
        """Parse DOCX and extract structured data"""
        doc = Document(file_path)
        
        result = {
            'text': '',
            'sections': {},
            'tables': [],
            'metadata': {}
        }
        
        # Extract paragraphs
        paragraphs = []
        current_section = 'Introduction'
        sections = {'Introduction': []}
        
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue
            
            # Check if paragraph is a heading
            if para.style.name.startswith('Heading'):
                # Save previous section
                if sections[current_section]:
                    sections[current_section] = '\n'.join(sections[current_section])
                
                # Start new section
                current_section = text
                sections[current_section] = []
            else:
                sections[current_section].append(text)
                paragraphs.append(text)
        
        # Save last section
        if sections[current_section]:
            sections[current_section] = '\n'.join(sections[current_section])
        
        result['text'] = '\n\n'.join(paragraphs)
        result['sections'] = sections
        
        # Extract tables
        for table in doc.tables:
            table_data = []
            for row in table.rows:
                row_data = [cell.text.strip() for cell in row.cells]
                table_data.append(row_data)
            result['tables'].append(table_data)
        
        # Extract metadata
        core_props = doc.core_properties
        result['metadata'] = {
            'title': core_props.title or '',
            'author': core_props.author or '',
            'subject': core_props.subject or '',
            'created': str(core_props.created) if core_props.created else ''
        }
        
        return result
```

---

## Step 4: Update Parser Service Main File

### File: `rfp-autonomous-app-v2/services/parser/main.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
import os
import tempfile
import requests
from pdf_parser import PDFParser
from docx_parser import DOCXParser

app = FastAPI()

class ParseIn(BaseModel):
    rfpId: int
    name: str
    documentUrl: HttpUrl | None = None
    filePath: str | None = None

class ParsedRFP(BaseModel):
    sections: dict
    evaluationCriteria: list
    metadata: dict
    tables: list = []

@app.post("/parse", response_model=ParsedRFP)
async def parse_rfp(body: ParseIn):
    """Main parsing endpoint"""
    try:
        # Download document if URL provided
        if body.documentUrl:
            response = requests.get(str(body.documentUrl))
            response.raise_for_status()
            
            # Save to temp file
            file_ext = body.documentUrl.path.split('.')[-1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp:
                tmp.write(response.content)
                file_path = tmp.name
        elif body.filePath:
            file_path = body.filePath
        else:
            raise HTTPException(status_code=400, detail="Either documentUrl or filePath required")
        
        # Detect file type and parse
        file_ext = file_path.split('.')[-1].lower()
        
        if file_ext == 'pdf':
            parser = PDFParser()
            parsed = parser.parse(file_path)
        elif file_ext in ['docx', 'doc']:
            parser = DOCXParser()
            parsed = parser.parse(file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_ext}")
        
        # Extract evaluation criteria
        evaluation_criteria = extract_evaluation_criteria(parsed)
        
        # Clean up temp file
        if body.documentUrl and os.path.exists(file_path):
            os.unlink(file_path)
        
        return {
            "sections": parsed.get('sections', {}),
            "evaluationCriteria": evaluation_criteria,
            "metadata": {
                **parsed.get('metadata', {}),
                "rfpId": body.rfpId,
                "source": str(body.documentUrl) if body.documentUrl else body.filePath,
                "extractedBy": "parser_v1"
            },
            "tables": parsed.get('tables', [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_evaluation_criteria(parsed: dict) -> list:
    """Extract evaluation criteria from parsed document"""
    criteria = []
    text = parsed.get('text', '')
    sections = parsed.get('sections', {})
    
    # Look for evaluation section
    eval_section = None
    for section_name, content in sections.items():
        if 'evaluation' in section_name.lower() or 'criteria' in section_name.lower():
            eval_section = content
            break
    
    if not eval_section:
        eval_section = text
    
    # Simple pattern matching for criteria
    # This can be enhanced with NLP
    lines = eval_section.split('\n')
    for line in lines:
        if any(keyword in line.lower() for keyword in ['weight', 'score', 'criterion', 'criteria']):
            # Try to extract criterion and weight
            # This is a simplified version - enhance as needed
            criteria.append({
                "criterion": line.strip(),
                "weight": 0.33  # Default weight
            })
    
    # Default criteria if none found
    if not criteria:
        criteria = [
            {"criterion": "Fit", "weight": 0.4},
            {"criterion": "Complexity", "weight": 0.3},
            {"criterion": "Competitive", "weight": 0.3}
        ]
    
    return criteria

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

---

## Step 5: Create Data Mapping Service

### File: `src/services/DataMappingService.js`

```javascript
export class DataMappingService {
  constructor() {
    this.mappingSchema = {
      title: {
        sources: ['metadata.title', 'sections.Introduction'],
        transform: (value) => this.extractTitle(value),
        required: true
      },
      client: {
        sources: ['metadata.author', 'metadata.client', 'sections.Introduction'],
        transform: (value) => this.extractClientName(value),
        required: true
      },
      submission_deadline: {
        sources: ['metadata.deadline', 'sections.Introduction'],
        transform: (value) => this.parseDate(value),
        required: true
      },
      estimated_value: {
        sources: ['metadata.value', 'sections.Pricing'],
        transform: (value) => this.parseCurrency(value),
        required: false
      }
    };
  }

  async mapToRFP(extractedData, rfpId) {
    const mappedData = {
      id: rfpId,
      extracted_at: new Date().toISOString()
    };

    for (const [field, config] of Object.entries(this.mappingSchema)) {
      let value = null;
      
      // Try each source
      for (const source of config.sources) {
        value = this.getNestedValue(extractedData, source);
        if (value) break;
      }
      
      // Apply transformation
      if (value && config.transform) {
        value = await config.transform(value);
      }
      
      // Validate required
      if (config.required && !value) {
        console.warn(`Required field ${field} not found`);
      }
      
      mappedData[field] = value;
    }
    
    // Extract requirements
    mappedData.requirements = this.extractRequirements(extractedData.sections);
    
    // Extract evaluation criteria
    mappedData.evaluation_criteria = extractedData.evaluationCriteria || [];
    
    return mappedData;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  extractTitle(value) {
    if (typeof value === 'string') {
      // Extract first line or first sentence
      return value.split('\n')[0].split('.')[0].trim();
    }
    return value || 'Untitled RFP';
  }

  extractClientName(value) {
    if (typeof value === 'string') {
      // Simple extraction - enhance with NLP
      const lines = value.split('\n');
      for (const line of lines) {
        if (line.length > 5 && line.length < 100) {
          return line.trim();
        }
      }
    }
    return value || 'Unknown Client';
  }

  parseDate(value) {
    // Simple date parsing - enhance with date-fns or similar
    if (!value) return null;
    
    // Try common date formats
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{2}-\d{2}-\d{4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = value.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  }

  parseCurrency(value) {
    if (!value) return null;
    
    // Extract currency values
    const currencyPattern = /[\$£€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|M|billion|B)?/i;
    const match = value.match(currencyPattern);
    
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      if (value.toLowerCase().includes('million') || value.includes('M')) {
        amount *= 1000000;
      } else if (value.toLowerCase().includes('billion') || value.includes('B')) {
        amount *= 1000000000;
      }
      return amount;
    }
    
    return null;
  }

  extractRequirements(sections) {
    const requirements = {
      technical: [],
      compliance: [],
      commercial: []
    };
    
    if (!sections) return requirements;
    
    // Simple keyword-based categorization
    const technicalKeywords = ['api', 'database', 'server', 'infrastructure', 'cloud', 'security'];
    const complianceKeywords = ['compliance', 'certification', 'standard', 'regulation', 'gdpr', 'soc'];
    const commercialKeywords = ['payment', 'pricing', 'cost', 'budget', 'invoice', 'terms'];
    
    for (const [sectionName, content] of Object.entries(sections)) {
      const lowerContent = content.toLowerCase();
      
      if (technicalKeywords.some(kw => lowerContent.includes(kw))) {
        requirements.technical.push({
          section: sectionName,
          text: content.substring(0, 500) // First 500 chars
        });
      }
      
      if (complianceKeywords.some(kw => lowerContent.includes(kw))) {
        requirements.compliance.push({
          section: sectionName,
          text: content.substring(0, 500)
        });
      }
      
      if (commercialKeywords.some(kw => lowerContent.includes(kw))) {
        requirements.commercial.push({
          section: sectionName,
          text: content.substring(0, 500)
        });
      }
    }
    
    return requirements;
  }
}

export default DataMappingService;
```

---

## Step 6: Integrate with Frontend

### Update `src/services/DocumentService.js`

Add method to trigger processing:

```javascript
async processDocument(rfpId, documentId) {
  try {
    const API_BASE = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_BASE}/api/rfps/${rfpId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        documentId,
        triggerAnalysis: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Processing failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
}
```

---

## Step 7: Test the Implementation

### 1. Start Parser Service:

```bash
cd rfp-autonomous-app-v2/services/parser
python main.py
```

### 2. Test with curl:

```bash
curl -X POST http://localhost:8000/parse \
  -H "Content-Type: application/json" \
  -d '{
    "rfpId": 1,
    "name": "Test RFP",
    "documentUrl": "https://example.com/rfp.pdf"
  }'
```

### 3. Verify Response:

```json
{
  "sections": {
    "Introduction": "...",
    "Requirements": "..."
  },
  "evaluationCriteria": [
    {"criterion": "Fit", "weight": 0.4}
  ],
  "metadata": {
    "title": "...",
    "pages": 50
  }
}
```

---

## Next Steps

1. **Enhance Section Detection**: Use ML models for better section identification
2. **Improve Requirement Extraction**: Implement NLP for requirement parsing
3. **Add Table Parsing**: Extract BoQ and pricing tables
4. **Implement OCR**: Handle scanned PDFs
5. **Add Validation**: Implement 5-layer validation
6. **Create Dashboard**: Build analysis visualization UI

---

## Troubleshooting

### Common Issues:

1. **PDF parsing fails**: Ensure `pdfplumber` is installed correctly
2. **DOCX parsing fails**: Check file is not corrupted
3. **Memory issues**: Process large files in chunks
4. **Encoding errors**: Handle different character encodings

---

**Last Updated**: 2025-01-XX




