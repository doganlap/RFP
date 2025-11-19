# RFP Platform - New Features Implementation

## Overview

This document describes the complete implementation of six major feature modules for the Enterprise RFP Platform:

1. **Win/Loss Analysis Module**
2. **CRM Integrations (Salesforce, HubSpot)**
3. **Email Integrations (Office 365, Gmail)**
4. **Notification Services (Slack, Teams)**
5. **DocuSign Signature Integration**
6. **Collaboration Features (Comments, Mentions, Discussions)**

## Architecture

### Service Layer

All integrations are implemented as singleton services located in `src/services/integrations/`:

- `SalesforceService.ts` - Salesforce CRM connector
- `HubSpotService.ts` - HubSpot CRM connector
- `Office365Service.ts` - Microsoft email service
- `GmailService.ts` - Google email service
- `SlackService.ts` - Slack notifications
- `TeamsService.ts` - Microsoft Teams notifications
- `DocuSignService.ts` - DocuSign eSignature service

### Higher-Level Services

- `AnalyticsService.ts` - Win/Loss analysis data
- `CRMService.ts` - Unified CRM interface for both Salesforce and HubSpot
- `NotificationService.ts` - Multi-channel notification dispatcher
- `DocumentSignatureService.ts` - DocuSign signature tracking

### Components

**Collaboration Components** (`src/components/collaboration/`):
- `Comments.tsx` - Thread-based commenting system
- `Mentions.tsx` - User mentions and notifications
- `Discussions.tsx` - Topic-based discussions

**Main Components**:
- `WinLossAnalysis.tsx` - Win/Loss analytics dashboard
- `Collaboration.tsx` - Unified collaboration interface
- `settings/IntegrationSettings.tsx` - Integration configuration UI

## Database Schema

### New Tables Added

**win_loss_analysis** - Track RFP outcomes and reasons
- Stores whether RFPs were won or lost
- Captures win/loss reasons and competitor information
- Links to RFP and user for analysis tracking

**comments** - Thread-based comments
- Parent-child relationships for comment threads
- Resource-agnostic (works with RFPs, tasks, documents)
- Timestamp and user tracking

**mentions** - User mention tracking
- Links mentions to comments
- Tracks read/unread status
- Used for notifications

**discussions** - Discussion threads
- RFP-specific discussion topics
- Resolution status tracking
- Message count and timestamps

**integration_logs** - Integration activity tracking
- Request/response logging
- Error tracking and debugging
- Audit trail for integrations

**docusign_envelopes** - Signature request tracking
- Tracks DocuSign envelope IDs
- Records signer emails and timestamps
- Tracks completion status

## Features

### 1. Win/Loss Analysis Module

**File**: `src/components/WinLossAnalysis.tsx`

**Features**:
- Dashboard with key metrics (total RFPs, wins, losses, win rate)
- Tabbed interface (Overview, Won Deals, Lost Deals)
- Detailed listing of won and lost opportunities
- Win/loss reason analysis
- Filterable data views

**Services Used**:
- `AnalyticsService.getWinLossData()`
- `AnalyticsService.getWinReasons()`
- `AnalyticsService.getLossReasons()`
- `AnalyticsService.getWinRateByCategory()`

### 2. CRM Integrations

#### Salesforce

**File**: `src/services/integrations/SalesforceService.ts`

**Methods**:
- `setConfig(config)` - Configure Salesforce connection
- `connect(authCode)` - OAuth authentication
- `getOpportunities()` - Fetch opportunities
- `createOpportunity(opportunity)` - Create new opportunity
- `isConnected()` - Check connection status

**Configuration Required**:
- Client ID
- Client Secret
- Instance URL
- Redirect URI

#### HubSpot

**File**: `src/services/integrations/HubSpotService.ts`

**Methods**:
- `setConfig(config)` - Configure HubSpot connection
- `connect()` - Verify API key
- `getDeals(limit)` - Fetch deals
- `createDeal(deal)` - Create new deal
- `isConnected()` - Check connection status

**Configuration Required**:
- API Key
- Portal ID

**CRM Service Wrapper**:

**File**: `src/services/CRMService.ts`

Provides unified interface for both CRMs:
- `syncOpportunitiesSalesforce()` - Get Salesforce opportunities
- `syncOpportunitiesHubSpot()` - Get HubSpot deals
- `syncAllOpportunities()` - Combined sync with deduplication
- `createOpportunitySalesforce()` - Create in Salesforce
- `createOpportunityHubSpot()` - Create in HubSpot

### 3. Email Integrations

#### Office 365

**File**: `src/services/integrations/Office365Service.ts`

**Methods**:
- `setConfig(config)` - Configure Office 365
- `connect(authCode)` - OAuth authentication
- `sendEmail(message)` - Send email via Microsoft Graph API
- `isConnected()` - Check connection status

**Configuration Required**:
- Client ID
- Client Secret
- Tenant ID
- Redirect URI

#### Gmail

**File**: `src/services/integrations/GmailService.ts`

**Methods**:
- `setConfig(config)` - Configure Gmail
- `connect(authCode)` - OAuth authentication
- `sendEmail(message)` - Send email via Gmail API
- `isConnected()` - Check connection status

**Configuration Required**:
- Client ID
- Client Secret
- Redirect URI

### 4. Notification Services

#### Slack

**File**: `src/services/integrations/SlackService.ts`

**Methods**:
- `setConfig(config)` - Configure Slack bot
- `connect()` - Verify bot connection
- `sendMessage(message)` - Send raw message
- `sendNotification(channel, title, message)` - Send formatted notification
- `isConnected()` - Check connection status

**Configuration Required**:
- Bot Token
- App ID
- Signing Secret

#### Microsoft Teams

**File**: `src/services/integrations/TeamsService.ts`

**Methods**:
- `setConfig(config)` - Configure Teams webhook
- `connect()` - Verify webhook URL
- `sendMessage(message)` - Send adaptive card message
- `sendNotification(title, message, facts)` - Send formatted notification
- `isConnected()` - Check connection status

**Configuration Required**:
- Webhook URL

**Notification Service Wrapper**:

**File**: `src/services/NotificationService.ts`

Provides multi-channel notification dispatch:
- `notifySlack(channel, payload)` - Send to Slack
- `notifyTeams(payload)` - Send to Teams
- `notifyEmail(recipients, payload)` - Send via email (Office 365 or Gmail)
- `notifyAll(channels, payload)` - Send to multiple channels

### 5. DocuSign Integration

**File**: `src/services/integrations/DocuSignService.ts`

**Methods**:
- `setConfig(config)` - Configure DocuSign
- `connect(authCode)` - OAuth authentication
- `requestSignature(request)` - Request signatures on document
- `getEnvelopeStatus(envelopeId)` - Track signature status
- `isConnected()` - Check connection status

**Configuration Required**:
- Client ID
- Client Secret
- Account ID
- Redirect URI
- User ID

**Document Signature Service Wrapper**:

**File**: `src/services/DocumentSignatureService.ts`

Higher-level interface:
- `requestSignatures()` - Request signatures with automatic setup
- `trackSignatureStatus()` - Monitor signature progress

### 6. Collaboration Features

#### Comments

**File**: `src/components/collaboration/Comments.tsx`

**Features**:
- Thread-based comment system
- Support for nested replies
- Resource-agnostic (RFPs, tasks, documents)
- Read/unread tracking
- Timestamp and author information

**Props**:
- `resourceId` - ID of resource being commented on
- `resourceType` - Type of resource (rfp, task, document)
- `onCommentAdded` - Callback when comment is added

#### Mentions

**File**: `src/components/collaboration/Mentions.tsx`

**Features**:
- User mention tracking
- Read/unread notification status
- Context display
- Mark as read functionality
- Timestamp tracking

**Props**:
- `onMentionRead` - Callback when mention is read

#### Discussions

**File**: `src/components/collaboration/Discussions.tsx`

**Features**:
- Topic-based discussion threads
- Resolved/open status tracking
- Message count tracking
- Creation and last message timestamps
- Quick resolve/reopen toggle

**Props**:
- `rfpId` - Associated RFP ID
- `onDiscussionCreated` - Callback when discussion is created

#### Collaboration Component

**File**: `src/components/Collaboration.tsx`

Unified interface combining all collaboration features:
- Tabbed navigation (Comments, Mentions, Discussions)
- Centralized state management
- Resource-specific context

## Routes

New routes added to `src/config/routes.ts`:

```typescript
RFP: {
  ...
  COLLABORATION: '/rfps/:id/collaboration',
  WIN_LOSS: '/rfps/:id/win-loss',
}

ANALYTICS: {
  WIN_LOSS: '/analytics/win-loss',
  DASHBOARD: '/analytics/dashboard',
}
```

## Integration Settings UI

**File**: `src/components/settings/IntegrationSettings.tsx`

**Features**:
- Grid layout of all integrations
- Connection status indicators
- Modal configuration form
- Dynamic field generation based on integration
- Save and test configuration
- Last sync timestamps

## Usage Examples

### Using CRM Service

```typescript
import CRMService from '../services/CRMService';

// Sync opportunities from both CRMs
const opportunities = await CRMService.syncAllOpportunities();

// Create in Salesforce
const oppId = await CRMService.createOpportunitySalesforce(
  'Deal Name',
  250000,
  'Proposal/Quote',
  '2025-03-15',
  'acc_12345'
);
```

### Sending Notifications

```typescript
import NotificationService from '../services/NotificationService';

// Send to Slack
await NotificationService.notifySlack('#sales', {
  title: 'RFP Won!',
  message: 'Enterprise Deal RFP-2025-001 has been won',
  type: 'success',
});

// Send to multiple channels
await NotificationService.notifyAll(['slack', 'teams', 'email'], {
  title: 'Important Update',
  message: 'RFP status has changed',
  context: { rfpId: 'RFP-001', newStatus: 'Submission' },
});
```

### Requesting Signatures

```typescript
import DocumentSignatureService from '../services/DocumentSignatureService';

const envelopeId = await DocumentSignatureService.requestSignatures(
  base64EncodedPDF,
  'contract.pdf',
  [
    { email: 'john@example.com', name: 'John Doe' },
    { email: 'jane@example.com', name: 'Jane Smith' },
  ],
  'Please sign the attached contract',
  'This is our standard MSA. Please review and sign.'
);

// Track status
const status = await DocumentSignatureService.trackSignatureStatus(envelopeId);
```

### Using Comments

```typescript
import Comments from '../components/collaboration/Comments';

<Comments
  resourceId="rfp-123"
  resourceType="rfp"
  onCommentAdded={(comment) => console.log('Comment added:', comment)}
/>
```

## API Endpoints (To Be Implemented)

The following backend endpoints should be created:

### Analytics
- `GET /api/analytics/win-loss` - Get win/loss data
- `GET /api/analytics/win-reasons` - Get win reasons breakdown
- `GET /api/analytics/loss-reasons` - Get loss reasons breakdown
- `GET /api/analytics/win-rate` - Get win rate by category

### CRM
- `GET /api/crm/salesforce/opportunities` - Salesforce opportunities
- `GET /api/crm/hubspot/deals` - HubSpot deals
- `POST /api/crm/salesforce/opportunities` - Create Salesforce opportunity
- `POST /api/crm/hubspot/deals` - Create HubSpot deal

### Collaboration
- `GET /api/comments` - Get comments for resource
- `POST /api/comments` - Create comment
- `GET /api/mentions` - Get user mentions
- `PUT /api/mentions/:id/read` - Mark mention as read
- `GET /api/discussions` - Get discussions for RFP
- `POST /api/discussions` - Create discussion

### Integrations
- `POST /api/integrations/:type/connect` - Connect integration
- `GET /api/integrations/:type/status` - Check integration status
- `POST /api/integrations/:type/test` - Test integration
- `GET /api/integrations/logs` - Get integration logs

### Signatures
- `POST /api/signatures/request` - Request signatures
- `GET /api/signatures/:envelopeId/status` - Get signature status
- `GET /api/signatures` - List all signature requests

## Security Considerations

1. **OAuth Flows**: All OAuth-based integrations should be handled server-side
2. **API Key Storage**: Store API keys in environment variables or secure vaults
3. **Webhook Validation**: Verify webhook signatures from Slack, Teams, DocuSign
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Error Handling**: Never expose sensitive data in error messages

## Next Steps

1. Implement backend API endpoints
2. Add OAuth redirect handlers
3. Configure environment variables for integration credentials
4. Add error handling and retry logic
5. Implement caching for integration data
6. Add logging and monitoring
7. Create admin configuration UI
8. Add integration health checks
9. Implement notification preferences
10. Add bulk operations for CRM sync

## Testing

Manual testing checklist:

- [ ] Win/Loss Analysis loads correctly
- [ ] All CRM fields validate properly
- [ ] Email services handle attachments
- [ ] Notifications format correctly for each channel
- [ ] DocuSign requests create envelopes
- [ ] Comments save and retrieve correctly
- [ ] Mentions notify users appropriately
- [ ] Discussions track resolution status
- [ ] Integration settings persist configuration
- [ ] Error states display helpful messages
