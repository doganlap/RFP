// src/services/integrations/SalesforceService.ts

export interface SalesforceConfig {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  redirectUri: string;
}

export interface SalesforceOpportunity {
  id: string;
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
  accountId: string;
}

class SalesforceService {
  private config: SalesforceConfig | null = null;
  private accessToken: string | null = null;

  async setConfig(config: SalesforceConfig): Promise<void> {
    this.config = config;
    console.log('Salesforce configuration updated');
  }

  async connect(authCode: string): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Salesforce configuration not set');

      const response = await fetch(`${this.config.instanceUrl}/services/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
        }).toString(),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('Connected to Salesforce');
      return true;
    } catch (error) {
      console.error('Failed to connect to Salesforce:', error);
      return false;
    }
  }

  async getOpportunities(): Promise<SalesforceOpportunity[]> {
    try {
      if (!this.accessToken || !this.config) return [];

      const response = await fetch(
        `${this.config.instanceUrl}/services/data/v57.0/query?q=SELECT%20Id%2CName%2CAmount%2CStageName%2CCloseDate%2CAccountId%20FROM%20Opportunity`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const data = await response.json();
      return data.records.map((record: any) => ({
        id: record.Id,
        name: record.Name,
        amount: record.Amount,
        stage: record.StageName,
        closeDate: record.CloseDate,
        accountId: record.AccountId,
      }));
    } catch (error) {
      console.error('Failed to fetch Salesforce opportunities:', error);
      return [];
    }
  }

  async createOpportunity(opportunity: Partial<SalesforceOpportunity>): Promise<string | null> {
    try {
      if (!this.accessToken || !this.config) return null;

      const response = await fetch(
        `${this.config.instanceUrl}/services/data/v57.0/sobjects/Opportunity/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Name: opportunity.name,
            Amount: opportunity.amount,
            StageName: opportunity.stage,
            CloseDate: opportunity.closeDate,
            AccountId: opportunity.accountId,
          }),
        }
      );

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create Salesforce opportunity:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }
}

export default new SalesforceService();
