import { ProfileInfo } from "../profile/ProfileInfo";

export interface Sale {
    buyer: string,
    buyerProfile: ProfileInfo | undefined | null,
    chainId: number,
    contractAddress: string,
    id: string,
    itemId: string,
    network: string,
    price: number,
    seller: string,
    sellerProfile: ProfileInfo | undefined | null,
    timestamp: number,
    tokenId: string,
    txHash: string,
    type: string,
}