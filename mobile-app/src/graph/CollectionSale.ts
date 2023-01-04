export interface CollectionSale {
    id: string,
    buyer: string,
    seller: string,
    price: number,
    timestamp: string,
    item: {
        metadata: {
            wearable: {
                name: string,
                rarity: string
            },
            emote: {
                name: string,
                rarity: string
            }
        },
    }
    nft: {
        image: string,
        contractAddress: string,
        tokenId: string,
    }
}