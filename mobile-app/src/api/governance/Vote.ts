import { ProfileInfo } from "../profile/ProfileInfo";

export interface Vote {
    profile: string,
    choice: number,
    timestamp: number,
    vp: number,
    profileInfo?: ProfileInfo
}