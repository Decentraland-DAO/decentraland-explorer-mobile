import { CommentList } from "../api/governance/CommentList";
import { Proposal } from "../api/governance/Proposal";
import { Vote } from "../api/governance/Vote";
import { HttpClient } from "./HttpClient";

export class GovernanceService {

  private httpClient = new HttpClient();


  public async getProposal(id: string): Promise<Proposal> {
    const url = `https://governance.decentraland.org/api/proposals/${id}`;
    const result = await this.httpClient.get(url, null);
    return result.data as Proposal;
  }

  public async getActiveProposalsCount(): Promise<number> {
    const url = "https://governance.decentraland.org/api/proposals?limit=100&offset=0&status=active";
    const result = await this.httpClient.get(url, null);
    return result.total;
  }

  public async getProposalsEndingSoonCount(): Promise<number> {
    const url = "https://governance.decentraland.org/api/proposals?limit=100&offset=0&status=active&timeFrame=2days&timeFrameKey=finish_at";
    const result = await this.httpClient.get(url, null);
    return result.total;
  }

  public async getVotesInThisWeekCount(): Promise<number> {
    const now = Math.floor((new Date().getTime() / 1000));
    const weekBefore = now - (7 * 24 * 60 * 60);
    const url = "https://hub.snapshot.org/graphql";
    const data = {
      query: `query getVotes($space: String!, $start: Int!, $end: Int!, $first: Int!, $skip: Int!) {
              votes(where: {space: $space, created_gte: $start, created_lt: $end}, orderBy: "created", orderDirection: asc, first: $first, skip: $skip) {
                voter
                created
                vp
                choice
                proposal {
                  id
                  choices
                }
              }
            }
          `,
      variables: {
        end: now,
        first: 20000,
        skip: 0,
        space: "snapshot.dcl.eth",
        start: weekBefore,
      }
    }
    const result = await this.httpClient.post(url, data);
    return result.data.votes.length;
  }

  public async getVotesIn30DaysCount(): Promise<number> {
    const now = Math.floor((new Date().getTime() / 1000));
    const thirtyDaysBefore = now - (30 * 24 * 60 * 60);
    const url = "https://hub.snapshot.org/graphql";
    const data = {
      query: `query getVotes($space: String!, $start: Int!, $end: Int!, $first: Int!, $skip: Int!) {
              votes(where: {space: $space, created_gte: $start, created_lt: $end}, orderBy: "created", orderDirection: asc, first: $first, skip: $skip) {
                voter
                created
                vp
                choice
                proposal {
                  id
                  choices
                }
              }
            }
          `,
      variables: {
        end: now,
        first: 20000,
        skip: 0,
        space: "snapshot.dcl.eth",
        start: thirtyDaysBefore,
      }
    }
    const result = await this.httpClient.post(url, data);
    return result.data.votes.length;
  }

  public async getProposalsEndingSoon(): Promise<Array<Proposal>> {
    const url = "https://governance.decentraland.org/api/proposals?limit=5&offset=0&status=active&timeFrameKey=finish_at&order=ASC";
    const result = await this.httpClient.get(url, null);
    return result.data;
  }

  public async getProposalsWithVPParticipation(): Promise<Array<Proposal>> {
    const url = "https://governance.decentraland.org/api/proposals?limit=5&offset=0&status=active&order=ASC";
    const result = await this.httpClient.get(url, null);
    return result.data;
  }

  public async getProposals(limit: number, offset: number, status?: string, type?: string, order?: string): Promise<Array<Proposal>> {
    let url = `https://governance.decentraland.org/api/proposals?limit=${limit}&offset=${offset}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    if (order) {
      url += `&order=${order}`;
    }
    const result = await this.httpClient.get(url, null);
    return result.data;
  }

  public async getProposalVotes(proposal: string): Promise<Array<Vote>> {
    const url = `https://governance.decentraland.org/api/proposals/${proposal}/votes`;
    const result = await this.httpClient.get(url, null);
    const votes: Array<Vote> = [];
    for (let d in result.data) {
      votes.push({
        profile: d,
        choice: result.data[d].choice,
        timestamp: result.data[d].timestamp,
        vp: result.data[d].vp
      });
    }

    return votes;
  }

  public async getProposalComments(id: string): Promise<CommentList | null> {
    const url = `https://governance.decentraland.org/api/proposals/${id}/comments`;
    const result = await this.httpClient.get(url, null);
    if (result.data && result.data.comments) {
      return result.data;
    }
    else {
      return null;
    }
  }

  public async getBalance(): Promise<number> {
    const url = "https://data.decentraland.vote/api.json";
    const result = await this.httpClient.get(url, null);
    let total = 0;
    for (let balance of result.balances) {
      total += balance.amount * balance.rate;
    }
    return total;
  }
}
