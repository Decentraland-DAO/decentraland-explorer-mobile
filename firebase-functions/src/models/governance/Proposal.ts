export interface Proposal {
    description: string,
    id: string,
    title: string,
    type: "poi" | "ban_name" | "linked_wearables" | "grant" | "poll" | "draft" | "governance"
}
