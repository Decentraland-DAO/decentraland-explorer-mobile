import { IonAvatar } from "@ionic/react";
import { useState } from "react";
import { ProfileInfo } from "../../api/profile/ProfileInfo"
import EthereumAvatar from "./EthereumAvatar";
import "./ProfileAvatar.css";

interface ContainerProps {
  profileInfo: ProfileInfo | null | undefined,
  ethAddress: string,
}
const ProfileAvatar: React.FC<ContainerProps> = ({ profileInfo, ethAddress }) => {
  const [onError, setOnError] = useState(false);

  const getAvatar = (ownerInfo: ProfileInfo): string => {
    const avatar = ownerInfo.avatars[0].avatar;
    if (avatar.snapshots.face128) {
      return avatar.snapshots.face128;
    }
    else if (avatar.snapshots.face256) {
      return avatar.snapshots.face256;
    }
    else {
      return avatar.snapshots.face;
    }
  }

  return (
    <IonAvatar slot="start">
      {profileInfo !== null && profileInfo !== undefined && !onError &&
        <img alt={profileInfo.avatars[0].name} src={getAvatar(profileInfo)} onError={(e) => setOnError(true)} />
      }
      {(profileInfo === null || profileInfo === undefined || onError) &&
        <EthereumAvatar address={ethAddress}></EthereumAvatar>
      }
    </IonAvatar>
  )
}
export default ProfileAvatar
