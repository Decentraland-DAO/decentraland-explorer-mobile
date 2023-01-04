import { Emote } from "../nft/Emote";
import { Wearable } from "../nft/Wearable";

export interface Item {
    available: number
    beneficiary: string,
    category: string,
    chainId: number,
    contractAddress: string,
    createdAt: number,
    creator: string,
    data: {
        wearable?: Wearable,
        emote?: Emote
    },
    id: string,
    isOnSale: boolean
    itemId: string,
    name: string,
    network: string,
    price: number,
    rarity: string,
    reviewedAt: number,
    soldAt: number,
    thumbnail: string,
    updatedAt: number,
    url: string
}