import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import '../marketplace/FilterModal.css';

interface ContainerProps {
  onDismiss: () => void,
  onApply: (val: FilterData) => void,
  value: FilterData | undefined,
  hasAllCategoriesOption?: boolean,
}

export interface FilterData {
  category: string,
  status: string,
}

const ProposalFilterModal: React.FC<ContainerProps> = ({ value, onDismiss, onApply, hasAllCategoriesOption }) => {
  const [changed, setChanged] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setChanged(true);
  }, [category, status]);

  useEffect(() => {
    const setInitials = () => {
      if (value) {
        setCategory(value.category);
        setStatus(value.status);
      }
    }
    setInitials();
  }, [value]);

  const handleApplyClicked = () => {
    const filterData: FilterData = {
      category: category,
      status: status
    }
    onApply(filterData);
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            {!changed &&
              <IonButton onClick={() => onDismiss()}>Close</IonButton>
            }
            {changed &&
              <IonButton color="primary" onClick={handleApplyClicked}>Apply</IonButton>
            }
          </IonButtons>
          <IonTitle>Filter</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="filter-modal">
        <IonList>
          <IonItem>
            <IonLabel>Category</IonLabel>
            <IonSelect value={category} onIonChange={e => setCategory(e.detail.value)} placeholder={"All"}>
              <IonSelectOption value="">All Proposals</IonSelectOption>
              <IonSelectOption value="poi">Point of Interest</IonSelectOption>
              <IonSelectOption value="ban_name">Name Ban</IonSelectOption>
              <IonSelectOption value="grant">Grant Request</IonSelectOption>
              <IonSelectOption value="linked_wearables">Linked Wearables Registry</IonSelectOption>
              <IonSelectOption value="poll">Pre-Proposal Poll</IonSelectOption>
              <IonSelectOption value="draft">Draft Proposal</IonSelectOption>
              <IonSelectOption value="governance">Governance Proposal</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Status</IonLabel>
            <IonSelect value={status} onIonChange={e => setStatus(e.detail.value)} placeholder={"All"}>
              <IonSelectOption value="">All</IonSelectOption>
              <IonSelectOption value="active">Active</IonSelectOption>
              <IonSelectOption value="finished">Finished</IonSelectOption>
              <IonSelectOption value="rejected">Rejected</IonSelectOption>
              <IonSelectOption value="passed">Passed</IonSelectOption>
              <IonSelectOption value="enacted">Enacted</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  );
};

export default ProposalFilterModal;
