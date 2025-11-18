# Firebase Production Setup Guide

## 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name: "RFP-Qualification-Platform"
4. Enable Google Analytics (optional)

## 2. Enable Services
### Firestore Database
- Go to Firestore Database
- Click "Create database"
- Start in production mode
- Choose location (us-central1 recommended)

### Authentication
- Go to Authentication > Sign-in method
- Enable "Anonymous" authentication
- Enable "Email/Password" for admin users

## 3. Security Rules (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RFP Documents - Read/Write for authenticated users
    match /artifacts/{appId}/public/rfps/{rfpId} {
      allow read, write: if request.auth != null;
      
      // Legal Queue
      match /legalQueue/{itemId} {
        allow read, write: if request.auth != null;
      }
      
      // Finance Queue  
      match /financeQueue/{itemId} {
        allow read, write: if request.auth != null;
      }
      
      // Tech Queue
      match /techQueue/{itemId} {
        allow read, write: if request.auth != null;
      }
    }
    
    // User profiles and audit logs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /audit_logs/{logId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 4. Sample Data Structure
```javascript
// /artifacts/production/public/rfps/RFP-2025-001
{
  "id": "RFP-2025-001",
  "title": "Enterprise Cloud Migration Services",
  "client": "Fortune 500 Financial Corp",
  "status": "Stage 2 - Business Review",
  "submittedAt": "2025-01-15T10:30:00Z",
  "estimatedValue": 2500000,
  "currency": "USD",
  "duration": "18 months",
  "triage": {
    "dealBreakers": [
      {
        "category": "COMPLIANCE",
        "issue": "Requires SOC 2 Type II certification",
        "severity": "HIGH",
        "botAnalysis": "We have SOC 2 Type II. No blocker.",
        "status": "RESOLVED"
      }
    ],
    "riskScore": 3.2,
    "confidenceLevel": 0.87
  },
  "strategy": {
    "strategicFit": 0.92,
    "competitiveAdvantage": "Strong cloud expertise and existing client relationship",
    "winProbability": 0.78,
    "recommendedAction": "PURSUE"
  }
}
```

## 5. Environment Variables
Update your `.env.production` with actual values:
```env
VITE_FIREBASE_CONFIG={"apiKey":"AIza...","authDomain":"rfp-platform.firebaseapp.com","projectId":"rfp-platform","storageBucket":"rfp-platform.appspot.com","messagingSenderId":"123456789","appId":"1:123456789:web:abc123"}
VITE_APP_ID=production
```
