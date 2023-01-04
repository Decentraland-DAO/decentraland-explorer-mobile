import { HttpClient } from "./HttpClient";
import { Proposal } from "../models/governance/Proposal";

export class GovernanceService {
    private httpClient = new HttpClient();

    public async getLatestProposals(limit: number, offset: number): Promise<Array<Proposal>> {
        const url = `https://governance.decentraland.org/api/proposals?limit=${limit}&offset=${offset}&status=active&order=desc`;
        const result = await this.httpClient.get(url, null);
        return result.data;
    }
}
