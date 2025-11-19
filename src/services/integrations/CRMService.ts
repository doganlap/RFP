/**
 * CRM Integration Service
 * Salesforce and HubSpot connectors for RFP synchronization
 */

export interface CRMContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title?: string;
  phone?: string;
  source: 'salesforce' | 'hubspot';
}

export interface CRMOpportunity {
  id: string;
  name: string;
  accountName: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate: string;
  contactId: string;
  source: 'salesforce' | 'hubspot';
  customFields?: Record<string, any>;
}

export interface CRMSyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  syncedAt: string;
}

/**
 * Salesforce Integration
 */
export class SalesforceService {
  private instanceUrl: string;
  private accessToken: string;
  private apiVersion: string = 'v59.0';

  constructor() {
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || '';
    this.accessToken = process.env.SALESFORCE_ACCESS_TOKEN || '';
  }

  /**
   * Authenticate with Salesforce using OAuth 2.0
   */
  async authenticate(clientId: string, clientSecret: string, username: string, password: string): Promise<void> {
    try {
      const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Salesforce authentication failed');
      }

      const data = await response.json();
      this.instanceUrl = data.instance_url;
      this.accessToken = data.access_token;

      // Store tokens securely (implement proper token storage)
      console.log('Salesforce authenticated successfully');
    } catch (error) {
      console.error('Salesforce authentication error:', error);
      throw error;
    }
  }

  /**
   * Create RFP opportunity in Salesforce
   */
  async createOpportunity(rfpData: {
    name: string;
    accountName: string;
    amount: number;
    closeDate: string;
    stage: string;
    description?: string;
  }): Promise<string> {
    try {
      const response = await fetch(
        `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/Opportunity`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Name: rfpData.name,
            AccountId: await this.findOrCreateAccount(rfpData.accountName),
            Amount: rfpData.amount,
            CloseDate: rfpData.closeDate,
            StageName: rfpData.stage,
            Description: rfpData.description,
            Type: 'New Business',
            LeadSource: 'RFP Platform'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create Salesforce opportunity');
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Salesforce opportunity creation error:', error);
      throw error;
    }
  }

  /**
   * Update RFP opportunity in Salesforce
   */
  async updateOpportunity(opportunityId: string, updates: Partial<{
    stageName: string;
    amount: number;
    probability: number;
    closeDate: string;
    description: string;
  }>): Promise<void> {
    try {
      const sfUpdates: any = {};
      if (updates.stageName) sfUpdates.StageName = updates.stageName;
      if (updates.amount) sfUpdates.Amount = updates.amount;
      if (updates.probability) sfUpdates.Probability = updates.probability;
      if (updates.closeDate) sfUpdates.CloseDate = updates.closeDate;
      if (updates.description) sfUpdates.Description = updates.description;

      const response = await fetch(
        `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/Opportunity/${opportunityId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(sfUpdates)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update Salesforce opportunity');
      }
    } catch (error) {
      console.error('Salesforce opportunity update error:', error);
      throw error;
    }
  }

  /**
   * Get contacts from Salesforce
   */
  async getContacts(accountName?: string): Promise<CRMContact[]> {
    try {
      let query = 'SELECT Id, Email, FirstName, LastName, Account.Name, Title, Phone FROM Contact';
      if (accountName) {
        query += ` WHERE Account.Name = '${accountName.replace(/'/g, "\\'")}'`;
      }
      query += ' LIMIT 200';

      const response = await fetch(
        `${this.instanceUrl}/services/data/${this.apiVersion}/query?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Salesforce contacts');
      }

      const data = await response.json();
      return data.records.map((record: any) => ({
        id: record.Id,
        email: record.Email,
        firstName: record.FirstName,
        lastName: record.LastName,
        company: record.Account?.Name || '',
        title: record.Title,
        phone: record.Phone,
        source: 'salesforce' as const
      }));
    } catch (error) {
      console.error('Salesforce contacts fetch error:', error);
      throw error;
    }
  }

  /**
   * Sync RFP status to Salesforce
   */
  async syncRFPStatus(rfpId: string, opportunityId: string, status: string, stage: string): Promise<CRMSyncResult> {
    try {
      await this.updateOpportunity(opportunityId, {
        stageName: this.mapRFPStageToSalesforce(stage),
        description: `RFP Status: ${status}\nRFP ID: ${rfpId}\nLast synced: ${new Date().toISOString()}`
      });

      return {
        success: true,
        recordsProcessed: 1,
        errors: [],
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        syncedAt: new Date().toISOString()
      };
    }
  }

  private async findOrCreateAccount(accountName: string): Promise<string> {
    // Query for existing account
    const query = `SELECT Id FROM Account WHERE Name = '${accountName.replace(/'/g, "\\'")}'`;
    const response = await fetch(
      `${this.instanceUrl}/services/data/${this.apiVersion}/query?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    if (data.records && data.records.length > 0) {
      return data.records[0].Id;
    }

    // Create new account
    const createResponse = await fetch(
      `${this.instanceUrl}/services/data/${this.apiVersion}/sobjects/Account`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: accountName
        })
      }
    );

    const createData = await createResponse.json();
    return createData.id;
  }

  private mapRFPStageToSalesforce(rfpStage: string): string {
    const stageMapping: Record<string, string> = {
      'intake': 'Prospecting',
      'qualification': 'Qualification',
      'solution-design': 'Needs Analysis',
      'pricing': 'Proposal/Price Quote',
      'review': 'Negotiation/Review',
      'submitted': 'Closed Won',
      'won': 'Closed Won',
      'lost': 'Closed Lost'
    };
    return stageMapping[rfpStage] || 'Qualification';
  }
}

/**
 * HubSpot Integration
 */
export class HubSpotService {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = process.env.HUBSPOT_API_KEY || '';
  }

  /**
   * Create deal in HubSpot
   */
  async createDeal(rfpData: {
    name: string;
    amount: number;
    closeDate: string;
    stage: string;
    associatedCompanyId?: string;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            dealname: rfpData.name,
            amount: rfpData.amount,
            closedate: rfpData.closeDate,
            dealstage: rfpData.stage,
            pipeline: 'default',
            dealtype: 'newbusiness',
            hs_object_source: 'RFP Platform'
          },
          associations: rfpData.associatedCompanyId ? [
            {
              to: { id: rfpData.associatedCompanyId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 5 }]
            }
          ] : []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create HubSpot deal');
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('HubSpot deal creation error:', error);
      throw error;
    }
  }

  /**
   * Update deal in HubSpot
   */
  async updateDeal(dealId: string, updates: Record<string, any>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals/${dealId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update HubSpot deal');
      }
    } catch (error) {
      console.error('HubSpot deal update error:', error);
      throw error;
    }
  }

  /**
   * Get contacts from HubSpot
   */
  async getContacts(companyName?: string): Promise<CRMContact[]> {
    try {
      let url = `${this.baseUrl}/crm/v3/objects/contacts?limit=200&properties=email,firstname,lastname,company,jobtitle,phone`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch HubSpot contacts');
      }

      const data = await response.json();
      let contacts = data.results.map((contact: any) => ({
        id: contact.id,
        email: contact.properties.email,
        firstName: contact.properties.firstname,
        lastName: contact.properties.lastname,
        company: contact.properties.company,
        title: contact.properties.jobtitle,
        phone: contact.properties.phone,
        source: 'hubspot' as const
      }));

      if (companyName) {
        contacts = contacts.filter((c: CRMContact) =>
          c.company.toLowerCase().includes(companyName.toLowerCase())
        );
      }

      return contacts;
    } catch (error) {
      console.error('HubSpot contacts fetch error:', error);
      throw error;
    }
  }

  /**
   * Sync RFP status to HubSpot
   */
  async syncRFPStatus(rfpId: string, dealId: string, status: string, stage: string): Promise<CRMSyncResult> {
    try {
      await this.updateDeal(dealId, {
        dealstage: this.mapRFPStageToHubSpot(stage),
        hs_lastmodifieddate: new Date().toISOString(),
        rfp_id: rfpId,
        rfp_status: status
      });

      return {
        success: true,
        recordsProcessed: 1,
        errors: [],
        syncedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        syncedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Create or update company in HubSpot
   */
  async findOrCreateCompany(companyName: string, domain?: string): Promise<string> {
    try {
      // Search for existing company
      const searchResponse = await fetch(`${this.baseUrl}/crm/v3/objects/companies/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'name',
              operator: 'EQ',
              value: companyName
            }]
          }]
        })
      });

      const searchData = await searchResponse.json();
      if (searchData.results && searchData.results.length > 0) {
        return searchData.results[0].id;
      }

      // Create new company
      const createResponse = await fetch(`${this.baseUrl}/crm/v3/objects/companies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            name: companyName,
            domain: domain || ''
          }
        })
      });

      const createData = await createResponse.json();
      return createData.id;
    } catch (error) {
      console.error('HubSpot company creation error:', error);
      throw error;
    }
  }

  private mapRFPStageToHubSpot(rfpStage: string): string {
    const stageMapping: Record<string, string> = {
      'intake': 'qualifiedtobuy',
      'qualification': 'qualifiedtobuy',
      'solution-design': 'presentationscheduled',
      'pricing': 'decisionmakerboughtin',
      'review': 'contractsent',
      'submitted': 'closedwon',
      'won': 'closedwon',
      'lost': 'closedlost'
    };
    return stageMapping[rfpStage] || 'qualifiedtobuy';
  }
}

/**
 * Unified CRM Service
 */
export class CRMService {
  private salesforce: SalesforceService;
  private hubspot: HubSpotService;
  private activeCRM: 'salesforce' | 'hubspot' | 'both';

  constructor(activeCRM: 'salesforce' | 'hubspot' | 'both' = 'both') {
    this.salesforce = new SalesforceService();
    this.hubspot = new HubSpotService();
    this.activeCRM = activeCRM;
  }

  async syncRFPToCRM(rfpData: {
    id: string;
    name: string;
    client: string;
    amount: number;
    closeDate: string;
    stage: string;
    status: string;
  }): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];

    if (this.activeCRM === 'salesforce' || this.activeCRM === 'both') {
      try {
        // Create or update in Salesforce
        const opportunityId = await this.salesforce.createOpportunity({
          name: rfpData.name,
          accountName: rfpData.client,
          amount: rfpData.amount,
          closeDate: rfpData.closeDate,
          stage: rfpData.stage
        });

        const sfResult = await this.salesforce.syncRFPStatus(
          rfpData.id,
          opportunityId,
          rfpData.status,
          rfpData.stage
        );
        results.push(sfResult);
      } catch (error) {
        console.error('Salesforce sync error:', error);
        results.push({
          success: false,
          recordsProcessed: 0,
          errors: [error instanceof Error ? error.message : 'Salesforce sync failed'],
          syncedAt: new Date().toISOString()
        });
      }
    }

    if (this.activeCRM === 'hubspot' || this.activeCRM === 'both') {
      try {
        // Create or update in HubSpot
        const dealId = await this.hubspot.createDeal({
          name: rfpData.name,
          amount: rfpData.amount,
          closeDate: rfpData.closeDate,
          stage: rfpData.stage
        });

        const hsResult = await this.hubspot.syncRFPStatus(
          rfpData.id,
          dealId,
          rfpData.status,
          rfpData.stage
        );
        results.push(hsResult);
      } catch (error) {
        console.error('HubSpot sync error:', error);
        results.push({
          success: false,
          recordsProcessed: 0,
          errors: [error instanceof Error ? error.message : 'HubSpot sync failed'],
          syncedAt: new Date().toISOString()
        });
      }
    }

    return results;
  }

  async getAllContacts(companyName?: string): Promise<CRMContact[]> {
    const allContacts: CRMContact[] = [];

    if (this.activeCRM === 'salesforce' || this.activeCRM === 'both') {
      try {
        const sfContacts = await this.salesforce.getContacts(companyName);
        allContacts.push(...sfContacts);
      } catch (error) {
        console.error('Salesforce contacts error:', error);
      }
    }

    if (this.activeCRM === 'hubspot' || this.activeCRM === 'both') {
      try {
        const hsContacts = await this.hubspot.getContacts(companyName);
        allContacts.push(...hsContacts);
      } catch (error) {
        console.error('HubSpot contacts error:', error);
      }
    }

    return allContacts;
  }
}

export default CRMService;
