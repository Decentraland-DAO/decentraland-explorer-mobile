export interface TileInfo {
    id: string,
    x: number,
    y: number,
    updatedAt: number,
    type: string,
    top: boolean,
    left: boolean,
    topLeft: boolean,
    owner: string,
    tokenId: string
    name?: string,
    estateId?: string,
    price?: number,
}