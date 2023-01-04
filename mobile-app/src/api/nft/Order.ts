export interface Order{
    buyer: string,
    chainId: number,
    contractAddress: string,
    createdAt: number,
    expiresAt: number,
    id: string,
    marketplaceAddress: string,
    network: string,
    owner: string,
    price: number,
    status: string,
    tokenId: string,
    updatedAt: number
}