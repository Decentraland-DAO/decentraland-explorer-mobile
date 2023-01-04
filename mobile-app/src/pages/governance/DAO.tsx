import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/react';
import './DAO.css';
import { useEffect, useState } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { GovernanceService } from '../../services/GovernanceService';
import DAOSummary from '../../components/governance/DAOSummary';
import { Proposal } from '../../api/governance/Proposal';
import ProposalList from '../../components/governance/ProposalList';
import { ProfileService } from '../../services/ProfileService';
import { arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router';

const DAO: React.FC = () => {

  const [proposalsEndingSoonLoading, setProposalsEndingSoonLoading] = useState(false);

  const [proposalsWithVPParticipationLoading, setProposalsWithVPParticipationLoading] = useState(false);

  const [proposalsEndingSoon, setProposalsEndingSoon] = useState<Array<Proposal>>([]);

  const [proposalsWithVPParticipation, setProposalsWithVPParticipation] = useState<Array<Proposal>>([]);

  const [segment, setSegment] = useState("ending_soon");

  const governanceService = new GovernanceService();

  const profileService = new ProfileService();

  const history = useHistory();

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "DAO",
        screen_class: "DAO",
      },
    });
  }, []);

  useEffect(() => {
    getProposalsEndingSoon();
    getProposalsWithVPParticipation();
  }, []);

  const getProposalsEndingSoon = async () => {
    try {
      setProposalsEndingSoonLoading(true);
      const proposals = await governanceService.getProposalsEndingSoon();
      setProposalsEndingSoon(proposals);

      await getProposalProfiles(proposals);
      setProposalsEndingSoon(proposals);
    }
    finally {
      setProposalsEndingSoonLoading(false);
    }
  }

  const getProposalsWithVPParticipation = async () => {
    try {
      setProposalsWithVPParticipationLoading(true);
      const proposals = await governanceService.getProposalsWithVPParticipation();
      setProposalsWithVPParticipation(proposals);

      await getProposalProfiles(proposals);
      setProposalsWithVPParticipation([...proposals]);
    }
    finally {
      setProposalsWithVPParticipationLoading(false);
    }
  }

  const getProposalProfiles = async (proposals: Array<Proposal>) => {
    const profileIds = proposals.map(p => {
      return p.user;
    });
    const userProfiles = await profileService.getProfileInfos(profileIds);
    for (const proposal of proposals) {
      proposal.userProfile = userProfiles?.find(p => p.avatars[0].ethAddress.toLowerCase() === proposal.user.toLowerCase());
    }
  }

  return (
    <IonPage className="dao">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>DAO</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">DAO</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="description">
          <IonText>
            <p>
              The  DAO is a key component of the ecosystem and it is the consensus mechanism for defining the rules of the Decentraland's virtual world. Participate in the DAO and make your voice heard.
            </p>
          </IonText>
        </div>
        <DAOSummary></DAOSummary>
        <div>
          <div className="list-heading" style={{ width: "94%", margin: "auto", display: "flex", justifyContent: "space-between" }}>
            <h3 className="title">Open Proposals</h3>
            <IonButton size="small" fill="clear" onClick={() => { sessionStorage.removeItem("proposal-filter"); history.push("/proposals") }}>
              <IonText>View All<IonIcon icon={arrowForward}></IonIcon></IonText>
            </IonButton>
          </div>
          <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
            <IonSegmentButton value="ending_soon">Ending Soon</IonSegmentButton>
            <IonSegmentButton value="participating_vp">Participating VP</IonSegmentButton>
          </IonSegment>
          {segment === "ending_soon" &&
            <>
              {proposalsEndingSoonLoading &&
                <div className="loading">
                  <IonSpinner></IonSpinner>
                </div>
              }
              {!proposalsEndingSoonLoading &&
                < ProposalList proposals={proposalsEndingSoon}></ProposalList>
              }
            </>
          }
          {segment === "participating_vp" &&
            <>
              {proposalsWithVPParticipationLoading &&
                <div className="loading">
                  <IonSpinner></IonSpinner>
                </div>
              }
              {!proposalsWithVPParticipationLoading &&
                <ProposalList proposals={proposalsWithVPParticipation}></ProposalList>
              }
            </>
          }
        </div>
      </IonContent >
    </IonPage >
  );
};

export default DAO;
