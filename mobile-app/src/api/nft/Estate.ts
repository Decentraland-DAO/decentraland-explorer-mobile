export interface Estate {
    description: string,
    parcels: [
        {
            x: number,
            y: number
        }
    ],
    size: number
}