# RFP Qualification Platform

A multi-stage RFP (Request for Proposal) review system with Firebase integration and AI bot assistance.

## Features

- **Stage 2 Dashboard**: Business review with Go/No-Go decisions
- **Stage 3 Dashboards**: SME qualification for Legal, Finance, and Tech teams
- **Firebase Integration**: Real-time data sync with Firestore
- **Mock Data Fallback**: Works offline with demo data
- **Responsive UI**: Built with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure Firebase:
   - Create a `.env` file with your Firebase config:
   ```
   FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"..."}
   APP_ID=your-app-id
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically http://localhost:5173)

## Firestore Data Structure

```
artifacts/
  {appId}/
    public/
      rfps/
        {rfpId}/
          - title, client, status, triage, strategy
          legalQueue/
            {clauseId}/ - text, botAnalysis, botSuggestion, humanStatus
          financeQueue/
            {itemId}/ - text, botAnalysis, botSuggestion, humanStatus
          techQueue/
            {itemId}/ - text, botAnalysis, botSuggestion, humanStatus
```

## Usage

- Navigate between stages using the header buttons
- Stage 2: Review deal-breakers and approve/reject RFPs
- Stage 3: Review queue items for Legal, Finance, or Tech
- All decisions sync to Firestore in real-time (when configured)
- Yellow banner indicates mock data mode

## Technologies

- React 18
- Firebase 10 (Auth + Firestore)
- Vite (Build tool)
- Tailwind CSS (Styling)
