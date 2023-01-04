import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { Browser } from "@capacitor/browser";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react"
import { useEffect } from "react";


const Feedback: React.FC = () => {

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Feedback",
                screen_class: "Feedback",
            },
        });
    }, []);

    return (
        <IonPage className="subscribe">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>Send Feedback</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Send Feedback</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div className="ad-free">
                    <IonText>
                        <h1>Hi there 👋</h1>
                        <p>Together we can discuss new ideas, suggestions to make our service better.</p>
                        <IonButton color="secondary" onClick={() => Browser.open({ url: "https://www.producthero.app/174/decentraland-explorer" })}>Feedback</IonButton>
                    </IonText>
                </div>
            </IonContent>
        </IonPage >
    )
}
export default Feedback;
