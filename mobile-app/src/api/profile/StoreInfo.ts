export interface StoreInfo {
    content: [
        {
            file: string,
            hash: string
        }
    ],
    metadata: {
        id: string,
        description: string,
        images: [
            {
                name: string,
                file: string,
            }
        ],
        links: [
            {
                name: string,
                url: string
            }
        ],
        owner: string,
        version: string
    }
    
}