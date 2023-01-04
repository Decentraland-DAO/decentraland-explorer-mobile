import { Collection } from "../api/marketplace/Collection";
import { Item } from "../api/marketplace/Item";
import { NFTInfo } from "../api/nft/NFTInfo";
import { Sale } from "../api/nft/Sale";
import { HttpClient } from "./HttpClient";

export class MarketplaceService {

    private httpClient = new HttpClient();

    public async getNewestWearables(): Promise<Array<Item>> {
        return await this.getItems("wearable", "", [], "", "", "", 24, 0, "recently_reviewed", true);
    }

    public async getNewestEmotes(): Promise<Array<Item>> {
        return await this.getItems("emote", "", [], "", "", "", 24, 0, "recently_reviewed", true);
    }

    public async getItems(category: string, wearableCategory: string, rarity: Array<string>, gender: string, network: string, collection: string, first: number, skip: number, sortBy: string, isOnSale?: boolean, creator?: string): Promise<Array<Item>> {
        let url = `https://nft-api.decentraland.org/v1/items?`;
        if (category) {
            url += `&category=${category}`
        }

        if (wearableCategory && wearableCategory !== "all") {
            if (wearableCategory !== "head" && wearableCategory !== "accessory") {
                url += `&${category}Category=${wearableCategory}`;
            }
            else {
                if (wearableCategory === "head") {
                    url += "&isWearableHead=true"
                }
                else if (wearableCategory === "accessory") {
                    url += "&isWerableAccessory=true"
                }
            }
        }

        if (gender && gender !== "all") {
            url += `&${category}Gender=${gender}`;
        }

        if (network && network !== "all") {
            url += `&network=${network}`;
        }

        if (rarity && rarity.length > 0) {
            for (const r of rarity) {
                url += `&rarity=${r}`;
            }
        }

        if (collection && collection !== "all") {
            url += `&contractAddress=${collection}`;
        }

        if (sortBy) {
            url += `&sortBy=${sortBy}`;
        }
        if (first >= 0) {
            url += `&first=${first}`;
        }
        if (skip >= 0) {
            url += `&skip=${skip}`;
        }
        if (isOnSale !== undefined) {
            url += `&isOnSale=${isOnSale}`;
        }
        if (creator) {
            url += `&creator=${creator}`;
        }
        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<Item>;
        return items;
    }

    public async getItem(contractAddress: string, itemId: string): Promise<Item> {
        const url = `https://nft-api.decentraland.org/v1/items?contractAddress=${contractAddress}&itemId=${itemId}`;
        const data = await this.httpClient.get(url, null);
        const item = data.data[0];
        return item;
    }

    public async getWearables(keyword: string, category: string | undefined, subCategory: string | undefined, rarity: Array<string>, gender: string, network: string, collection: string, first: number, skip: number, sortBy: string): Promise<Array<Item>> {
        if (sortBy === "recently_listed") {
            sortBy = "recently_reviewed";
        }
        let url = `https://nft-api.decentraland.org/v1/items?category=wearable&search=${keyword}&first=${first}&skip=${skip}&sortBy=${sortBy}&isOnSale=true`;
        if (category && category !== "all") {
            if (category !== "head" && category !== "accessory") {
                url += `&wearableCategory=${category}`;
            }
            else {
                if (subCategory !== "all") {
                    url += `&wearableCategory=${subCategory}`;
                }
                else if (category === "head") {
                    url += "&isWearableHead=true"
                }
                else if (category === "accessory") {
                    url += "&isWerableAccessory=true"
                }
            }
        }

        if (gender !== "all") {
            url += `&wearableGender=${gender}`;
        }

        if (network !== "all") {
            url += `&network=${network}`;
        }

        if (rarity && rarity.length > 0) {
            for (const r of rarity) {
                url += `&rarity=${r}`;
            }
        }

        if (collection !== "all") {
            url += `&contractAddress=${collection}`;
        }

        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<Item>;
        return items;
    }

    public async getEmotes(keyword: string, category: string | undefined, subCategory: string | undefined, rarity: Array<string>, gender: string, network: string, collection: string, first: number, skip: number, sortBy: string): Promise<Array<Item>> {
        if (sortBy === "recently_listed") {
            sortBy = "recently_reviewed";
        }
        let url = `https://nft-api.decentraland.org/v1/items?category=emote&search=${keyword}&first=${first}&skip=${skip}&sortBy=${sortBy}&isOnSale=true`;
        if (category && category !== "all") {
            url += `&emoteCategory=${category}`;
        }

        if (gender !== "all") {
            url += `&emoteGender=${gender}`;
        }

        if (network !== "all") {
            url += `&network=${network}`;
        }

        if (rarity && rarity.length > 0) {
            for (const r of rarity) {
                url += `&rarity=${r}`;
            }
        }

        if (collection !== "all") {
            url += `&contractAddress=${collection}`;
        }

        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<Item>;
        return items;
    }

    public async getNewestLands(): Promise<Array<NFTInfo>> {
        return await this.getLands("", 24, 0, "recently_listed");
    }

    public async getLands(keyword: string, first: number, skip: number, sortBy: string): Promise<Array<NFTInfo>> {
        const url = `https://nft-api.decentraland.org/v1/nfts?search=${keyword}&first=${first}&skip=${skip}&sortBy=${sortBy}&isOnSale=true&isLand=true`;
        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<NFTInfo>;
        return items;
    }

    public async getNewestNames(): Promise<Array<NFTInfo>> {
        return await this.getNames("", 24, 0, "recently_listed");
    }

    public async getNames(keyword: string, first: number, skip: number, sortBy: string): Promise<Array<NFTInfo>> {
        const url = `https://nft-api.decentraland.org/v1/nfts?search=${keyword}&category=ens&first=${first}&skip=${skip}&sortBy=${sortBy}&isOnSale=true`;
        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<NFTInfo>;
        return items;
    }

    public async getCollections(): Promise<Array<Collection>> {
        const url = `https://nft-api.decentraland.org/v1/contracts?first=0`;
        const data = await this.httpClient.get(url, null);
        const items = data.data as Array<Collection>;
        return items;
    }

    public async getItemSales(contractAddress: string, itemId: string, first: number, skip: number): Promise<Array<Sale>> {
        const url = `https://nft-api.decentraland.org/v1/sales?contractAddress=${contractAddress}&first=${first}&skip=${skip}&itemId=${itemId}`;
        const data = await this.httpClient.get(url, null);
        const sales = data.data as Array<Sale>;
        return sales;
    }
}
