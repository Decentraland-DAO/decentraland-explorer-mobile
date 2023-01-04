import { IonItem, IonLabel, IonList, IonNote } from '@ionic/react';
import { Proposal } from '../../api/governance/Proposal';
import ProposalCard from './ProposalCard';
import "./ProposalList.css";

interface ContainerProps {
    proposals: Array<Proposal>,
}
const ProposalList: React.FC<ContainerProps> = ({ proposals }) => {
    return (
        <div className="proposal-list">
            <IonList>
                {proposals.length === 0 &&
                    <IonItem>
                        <IonLabel><IonNote>No records found</IonNote></IonLabel>
                    </IonItem>
                }
                {proposals.map((proposal, index) =>
                    <ProposalCard key={index} proposal={proposal}></ProposalCard>
                )}
            </IonList>
        </div>
    )
}
export default ProposalList;
