import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { person } from "ionicons/icons";
import { useEffect, useState } from "react";
import { ProfileInfo } from "../api/profile/ProfileInfo";
import { useAppAccount } from "../hooks/useAppAccount";
import { ProfileService } from "../services/ProfileService";
import ProfileAvatar from "./profile/ProfileAvatar";
import "./ToolbarMenuButton.css"
const ToolbarMenuButton: React.FC = () => {

  const [accountProfile, setAccountProfile] = useState<ProfileInfo | null>(null);

  const { appAccount } = useAppAccount();

  const openMenu = async () => {
    const menu = document.querySelector('ion-menu');
    menu?.open();
  }

  useEffect(() => {
    if (appAccount.isConnected) {
      getProfile(appAccount.address);
    }

  }, [appAccount.isConnected, appAccount.address]);

  const getProfile = async (address: string) => {
    const profileService = new ProfileService();
    const data = await profileService.getProfileInfo(address);
    setAccountProfile(data);
  }

  return (
    <IonButtons className="toolbar-menu-button" slot="start">
      {appAccount.isConnected &&
        <IonButton className="authenticated" shape="round" color="light" size="small" onClick={openMenu}>
          <ProfileAvatar profileInfo={accountProfile} ethAddress={appAccount.address}></ProfileAvatar>
        </IonButton>
      }
      {!appAccount.isConnected &&
        <IonButton className="anonymous" shape="round" color="light" size="small" onClick={openMenu}>
          <IonIcon icon={person}></IonIcon>
        </IonButton>
      }
    </IonButtons >
  );
};

export default ToolbarMenuButton;
