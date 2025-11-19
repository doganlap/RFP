// src/services/CRMService.ts
import SalesforceService from './integrations/SalesforceService';
import HubSpotService from './integrations/HubSpotService';

export interface CRMOpportunity {
  id: string;
  name: string;
  amount: number;
  stage: string;
  closeDate: string;
  source: 'salesforce' | 'hubspot';
}

class CRMService {
  async syncOpportunitiesSalesforce(): Promise<CRMOpportunity[]> {
    try {
      if (!SalesforceService.isConnected()) {
        console.log('Salesforce not connected');
        return [];
      }

      const opportunities = await SalesforceService.getOpportunities();
      return opportunities.map((opp) => ({
        ...opp,
        source: 'salesforce' as const,
      }));
    } catch (error) {
      console.error('Failed to sync Salesforce opportunities:', error);
      return [];
    }
  }

  async syncOpportunitiesHubSpot(): Promise<CRMOpportunity[]> {
    try {
      if (!HubSpotService.isConnected()) {
        console.log('HubSpot not connected');
        return [];
      }

      const deals = await HubSpotService.getDeals();
      return deals.map((deal) => ({
        id: deal.id,
        name: deal.name,
        amount: deal.amount,
        stage: deal.stage,
        closeDate: deal.closeDate,
        source: 'hubspot' as const,
      }));
    } catch (error) {
      console.error('Failed to sync HubSpot deals:', error);
      return [];
    }
  }

  async syncAllOpportunities(): Promise<CRMOpportunity[]> {
    const salesforceOpps = await this.syncOpportunitiesSalesforce();
    const hubspotOpps = await this.syncOpportunitiesHubSpot();

    // Combine and deduplicate
    const combined = [...salesforceOpps, ...hubspotOpps];
    const deduped = combined.reduce((acc, curr) => {
      const exists = acc.find((a) => a.name === curr.name && a.amount === curr.amount);
      return exists ? acc : [...acc, curr];
    }, [] as CRMOpportunity[]);

    return deduped;
  }

  async createOpportunitySalesforce(
    name: string,
    amount: number,
    stage: string,
    closeDate: string,
    accountId: string
  ): Promise<string | null> {
    try {
      if (!SalesforceService.isConnected()) {
        console.log('Salesforce not connected');
        return null;
      }

      return await SalesforceService.createOpportunity({
        name,
        amount,
        stage,
        closeDate,
        accountId,
      });
    } catch (error) {
      console.error('Failed to create Salesforce opportunity:', error);
      return null;
    }
  }

  async createOpportunityHubSpot(
    name: string,
    amount: number,
    stage: string,
    closeDate: string,
    ownerEmail: string
  ): Promise<string | null> {
    try {
      if (!HubSpotService.isConnected()) {
        console.log('HubSpot not connected');
        return null;
      }

      return await HubSpotService.createDeal({
        name,
        amount,
        stage,
        closeDate,
        ownerEmail,
      });
    } catch (error) {
      console.error('Failed to create HubSpot deal:', error);
      return null;
    }
  }
}

export default new CRMService();
