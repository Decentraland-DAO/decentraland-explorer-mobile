export interface Item {
    id: string
    name: string
    thumbnail: string
    url: string
    category: "wearable" | "emote"
    contractAddress: string
    itemId: string
    price: number
    available: number
    isOnSale: boolean
    creator: string
    createdAt: number
    updatedAt: number
    reviewedAt: number
    soldAt: number
}
