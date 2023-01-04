import { ProfileInfo } from "../profile/ProfileInfo"
import { CatalystNodeConfiguration } from "./CatalystNodeConfiguration"
import { CommentList } from "./CommentList"
import { DraftConfiguration } from "./DraftConfiguration"
import { GovernanceConfiguration } from "./GovernanceConfiguration"
import { GrantConfiguration } from "./GrantConfiguration"
import { LinkedWearablesConfiguration } from "./LinkedWearablesConfiguration"
import { NameBanConfiguration } from "./NameBanConfiguration"
import { POIConfiguration } from "./POIConfiguration"
import { PollConfiguration } from "./PollConfiguration"
import { Vote } from "./Vote"

export interface Proposal {
    configuration: POIConfiguration | CatalystNodeConfiguration | NameBanConfiguration | GrantConfiguration | LinkedWearablesConfiguration | PollConfiguration | DraftConfiguration | GovernanceConfiguration
    created_at: string,
    description: string,
    discourse_id: number,
    discourse_topic_id: number,
    discourse_topic_slug: string,
    enacted: boolean,
    finish_at: string,
    id: string,
    required_to_pass: number,
    snapshot_id: string,
    snapshot_network: string,
    snapshot_proposal: {
        app: string,
        body: string,
        choices: Array<string>,
        discussion: string,
        end: number,
        metadata?: any,
        from: string,
        plugins: string,
        snapshot: number,
        space: string,
        start: number,
        timestamp: number,
        title: string,
        type: 'single-choice'
    },
    snapshot_signature: string,
    snapshot_space: string,
    start_at: string,
    status: "active" | "finished" | "rejected" | "passed" | "enacted",
    title: string,
    type: "poi" | "ban_name" | "linked_wearables" | "grant" | "poll" | "draft" | "governance"
    updated_at: string,
    user: string,
    userProfile?: ProfileInfo,
    vesting_address: string,
    votes: Array<Vote>,
    comments: CommentList,
}