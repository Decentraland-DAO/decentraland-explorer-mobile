import { id } from "date-fns/locale"

export interface Bid {
    id: string,
    tokenId: string,
    bidder: string,
    seller: string,
    price: number,
    status: string,
    category: string,
    expiresAt: string,
    nft: {
        name: string,
        image: string,
        contractAddress: string,
        tokenId: string,
        estate?: {
            tokenId: string,
            parcels: [{
                x: number,
                y: number,
            }],
        },
        parcel?: {
            x: number,
            y: number
        },
        wearable?: {
            id: string,
            rarity: string,
        },
        emote?: {
            id: string,
            rarity: string,
        },
        ens?: {
            id: string,
            subdomain: string
        }
    }
}