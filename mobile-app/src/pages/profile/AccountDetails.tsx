import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from "@ionic/react"
import { openOutline, shareSocialOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Browser } from '@capacitor/browser';
import { Share } from "@capacitor/share";
import { ProfileInfo } from "../../api/profile/ProfileInfo";
import AccountInfo from "../../components/profile/AccountInfo";

interface PageProps
    extends RouteComponentProps<{
        accountAddress: string,
    }> { }
const AccountDetails: React.FC<PageProps> = ({ match }) => {

    const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Profile Details",
                screen_class: "ProfileDetails",
            },
        });

    }, []);

    const openExternalUrl = () => {
        Browser.open({ url: `https://market.decentraland.org/accounts/${match.params.accountAddress}` });
    }

    const shareProfile = async () => {
        await Share.share({
            text: profileInfo?.avatars[0].name,
            url: `https://dcland.app/profile/${match.params.accountAddress}`,
            dialogTitle: 'Share with buddies',
        });
    }

    const onProfileInfoLoaded = (data: ProfileInfo) => {
        setProfileInfo(data);
    }

    return (
        <IonPage className="name-details">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonButtons slot="end">
                        {profileInfo !== null &&
                            <>
                                <IonButton onClick={shareProfile}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
                            </>
                        }
                        <IonButton onClick={openExternalUrl}><IonIcon icon={openOutline}></IonIcon></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <AccountInfo onProfileInfoLoaded={onProfileInfoLoaded} accountAddress={match.params.accountAddress} ></AccountInfo>
            </IonContent>
        </IonPage>
    )
}
export default AccountDetails;
