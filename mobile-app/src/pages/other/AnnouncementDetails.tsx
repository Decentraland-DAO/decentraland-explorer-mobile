import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/react"
import { useEffect } from "react";
import { RouteComponentProps } from "react-router";
import AnnouncementInfo from "../../components/other/AnnouncementInfo";

interface PageProps
    extends RouteComponentProps<{
        announcementId: string,
    }> { }
const AnnouncementDetails: React.FC<PageProps> = ({ match }) => {

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Announcement Details",
                screen_class: "AnnouncementDetails",
            },
        });
    }, []);

    return (
        <IonPage className="name-details">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <AnnouncementInfo announcementId={match.params.announcementId}></AnnouncementInfo>
            </IonContent>
        </IonPage>
    )
}
export default AnnouncementDetails;
