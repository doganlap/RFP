// src/services/integrations/HubSpotService.ts

export interface HubSpotConfig {
  apiKey: string;
  portalId: string;
}

export interface HubSpotDeal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
  ownerEmail: string;
}

class HubSpotService {
  private config: HubSpotConfig | null = null;
  private readonly baseUrl = 'https://api.hubapi.com';

  async setConfig(config: HubSpotConfig): Promise<void> {
    this.config = config;
    console.log('HubSpot configuration updated');
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config) throw new Error('HubSpot configuration not set');

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals?limit=1`, {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });

      if (response.ok) {
        console.log('Connected to HubSpot');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect to HubSpot:', error);
      return false;
    }
  }

  async getDeals(limit: number = 100): Promise<HubSpotDeal[]> {
    try {
      if (!this.config) return [];

      const response = await fetch(
        `${this.baseUrl}/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate,hubspot_owner_email`,
        {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
        }
      );

      const data = await response.json();
      return data.results.map((result: any) => ({
        id: result.id,
        name: result.properties.dealname,
        amount: result.properties.amount ? parseFloat(result.properties.amount) : 0,
        stage: result.properties.dealstage,
        closeDate: result.properties.closedate,
        ownerEmail: result.properties.hubspot_owner_email,
      }));
    } catch (error) {
      console.error('Failed to fetch HubSpot deals:', error);
      return [];
    }
  }

  async createDeal(deal: Partial<HubSpotDeal>): Promise<string | null> {
    try {
      if (!this.config) return null;

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            dealname: deal.name,
            amount: deal.amount,
            dealstage: deal.stage,
            closedate: deal.closeDate,
            hubspot_owner_email: deal.ownerEmail,
          },
        }),
      });

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Failed to create HubSpot deal:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return !!this.config?.apiKey;
  }
}

export default new HubSpotService();
