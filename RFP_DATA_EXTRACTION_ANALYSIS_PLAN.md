# RFP Data Extraction, Mapping & Analysis - Evaluation & Implementation Plan

## Executive Summary

This document evaluates the current RFP platform architecture and provides a comprehensive plan for implementing data extraction, mapping, and analysis capabilities across the RFP lifecycle.

---

## 1. Current State Evaluation

### 1.1 Architecture Overview

The RFP platform consists of three main components:

#### **Frontend (React + Firebase)**
- **Location**: `src/`
- **Technology**: React 18, Firebase (Auth + Firestore), Tailwind CSS
- **Components**:
  - `RealRFPProcess.jsx` - Main workflow orchestrator
  - `RFPStages.jsx` - Stage-specific components
  - `TaskManagement.jsx` - Task tracking
  - `ClarificationsManagement.jsx` - Q&A management
  - `SLAMonitoring.jsx` - Performance tracking
- **Data Storage**: Firebase Firestore (real-time sync)
- **Current State**: ✅ Functional UI with mock data fallback

#### **Backend API (Node.js + Express)**
- **Location**: `api/server.js`
- **Technology**: Node.js, Express, PostgreSQL, Redis, AWS S3
- **Services**: Auth, RFP, Task, Notification, Audit, Integration
- **Current State**: ⚠️ Structure exists but services need implementation
- **Document Handling**: Basic upload to S3, no extraction yet

#### **Autonomous Analytics App**
- **Location**: `rfp-autonomous-app-v2/`
- **Technology**: TypeScript/Node.js (API Gateway), Python/FastAPI (Services)
- **Services**:
  - **Parser** (Port 8000): Document parsing - ⚠️ **STUBBED**
  - **Validator** (Port 8001): 5-layer validation - ⚠️ **Partially implemented**
  - **Scoring** (Port 7002): Weighted scoring - ✅ Functional
  - **Decision** (Port 7003): Bid/no-bid decisions - ✅ Functional
- **Orchestrator**: BullMQ job queue
- **Database**: PostgreSQL with pgvector for semantic search
- **Current State**: ⚠️ Core pipeline exists but parser needs implementation

### 1.2 Current Data Extraction Capabilities

| Component | Capability | Status | Notes |
|-----------|-----------|--------|-------|
| **DocumentService.js** | PDF text extraction | ❌ Not implemented | Placeholder method exists |
| **DocumentService.js** | Word document conversion | ⚠️ Partial | Uses `mammoth` but not integrated |
| **Parser Service** | Document parsing | ❌ Stubbed | Returns mock data |
| **Parser Service** | Section extraction | ❌ Not implemented | Needs PDF/DOCX parsing |
| **Clause extraction** | Sentence-level extraction | ⚠️ Basic | Naive sentence splitting |
| **Vector indexing** | Semantic search | ✅ Available | pgvector/Qdrant ready |

### 1.3 Current Mapping & Analysis Capabilities

| Feature | Status | Implementation |
|---------|--------|----------------|
| **Data Mapping** | ❌ Missing | No structured mapping from extracted data to RFP schema |
| **Validation** | ⚠️ Partial | Layers 1-3 implemented, 4-5 stubbed |
| **Scoring** | ✅ Functional | Weighted scoring (Fit 40%, Complexity 30%, Competitive 30%) |
| **Decision Engine** | ✅ Functional | Threshold-based bid/no-bid decisions |
| **Historical Analysis** | ⚠️ Partial | Basic precedent matching in frontend |
| **Semantic Search** | ✅ Available | pgvector infrastructure ready |

---

## 2. Data Extraction Architecture Plan

### 2.1 Document Processing Pipeline

```
┌─────────────────┐
│  Document Upload │
│  (PDF/DOCX/Excel)│
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Document Service (Node.js)         │
│  - File validation                  │
│  - Upload to S3                     │
│  - Queue for processing             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Parser Service (Python/FastAPI)    │
│  - PDF parsing (pdfplumber/pypdf)   │
│  - DOCX parsing (python-docx)       │
│  - Excel parsing (pandas/openpyxl)   │
│  - OCR (Tesseract) for scanned PDFs │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Extraction Engine                  │
│  - Section detection                │
│  - Table extraction                 │
│  - Clause identification            │
│  - Metadata extraction              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Structured Output (JSON)            │
│  - Sections                         │
│  - Requirements                     │
│  - Evaluation criteria              │
│  - Compliance items                 │
│  - Pricing tables                   │
└─────────────────────────────────────┘
```

### 2.2 Implementation Plan for Parser Service

#### **Phase 1: Core Parsing (Week 1-2)**

**File**: `rfp-autonomous-app-v2/services/parser/main.py`

**Dependencies to Add**:
```python
# requirements.txt additions
pdfplumber>=0.10.0      # PDF parsing
python-docx>=1.1.0      # DOCX parsing
pandas>=2.0.0           # Excel parsing
openpyxl>=3.1.0         # Excel support
pytesseract>=0.3.10     # OCR
Pillow>=10.0.0          # Image processing
pdf2image>=1.16.0       # PDF to image conversion
```

**Implementation Steps**:

1. **PDF Parser**:
   ```python
   def parse_pdf(file_path: str) -> dict:
       """
       Extract text, tables, and metadata from PDF
       Returns: {
           'text': str,
           'sections': dict,
           'tables': list,
           'metadata': dict
       }
       """
   ```

2. **DOCX Parser**:
   ```python
   def parse_docx(file_path: str) -> dict:
       """
       Extract structured content from Word documents
       Handles headings, paragraphs, tables, lists
       """
   ```

3. **Excel Parser**:
   ```python
   def parse_excel(file_path: str) -> dict:
       """
       Extract data from Excel sheets
       Handles BoQ, pricing tables, requirements matrices
       """
   ```

4. **Section Detection**:
   ```python
   def detect_sections(text: str) -> dict:
       """
       Identify sections using:
       - Heading patterns (H1-H6)
       - Numbering schemes (1.1, 1.2, etc.)
       - Keyword matching
       - ML-based classification (optional)
       """
   ```

#### **Phase 2: Advanced Extraction (Week 3-4)**

1. **Clause Extraction**:
   - Sentence-level splitting
   - Requirement identification
   - Compliance clause detection
   - Legal term extraction

2. **Table Extraction**:
   - BoQ (Bill of Quantities) parsing
   - Pricing tables
   - Comparison matrices
   - Timeline tables

3. **Metadata Extraction**:
   - RFP number
   - Submission deadline
   - Client information
   - Contact details
   - Evaluation criteria weights

---

## 3. Data Mapping Architecture

### 3.1 Mapping Schema

**Source**: Extracted document data (JSON)
**Target**: RFP database schema + Firebase structure

```javascript
// Mapping Configuration
const RFP_MAPPING_SCHEMA = {
  // Basic Information
  'title': {
    sources: ['metadata.title', 'sections.Introduction.title'],
    transform: (value) => value?.trim() || 'Untitled RFP',
    required: true
  },
  
  'client': {
    sources: ['metadata.client', 'sections.Introduction.client'],
    transform: (value) => extractClientName(value),
    required: true
  },
  
  'submission_deadline': {
    sources: ['metadata.deadline', 'sections.Introduction.deadline'],
    transform: (value) => parseDate(value),
    required: true
  },
  
  'estimated_value': {
    sources: ['metadata.value', 'sections.Pricing.total_value'],
    transform: (value) => parseCurrency(value),
    required: false
  },
  
  // Requirements Mapping
  'requirements': {
    sources: ['sections.Requirements', 'sections.Scope'],
    transform: (sections) => extractRequirements(sections),
    structure: {
      technical: [],
      compliance: [],
      commercial: []
    }
  },
  
  // Evaluation Criteria
  'evaluation_criteria': {
    sources: ['sections.Evaluation', 'metadata.evaluationCriteria'],
    transform: (data) => extractEvaluationCriteria(data),
    structure: [
      {
        criterion: string,
        weight: number,
        description: string
      }
    ]
  },
  
  // Compliance Items
  'compliance_items': {
    sources: ['sections.Compliance', 'clauses'],
    transform: (data) => extractComplianceItems(data),
    structure: [
      {
        type: 'LEGAL' | 'FINANCE' | 'TECH' | 'COMPLIANCE',
        text: string,
        status: 'PENDING' | 'VERIFIED' | 'FLAG_FOR_REVIEW'
      }
    ]
  }
};
```

### 3.2 Mapping Service Implementation

**File**: `src/services/DataMappingService.js`

```javascript
export class DataMappingService {
  constructor(mappingSchema) {
    this.schema = mappingSchema;
  }

  /**
   * Map extracted document data to RFP structure
   */
  async mapToRFP(extractedData, rfpId) {
    const mappedData = {};
    
    for (const [field, config] of Object.entries(this.schema)) {
      // Try each source in order
      let value = null;
      for (const source of config.sources) {
        value = this.getNestedValue(extractedData, source);
        if (value) break;
      }
      
      // Apply transformation
      if (value && config.transform) {
        value = await config.transform(value);
      }
      
      // Validate required fields
      if (config.required && !value) {
        throw new Error(`Required field ${field} not found in extracted data`);
      }
      
      mappedData[field] = value;
    }
    
    return mappedData;
  }

  /**
   * Extract requirements by category
   */
  extractRequirements(sections) {
    const requirements = {
      technical: [],
      compliance: [],
      commercial: []
    };
    
    // Use NLP/pattern matching to categorize
    // This can be enhanced with ML models
    
    return requirements;
  }

  /**
   * Extract evaluation criteria with weights
   */
  extractEvaluationCriteria(data) {
    // Parse evaluation section
    // Extract criteria and weights
    // Return structured array
  }
}
```

---

## 4. Analysis Tools Architecture

### 4.1 Analysis Pipeline

```
┌─────────────────────┐
│  Extracted RFP Data │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Validation Service (5-Layer)       │
│  Layer 1: Format validation         │
│  Layer 2: Completeness check        │
│  Layer 3: Consistency validation    │
│  Layer 4: Cross-reference check      │ ⚠️ To implement
│  Layer 5: AI-assisted validation     │ ⚠️ To implement
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Scoring Service                     │
│  - Strategic Fit (40%)                │
│  - Complexity (30%)                   │
│  - Competitive Position (30%)         │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Decision Engine                     │
│  - Threshold-based decision          │
│  - Risk assessment                   │
│  - Rationale generation              │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Historical Analysis                 │
│  - Similar RFP matching              │
│  - Win/loss patterns                 │
│  - Precedent extraction              │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Analysis Dashboard                  │
│  - Visualizations                    │
│  - Recommendations                   │
│  - Risk indicators                   │
└──────────────────────────────────────┘
```

### 4.2 Enhanced Analysis Features

#### **A. Historical Precedent Matching**

**Implementation**: `src/services/HistoricalAnalysisService.js`

```javascript
export class HistoricalAnalysisService {
  /**
   * Find similar RFPs using semantic search
   */
  async findSimilarRFPs(currentRFP, topK = 5) {
    // 1. Extract key features from current RFP
    const features = this.extractFeatures(currentRFP);
    
    // 2. Vector search in historical database
    const similar = await this.vectorSearch(features, topK);
    
    // 3. Calculate similarity scores
    // 4. Return with outcomes (WON/LOST) and lessons learned
    
    return similar.map(rfp => ({
      rfpId: rfp.id,
      client: rfp.client,
      similarity: rfp.score,
      outcome: rfp.outcome,
      notes: rfp.notes,
      keyDifferences: this.compareRFPs(currentRFP, rfp)
    }));
  }
}
```

#### **B. Risk Analysis**

**Implementation**: `src/services/RiskAnalysisService.js`

```javascript
export class RiskAnalysisService {
  /**
   * Comprehensive risk assessment
   */
  async assessRisk(rfpData) {
    const risks = {
      technical: this.assessTechnicalRisk(rfpData),
      commercial: this.assessCommercialRisk(rfpData),
      legal: this.assessLegalRisk(rfpData),
      compliance: this.assessComplianceRisk(rfpData),
      timeline: this.assessTimelineRisk(rfpData)
    };
    
    return {
      overallScore: this.calculateOverallRisk(risks),
      breakdown: risks,
      recommendations: this.generateRecommendations(risks)
    };
  }
}
```

#### **C. Competitive Analysis**

**Implementation**: `src/services/CompetitiveAnalysisService.js`

```javascript
export class CompetitiveAnalysisService {
  /**
   * Analyze competitive position
   */
  async analyzeCompetitivePosition(rfpData) {
    return {
      strengths: this.identifyStrengths(rfpData),
      weaknesses: this.identifyWeaknesses(rfpData),
      opportunities: this.identifyOpportunities(rfpData),
      threats: this.identifyThreats(rfpData),
      winProbability: this.calculateWinProbability(rfpData)
    };
  }
}
```

---

## 5. Integration Architecture

### 5.1 System Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - Document upload UI                                       │
│  - Analysis dashboard                                       │
│  - Real-time updates via Firebase                          │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ HTTP/REST
               ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                  │
│  - Document upload endpoint                                 │
│  - RFP management                                           │
│  - Analysis trigger                                         │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ Queue Job
               ▼
┌─────────────────────────────────────────────────────────────┐
│         Autonomous App - API Gateway                        │
│  - Job orchestration (BullMQ)                              │
│  - Service coordination                                     │
└──────────────┬──────────────────────────────────────────────┘
               │
       ┌───────┴───────┬───────────────┬──────────────┐
       ▼               ▼               ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Parser  │   │ Validator │   │ Scoring  │   │ Decision │
│ Service  │   │ Service   │   │ Service  │   │ Service  │
└────┬─────┘   └────┬──────┘   └────┬─────┘   └────┬─────┘
     │              │               │              │
     └──────────────┴───────────────┴──────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   PostgreSQL +        │
         │   pgvector            │
         │   - RFP data          │
         │   - Analysis results  │
         │   - Vector embeddings │
         └──────────────────────┘
```

### 5.2 API Integration Points

#### **Document Upload & Processing**

```javascript
// Frontend: src/services/DocumentService.js (enhanced)
async uploadAndProcessDocument(rfpId, file) {
  // 1. Upload to S3
  const document = await this.uploadDocument(rfpId, file);
  
  // 2. Trigger processing pipeline
  const response = await fetch(`${API_BASE_URL}/api/rfps/${rfpId}/process`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documentId: document.id,
      documentUrl: document.storage_path
    })
  });
  
  return response.json();
}
```

#### **Backend Processing Endpoint**

```javascript
// api/server.js
app.post('/api/rfps/:rfpId/process', authenticate, async (req, res) => {
  try {
    const { documentId, documentUrl } = req.body;
    
    // 1. Queue processing job
    const job = await processingQueue.add('process-rfp', {
      rfpId: req.params.rfpId,
      documentId,
      documentUrl,
      userId: req.user.id
    });
    
    // 2. Return job ID for status tracking
    res.json({
      jobId: job.id,
      status: 'queued',
      message: 'Document processing started'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job status endpoint
app.get('/api/rfps/:rfpId/process/status/:jobId', authenticate, async (req, res) => {
  const job = await processingQueue.getJob(req.params.jobId);
  res.json({
    status: await job.getState(),
    progress: job.progress,
    result: job.returnvalue
  });
});
```

#### **Analysis Results Retrieval**

```javascript
// Frontend: Real-time analysis updates
useEffect(() => {
  const unsubscribe = onSnapshot(
    doc(db, 'artifacts', appId, 'public', 'rfps', rfpId, 'analysis'),
    (docSnap) => {
      if (docSnap.exists()) {
        const analysis = docSnap.data();
        setAnalysisData(analysis);
      }
    }
  );
  
  return () => unsubscribe();
}, [rfpId]);
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement PDF parsing in Parser Service
- [ ] Implement DOCX parsing
- [ ] Implement Excel parsing
- [ ] Basic section detection
- [ ] Integration with document upload

### Phase 2: Extraction & Mapping (Weeks 3-4)
- [ ] Clause extraction engine
- [ ] Table extraction (BoQ, pricing)
- [ ] Metadata extraction
- [ ] Data mapping service implementation
- [ ] Mapping schema configuration

### Phase 3: Enhanced Validation (Weeks 5-6)
- [ ] Layer 4: Cross-reference validation
- [ ] Layer 5: AI-assisted validation
- [ ] Historical precedent matching
- [ ] Risk analysis service

### Phase 4: Analysis & Integration (Weeks 7-8)
- [ ] Competitive analysis service
- [ ] Enhanced scoring algorithms
- [ ] Frontend analysis dashboard
- [ ] Real-time updates integration
- [ ] Visualization components

### Phase 5: Optimization & Testing (Weeks 9-10)
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] User training materials

---

## 7. Technical Specifications

### 7.1 Parser Service Enhancements

**File**: `rfp-autonomous-app-v2/services/parser/main.py`

**Key Functions**:
```python
@app.post("/parse", response_model=ParsedRFP)
async def parse_rfp(body: ParseIn):
    """
    Main parsing endpoint
    - Downloads document from URL
    - Detects file type
    - Routes to appropriate parser
    - Extracts structured data
    """
    document = await download_document(body.documentUrl)
    file_type = detect_file_type(document)
    
    if file_type == 'pdf':
        parsed = await parse_pdf(document)
    elif file_type == 'docx':
        parsed = await parse_docx(document)
    elif file_type == 'xlsx':
        parsed = await parse_excel(document)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    # Extract sections
    sections = detect_sections(parsed['text'])
    
    # Extract evaluation criteria
    evaluation_criteria = extract_evaluation_criteria(parsed)
    
    # Extract metadata
    metadata = extract_metadata(parsed)
    
    return {
        "sections": sections,
        "evaluationCriteria": evaluation_criteria,
        "metadata": metadata
    }
```

### 7.2 Data Mapping Service

**File**: `src/services/DataMappingService.js`

**Key Methods**:
- `mapToRFP(extractedData, rfpId)` - Main mapping function
- `extractRequirements(sections)` - Requirement categorization
- `extractEvaluationCriteria(data)` - Criteria extraction
- `extractComplianceItems(clauses)` - Compliance mapping
- `validateMappedData(data)` - Data validation

### 7.3 Analysis Services

**Files**:
- `src/services/HistoricalAnalysisService.js`
- `src/services/RiskAnalysisService.js`
- `src/services/CompetitiveAnalysisService.js`

**Integration Points**:
- Vector search for similarity matching
- ML models for risk prediction
- Historical data analysis

---

## 8. Data Flow Diagram

```
User Uploads Document
        │
        ▼
Frontend: DocumentService.uploadDocument()
        │
        ▼
Backend: POST /api/rfps/:id/documents
        │
        ▼
S3 Storage + Database Record
        │
        ▼
Queue Processing Job
        │
        ▼
Parser Service: Extract Data
        │
        ▼
Validator Service: Validate (5 layers)
        │
        ▼
Scoring Service: Calculate Scores
        │
        ▼
Decision Service: Bid/No-Bid Decision
        │
        ▼
Mapping Service: Map to RFP Schema
        │
        ▼
Firebase: Update RFP Document
        │
        ▼
Frontend: Real-time Update via Firestore
        │
        ▼
Analysis Dashboard: Display Results
```

---

## 9. Success Metrics

### Extraction Accuracy
- **Target**: >90% section detection accuracy
- **Target**: >85% requirement extraction accuracy
- **Target**: >95% metadata extraction accuracy

### Processing Performance
- **Target**: <30 seconds for typical RFP (50 pages)
- **Target**: <2 minutes for large RFP (200+ pages)
- **Target**: Support concurrent processing of 10+ documents

### Analysis Quality
- **Target**: >80% win probability prediction accuracy
- **Target**: >75% risk assessment accuracy
- **Target**: <5% false positive rate for deal-breaker detection

---

## 10. Next Steps

1. **Immediate Actions**:
   - Review and approve this plan
   - Set up development environment
   - Install required dependencies

2. **Week 1 Tasks**:
   - Implement PDF parser
   - Implement DOCX parser
   - Set up testing framework

3. **Ongoing**:
   - Weekly progress reviews
   - Continuous integration testing
   - User feedback incorporation

---

## Appendix A: Dependencies

### Python (Parser Service)
```
pdfplumber>=0.10.0
python-docx>=1.1.0
pandas>=2.0.0
openpyxl>=3.1.0
pytesseract>=0.3.10
Pillow>=10.0.0
pdf2image>=1.16.0
numpy>=1.24.0
```

### Node.js (Backend/Frontend)
```
pdf-parse>=1.1.1
mammoth>=1.6.0
xlsx>=0.18.0
@tensorflow/tfjs-node (optional, for ML)
```

---

## Appendix B: Configuration Files

### Parser Service Config
```yaml
# parser/config.yaml
extraction:
  sections:
    min_heading_length: 3
    max_heading_length: 100
  requirements:
    keywords: ["must", "shall", "required", "should"]
  compliance:
    patterns:
      - "SOC 2"
      - "ISO 27001"
      - "GDPR"
      - "PCI DSS"
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Author**: AI Assistant  
**Status**: Draft - Pending Review



