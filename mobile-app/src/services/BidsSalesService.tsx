import { createClient } from '@urql/core';
import { Contracts } from '../common/Contracts';
import { Bid } from '../graph/Bid';
import { CollectionSale } from '../graph/CollectionSale';
import { Sale } from '../graph/Sale';
export class BidsSalesService {
    
    private graphClient = createClient({
        url: "https://api.thegraph.com/subgraphs/name/decentraland/marketplace"
    });

    private collectionsGraphClient = createClient({
        url: "https://api.thegraph.com/subgraphs/name/decentraland/collections-matic-mainnet"
    });

    public async getBids(first: number, skip: number, category: string): Promise<Array<Bid>> {
        let where = "";
        if (category !== "") {
            if (category === "land") {
                where = `category_in: [parcel, estate]`;
            }
            else {
                where = `category: ${category}`;
            }
        }        
        const tokensQuery = `
            query {
                bids(where: {${where}}, orderBy: createdAt, orderDirection: desc, first: ${first}, skip:${skip}){
                    id,
                    tokenId,
                    bidder,
                    seller,
                    price,
                    status,
                    category,
                    expiresAt,
                    nft{
                      name,
                      image,
                      contractAddress,
                      tokenId,
                      estate{
                          tokenId,
                          parcels(first: 1){
                              x,
                              y
                          }
                      },
                      parcel{
                          x,
                          y
                      },
                      wearable{
                        id,
                        rarity
                      },
                      ens{
                          id,
                          subdomain
                      }
                    }
                  }
            }`

        const data = await this.graphClient.query(tokensQuery).toPromise();
        if (data.data.bids) {
            return data.data.bids as Array<Bid>;
        }
        else {
            return [];
        }
    }

    public async getSales(first: number, skip: number, category: string): Promise<Array<Sale>> {
        let where = "";
        if (category !== "") {
            if (category === "land") {
                where = `searchContractAddress_in: ["${Contracts.PARCEL}", "${Contracts.ESTATE}"]`;
            }
            else if (category === "wearable") {
                where = `searchContractAddress_not_in: ["${Contracts.PARCEL}", "${Contracts.ESTATE}", "${Contracts.ENS}"]`;
            }
            else if (category === "ens") {
                where = `searchContractAddress_in: ["${Contracts.ENS}"]`;
            }
        }
        const query = `
            query {
                sales(where: {${where}}, orderBy: timestamp, orderDirection: desc, first: ${first}, skip:${skip}){
                    id,
                    buyer,
                    seller,
                    price,
                    timestamp,
                    nft{
                      name,
                      image,
                      contractAddress,
                      tokenId,
                      estate{
                          tokenId,
                          parcels(first: 1){
                              x,
                              y
                          }
                      },
                      parcel{
                          x,
                          y
                      },
                      wearable{
                        id,
                        rarity
                      },
                      ens{
                          id,
                          subdomain
                      }
                    }
                  }
            }`

        const data = await this.graphClient.query(query).toPromise();
        if (data.data.sales) {
            return data.data.sales as Array<Sale>;
        }
        else {
            return [];
        }

    }

    public async getCollectionSales(first: number, skip: number): Promise<Array<CollectionSale>> {
        const query = `
            query {
                sales(
                    first: ${first},
                    skip: ${skip},
                    orderBy: timestamp,
                    orderDirection: desc
                  )
                  {
                    id,
                    buyer,
                    seller,
                    price,
                    timestamp,
                    item {
                        metadata{
                            wearable{
                                name,
                                rarity
                            },
                            emote{
                                name,
                                rarity
                            }
                      }
                    },
                    nft{
                      image,
                      contractAddress,
                      tokenId,
                    }
                  }
            }`

        const data = await this.collectionsGraphClient.query(query).toPromise();
        if (data.data.sales) {
            const collectionSales = data.data.sales as Array<CollectionSale>;
            return collectionSales;
        }
        else {
            return [];
        }

    }
}
