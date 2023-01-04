import { Browser } from "@capacitor/browser";
import { Device } from "@capacitor/device";
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonTitle, IonToolbar, useIonAlert } from "@ionic/react";
import { exit, logoTwitter, person } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./AppMenu.css"

import { ConnectButton, useAccount } from '@web3modal/react';
import { ClientCtrl } from "@web3modal/core";

import { ProfileInfo } from "../api/profile/ProfileInfo";
import { ProfileService } from "../services/ProfileService";
import ProfileName from "./profile/ProfileName";
import ProfileAvatar from "./profile/ProfileAvatar";
import { useAppAccount } from "../hooks/useAppAccount";


const AppMenu: React.FC = () => {

  const history = useHistory();

  const [platform, setPlatform] = useState("");

  const { account } = useAccount();

  const { appAccount } = useAppAccount();

  const [accountProfile, setAccountProfile] = useState<ProfileInfo | null>(null);

  const [presentDemoAlert] = useIonAlert();

  useEffect(() => {
    if (appAccount.isConnected) {
      getProfile(appAccount.address);
    }

  }, [appAccount.isConnected, appAccount.address]);


  useEffect(() => {
    getDeviceInfo();
  }, []);

  const getDeviceInfo = async () => {
    const deviceInfo = await Device.getInfo();
    setPlatform(deviceInfo.platform);
  }

  const closeMenu = () => {
    const menu = document.querySelector('ion-menu');
    menu?.close();
  }

  const signOut = () => {
    if (appAccount.isInDemoMode) {
      appAccount.demoSignOut();
    }
    else {
      ClientCtrl.ethereum().disconnect();
    }
  }

  const getProfile = async (address: string) => {
    const profileService = new ProfileService();
    const data = await profileService.getProfileInfo(address);
    setAccountProfile(data);
  }

  const demoSignIn = () => {
    presentDemoAlert({
      header: 'Connecting to app review demo wallet. Tap Yes to continue',
      cssClass: 'custom-alert',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          cssClass: 'alert-button-confirm',
          handler: () => {
            appAccount.demoSignIn();
          }
        },
      ],
    });
  }

  return (
    <IonMenu className="app-menu" side="start" contentId="router-outlet">
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            {appAccount.isConnected &&
              <ProfileAvatar profileInfo={accountProfile} ethAddress={appAccount.address}></ProfileAvatar>
            }
            {!appAccount.isConnected &&
              <IonButton className="anonymous" shape="round" color="dark" size="small">
                <IonIcon icon={person}></IonIcon>
              </IonButton>
            }
          </IonButtons>
          <IonTitle>
            <div className="multiline-title">
              {appAccount.isConnected &&
                <ProfileName profileInfo={accountProfile} ethAddress={account.address}></ProfileName>
              }
              {!appAccount.isConnected &&
                <>
                  {appAccount.isInDemoMode &&
                    <IonButton onClick={demoSignIn} color="primary">Sign In</IonButton>
                  }
                  {!appAccount.isInDemoMode &&
                    <ConnectButton label="Sign In"></ConnectButton>
                  }
                </>
              }
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {appAccount.isConnected && platform !== "ios" &&
            <IonItem onClick={() => { history.push("/account/" + appAccount.address); closeMenu(); }}>My Assets</IonItem>
          }
          <IonItem onClick={() => { history.push("/dao/"); closeMenu(); }}>DAO</IonItem>
          <IonItem onClick={() => { history.push("/settings/"); closeMenu(); }}>Settings</IonItem>
          <IonItem onClick={() => { history.push("/about"); closeMenu(); }}>About</IonItem>
          <IonItem onClick={() => { Browser.open({ url: "https://dcland.app/privacy-policy.html" }); closeMenu() }}>Privacy Policy</IonItem>
          {platform === "ios" &&
            <IonItem onClick={() => { Browser.open({ url: "http://www.apple.com/legal/itunes/appstore/dev/stdeula" }); closeMenu() }}>Terms of Use</IonItem>
          }
          <IonItem onClick={() => { Browser.open({ url: "https://twitter.com/dclandapp" }); closeMenu() }}>
            <IonLabel><IonIcon icon={logoTwitter}></IonIcon>Follow us on Twitter</IonLabel>
          </IonItem>
          <IonItem onClick={() => { Browser.open({ url: "https://t.me/dclandapp" }); closeMenu() }}>
            <IonLabel><img alt="telegram" className="telegram" src={process.env.PUBLIC_URL + "/assets/img/telegram.png"}></img>Join us on Telegram</IonLabel>
          </IonItem>
          <IonItem onClick={() => { Browser.open({ url: "https://mirror.xyz/dclandapp.eth" }); closeMenu() }}>
            <IonLabel><img alt="mirror" className="telegram" src={process.env.PUBLIC_URL + "/assets/img/mirror.png"}></img>mirror.xyz/dclandapp.eth</IonLabel>
          </IonItem>
          {appAccount.isConnected &&
            <IonItem onClick={signOut}>
              <IonLabel color="danger"><IonIcon color="danger" icon={exit}></IonIcon>Sign Out</IonLabel>
            </IonItem>
          }
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default AppMenu;
