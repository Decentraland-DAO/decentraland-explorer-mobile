export interface ProfileInfo{
    avatars: [
        {
            avatar: any,
            description: string,
            email: string,
            ethAddress: string,
            hasClaimedName: boolean,
            interests: Array<any>,
            inventory: Array<string>,
            muted: Array<any>,
            name: string,
            tutorialStep: number,
            userId: string,
            version: number,
        }
    ]
}