import { Bid } from "../models/nft/Bid";
import { Sale } from "../models/nft/Sale";
import { NFTInfo } from "../models/nft/NFTInfo";
import { Order } from "../models/nft/Order";
import { Item } from "../models/nft/Item";
import { HttpClient } from "./HttpClient";

export class NftService {
    private httpClient = new HttpClient();

    public async getLatestSales(categories: Array<"parcel" | "estate" | "ens" | "wearable">, first: number, skip: number): Promise<Array<Sale>> {
        let url = `https://nft-api.decentraland.org/v1/sales?&first=${first}&skip=${skip}&sortBy=recently_sold`;
        if (categories && categories.length > 0) {
            for (const category of categories) {
                url += `&category=${category}`;
            }
        }
        const data = await this.httpClient.get(url, null);
        const sales = data.data as Array<Sale>;
        return sales;
    }

    public async getLatestBids(contractAddress: string, first: number, skip: number): Promise<Array<Bid>> {
        const url = `https://nft-api.decentraland.org/v1/bids?contractAddress=${contractAddress}&first=${first}&skip=${skip}&sortBy=recently_offered`;
        const data = await this.httpClient.get(url, null);
        const bids = data.data as Array<Bid>;
        return bids;
    }

    public async getLatestListings(contractAddress: string, first: number, skip: number): Promise<Array<Order>> {
        const url = `https://nft-api.decentraland.org/v1/orders?contractAddress=${contractAddress}&first=${first}&skip=${skip}&status=open&sortBy=recently_listed`;
        const data = await this.httpClient.get(url, null);
        const bids = data.data as Array<Order>;
        return bids;
    }

    public async getRecentlyUpdatedListings(contractAddress: string, first: number, skip: number): Promise<Array<Order>> {
        const url = `https://nft-api.decentraland.org/v1/orders?contractAddress=${contractAddress}&first=${first}&skip=${skip}&status=open&sortBy=recently_updated`;
        const data = await this.httpClient.get(url, null);
        const bids = data.data as Array<Order>;
        return bids;
    }

    public async getNftInfo(contractAddress: string, tokenId: string): Promise<NFTInfo> {
        const url = `https://nft-api.decentraland.org/v1/nfts?contractAddress=${contractAddress}&tokenId=${tokenId}`;
        const data = await this.httpClient.get(url, null);
        const nftInfo = data.data[0] as NFTInfo;
        return nftInfo;
    }

    public async getLatestItems(first: number, skip: number): Promise<Array<Item>> {
        const url = `https://nft-api.decentraland.org/v1/items?first=${first}&skip=${skip}&order_by=newest`;
        const data = await this.httpClient.get(url, null);
        const bids = data.data as Array<Item>;
        return bids;
    }
}
