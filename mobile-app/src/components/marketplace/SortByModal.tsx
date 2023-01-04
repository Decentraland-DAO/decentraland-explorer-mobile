import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react';
import './SortByModal.css';

interface ContainerProps {
  onDismiss: () => void,
  onApply: (val: string) => void,
  value: string,
}

const SortByModal: React.FC<ContainerProps> = ({ value, onDismiss, onApply }) => {

  const [changed, setChanged] = useState(false);
  const [sortBy, setSortBy] = useState(value);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            {!changed &&
              <IonButton onClick={() => onDismiss()}>Close</IonButton>
            }
            {changed &&
              <IonButton color="primary" onClick={() => onApply(sortBy)}>Apply</IonButton>
            }
          </IonButtons>
          <IonTitle>Sort By</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="sortBy-modal">
        <IonList>
          <IonRadioGroup value={sortBy} onIonChange={(e) => {
            setSortBy(e.detail.value);
            setChanged(e.detail.value !== value);
          }}>
            <IonItem>
              <IonLabel>Cheapest</IonLabel>
              <IonRadio slot="start" value="cheapest" />
            </IonItem>
            <IonItem>
              <IonLabel>Recently Listed</IonLabel>
              <IonRadio slot="start" value="recently_listed" />
            </IonItem>
            <IonItem>
              <IonLabel>Newest</IonLabel>
              <IonRadio slot="start" value="newest" />
            </IonItem>
            <IonItem>
              <IonLabel>Name</IonLabel>
              <IonRadio slot="start" value="name" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </>
  );
};

export default SortByModal;
