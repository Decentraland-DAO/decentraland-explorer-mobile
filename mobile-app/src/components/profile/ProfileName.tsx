import { ProfileInfo } from "../../api/profile/ProfileInfo"

interface ContainerProps {
    profileInfo: ProfileInfo | null | undefined,
    ethAddress: string,
}
const ProfileName: React.FC<ContainerProps> = ({ profileInfo, ethAddress }) => {
    if (profileInfo !== null && profileInfo !== undefined && profileInfo.avatars[0].name) {
        return (
            <>
                {profileInfo.avatars[0].name}
            </>
        )
    }
    else {
        return (
            <>
                {ethAddress ? ethAddress.substring(0, 6)  + "..." + ethAddress.substring(ethAddress.length - 5): ""}
            </>
        )
    }
}
export default ProfileName
