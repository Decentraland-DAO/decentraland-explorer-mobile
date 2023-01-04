import { ProfileInfo } from "../profile/ProfileInfo";

export interface Bid {
    bidAddress: string
    bidder: string,
    bidderProfile: ProfileInfo | null | undefined,
    blockNumber: number,
    blockchainId: string,
    chainId: number,
    contractAddress: string,
    createdAt: number,
    expiresAt: number,
    fingerprint: string,
    id: string,
    network: string,
    price: number,
    seller: string,
    status: string,
    tokenId: string,
    updatedAt: number,
}