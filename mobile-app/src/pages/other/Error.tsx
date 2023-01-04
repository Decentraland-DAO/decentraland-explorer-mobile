import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react"


const Error: React.FC = () => {

    return (
        <IonPage className="subscribe">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large"></IonTitle>
                    </IonToolbar>
                </IonHeader>
                <div className="ad-free">
                    <IonText>
                        <h1>Ooops!</h1>
                        <p>An error has occured, please try again later.</p>
                    </IonText>
                </div>
            </IonContent>
        </IonPage >
    )
}
export default Error;
