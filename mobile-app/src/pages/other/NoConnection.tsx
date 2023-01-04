import { IonIcon, IonPage, IonText } from '@ionic/react';
import { cloudOffline } from 'ionicons/icons';
import "./NoConnection.css";

const NoConnection: React.FC = () => {
  return (
    <IonPage className="no-connection">
      <div>
        <h1>
          <IonIcon color="dark" icon={cloudOffline}></IonIcon>
        </h1>
        <IonText color="dark"><h1>You are offline</h1></IonText>
      </div>
    </IonPage>
  );
};

export default NoConnection;
