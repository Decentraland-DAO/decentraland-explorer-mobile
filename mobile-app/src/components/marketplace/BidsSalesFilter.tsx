import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonRadio, IonRadioGroup, IonTitle, IonToolbar } from '@ionic/react';
import React, { useState } from 'react';
import './SortByModal.css';

interface ContainerProps {
  onDismiss: () => void,
  onApply: (val: string) => void,
  value: string,
}

const BidsSalesFilter: React.FC<ContainerProps> = ({ value, onDismiss, onApply }) => {

  const [changed, setChanged] = useState(false);
  const [filter, setFilter] = useState(value);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            {!changed &&
              <IonButton onClick={() => onDismiss()}>Close</IonButton>
            }
            {changed &&
              <IonButton color="primary" onClick={() => onApply(filter)}>Apply</IonButton>
            }
          </IonButtons>
          <IonTitle>Filter</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="filter-modal">
        <IonList>
          <IonRadioGroup value={filter} onIonChange={(e) => {
            setFilter(e.detail.value);
            setChanged(e.detail.value !== value);
          }}>
            <IonItem>
              <IonLabel>All</IonLabel>
              <IonRadio slot="start" value="" />
            </IonItem>
            <IonItem>
              <IonLabel>Lands</IonLabel>
              <IonRadio slot="start" value="land" />
            </IonItem>
            <IonItem>
              <IonLabel>Wearables</IonLabel>
              <IonRadio slot="start" value="wearable" />
            </IonItem>
            <IonItem>
              <IonLabel>Names</IonLabel>
              <IonRadio slot="start" value="ens" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </>
  );
};

export default BidsSalesFilter;
