export interface Sale {
    id: string,
    buyer: string,
    seller: string,
    price: number,
    timestamp: string,
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
            rarity: string
        },
        emote?: {
            id: string,
            rarity: string
        },
        ens?: {
            id: string,
            subdomain: string
        }
    }
}