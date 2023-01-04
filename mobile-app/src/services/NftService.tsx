import { Bid } from "../api/nft/Bid";
import { NFTInfo } from "../api/nft/NFTInfo";
import { Sale } from "../api/nft/Sale";
import { Contracts } from "../common/Contracts";
import { HttpClient } from "./HttpClient";

export class NftService {

    private httpClient = new HttpClient();

    public async getEstateNftInfo(tokenId: string): Promise<NFTInfo> {
        return await this.getNftInfo(Contracts.ESTATE, tokenId)
    }

    public async getParcelNftInfo(tokenId: string): Promise<NFTInfo> {
        return await this.getNftInfo(Contracts.PARCEL, tokenId);
    }

    public async getNftInfo(contractAddress: string, tokenId: string): Promise<NFTInfo> {
        const url = `https://nft-api.decentraland.org/v1/nfts?contractAddress=${contractAddress}&tokenId=${tokenId}`;
        const data = await this.httpClient.get(url, null);
        const nftInfo = data.data[0] as NFTInfo;
        return nftInfo;
    }

    public async getEstateSales(tokenId: string, first: number, skip: number): Promise<Array<Sale>> {
        return await this.getSales(Contracts.ESTATE, tokenId, first, skip)
    }

    public async getParcelSales(tokenId: string, first: number, skip: number): Promise<Array<Sale>> {
        return await this.getSales(Contracts.PARCEL, tokenId, first, skip);
    }

    public async getEstateBids(tokenId: string): Promise<Array<Bid>> {
        return await this.getBids(Contracts.ESTATE, tokenId)
    }

    public async getParcelBids(tokenId: string): Promise<Array<Bid>> {
        return await this.getBids(Contracts.PARCEL, tokenId);
    }

    public async getSales(contractAddress: string, tokenId: string, first: number, skip: number): Promise<Array<Sale>> {
        const url = `https://nft-api.decentraland.org/v1/sales?contractAddress=${contractAddress}&first=${first}&skip=${skip}&tokenId=${tokenId}`;
        const data = await this.httpClient.get(url, null);
        const sales = data.data as Array<Sale>;
        return sales;
    }

    public async getBids(contractAddress: string, tokenId: string): Promise<Array<Bid>> {
        const url = `https://nft-api.decentraland.org/v1/bids?contractAddress=${contractAddress}&tokenId=${tokenId}&status=open`;
        const data = await this.httpClient.get(url, null);
        const bids = data.data as Array<Bid>;
        return bids;
    }

    public async getAccountNfts(accountAddress: string, category: string, wearableCategory: string, rarity: Array<string>, gender: string, network: string, collection: string, first: number, skip: number): Promise<Array<NFTInfo>> {
        let url = `https://nft-api.decentraland.org/v1/nfts?first=${first}&skip=${skip}&sortBy=newest&owner=${accountAddress}`;
        if (category) {
            if(category !== "land"){
                url += `&category=${category}`;
            }
            else{
                url += `&isLand=true`;
            }
        }
        if(wearableCategory && wearableCategory !== "all"){
            if (wearableCategory !== "head" && wearableCategory !== "accessory") {
                url += `&wearableCategory=${wearableCategory}`;
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
            url += `&wearableGender=${gender}`;
        }

        if (network && network !== "all") {
            url += `&network=${network}`;
        }

        if (rarity && rarity.length > 0) {
            for (const r of rarity) {
                url += `&itemRarity=${r}`;
            }
        }

        if (collection && collection !== "all") {
            url += `&contractAddress=${collection}`;
        }
       
        const data = await this.httpClient.get(url, null);
        const nfts = data.data as Array<NFTInfo>;
        return nfts;
    }
}
