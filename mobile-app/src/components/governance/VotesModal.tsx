import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonProgressBar, IonSpinner, IonText, IonTitle, IonToolbar, useIonToast } from '@ionic/react';
import { alert, arrowBack, checkmark } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Proposal } from '../../api/governance/Proposal';
import { Vote } from '../../api/governance/Vote';
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { ProfileService } from '../../services/ProfileService';
import { Utils } from '../../services/Utils';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileName from '../profile/ProfileName';
import './VotesModal.css';
import { useProvider, useSignTypedData } from '@web3modal/react'
import { SnapshotClient, SnapshotDomain, vote2Types } from '../../services/SnapshotClient';
import { useAppAccount } from '../../hooks/useAppAccount';


interface ContainerProps {
  votes: Array<Vote>,
  proposal: Proposal
  onDismiss: () => void,
  onVoted: () => void,
}


const VotesModal: React.FC<ContainerProps> = ({ votes, proposal, onDismiss, onVoted }) => {

  const utils = new Utils();

  const [proposalVotes, setProposalVotes] = useState<Array<Vote>>([]);

  const [ownChoice, setOwnChoice] = useState<number>(-1);

  const [neededVp, setNeededVp] = useState<number>(proposal.required_to_pass);

  const { provider } = useProvider();

  const { appAccount } = useAppAccount();

  const { signTypedData } = useSignTypedData({ domain: SnapshotDomain, types: vote2Types, value: {} });

  const [presentToast] = useIonToast();

  const [voting, setVoting] = useState(false);

  useEffect(() => {
    getVoteProfiles();
    calculateNeededVp();
  });


  const getVoteProfiles = async () => {
    // sort by vp
    votes.sort((voteA: Vote, voteB: Vote) => {
      return voteB.vp - voteA.vp;
    });

    // get profiles
    const profileService = new ProfileService();
    const profileAddresses = votes.map(v => { return v.profile });
    const profiles = await profileService.getProfileInfos(profileAddresses);
    for (const vote of votes) {
      const profileInfo = profiles?.find((p: ProfileInfo) => p.avatars[0].ethAddress === vote.profile);
      vote.profileInfo = profileInfo;
    }
    setProposalVotes(votes);

    if (appAccount.isConnected) {
      const ownVote = votes.find(v => v.profile.toLowerCase() === appAccount.address.toLowerCase());
      if (ownVote) {
        setOwnChoice(ownVote?.choice);
      }
    }
  }

  const calculateNeededVp = () => {
    const allVp = votes.reduce((total: number, vote) => {
      return total + (vote.choice === 1 ? vote.vp : 0);
    }, 0);

    const neededVotes = Math.max(proposal.required_to_pass - allVp, 0);
    setNeededVp(neededVotes);
  }

  const castVote = async (choice: string, choiceIndex: number) => {
    setVoting(true);
    try {
      if (appAccount.isConnected) {
        if (!appAccount.isInDemoMode) {
          const hub = 'https://hub.snapshot.org';
          const client = new SnapshotClient(hub);
          const vote = {
            space: proposal.snapshot_space,
            proposal: proposal.snapshot_id,
            type: proposal.snapshot_proposal.type,
            choice: choiceIndex + 1,
            reason: "",
            app: proposal.snapshot_proposal.app
          };

          const voteMsg = await client.prepareVoteMessage(provider as any, appAccount.address, vote);
          const voteSig = await signTypedData({ domain: voteMsg.domain, types: voteMsg.types, value: voteMsg.message });
          if (voteSig) {
            try {
              await client.send({ address: appAccount.address, sig: voteSig, data: voteMsg });
              presentToast({
                message: "Your vote has been recorded",
                duration: 1500,
                icon: checkmark
              });
              onVoted();
            }
            catch (err: any) {
              window.alert("error");
              presentToast({
                message: err.error_description,
                duration: 1500,
                icon: alert
              });
            }
          }
          else {
            presentToast({
              message: "Unable to vote at the moment. Please try again later",
              duration: 1500,
              icon: checkmark
            });
          }
        }
        else {
          presentToast({
            message: "Your vote has been recorded",
            duration: 1500,
            icon: checkmark
          });
          onVoted();
        }
      }
      else {
        presentToast({
          message: "You need to sign in to vote",
          duration: 1500,
          icon: alert
        });
      }
    }
    finally {
      setVoting(false);
    }
  }

  const renderChoice = (choice: string, choiceIndex: number) => {

    const choiceVotes = votes.filter(v => v.choice === choiceIndex + 1);
    const allVp = votes.reduce((total: number, vote) => {
      return total + vote.vp;
    }, 0);

    const vp = choiceVotes.reduce((total: number, vote) => {
      return total + vote.vp;
    }, 0);

    const percentage = Math.round(100 * vp / allVp);


    return (
      <IonItem>
        <IonLabel>
          <IonItem>
            <IonLabel slot="start">
              {choice.toLowerCase()}
            </IonLabel>
            <IonLabel slot="end">
              {percentage}%
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonProgressBar color={choiceIndex === 0 ? "success" : choiceIndex === 1 ? "danger" : "warning"} value={percentage}></IonProgressBar>
          </IonItem>
          <IonItem>
            <IonLabel>
              {utils.formatNumber(vp)} VP ({choiceVotes.length} votes)
            </IonLabel>
          </IonItem>
        </IonLabel>
      </IonItem>
    )
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => onDismiss()}><IonIcon icon={arrowBack}></IonIcon></IonButton>
          </IonButtons>
          <IonTitle>Votes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonCard className="votes-modal">
        <IonCardContent>
          <IonText color="primary"><h2>{proposal.title}</h2></IonText>
          <IonList>
            {proposal.configuration.choices.map((choice, choiceIndex) =>
              renderChoice(choice, choiceIndex)
            )}
          </IonList>
          {proposal.status === "active" &&
            <>
              {!voting &&
                <>
                  {proposal.configuration.choices.map((choice, choiceIndex) =>
                    <IonButton
                      onClick={() => castVote(choice, choiceIndex)}
                      color={choiceIndex === 0 ? "success" : choiceIndex === 1 ? "danger" : "warning"}
                      disabled={choiceIndex + 1 === ownChoice}
                    >
                      {choiceIndex + 1 === ownChoice &&
                        <IonIcon icon={checkmark}></IonIcon>
                      }
                      vote {choice.toLowerCase()}
                    </IonButton>
                  )}
                </>
              }
              {voting &&
                <div className="voting">
                  <IonSpinner></IonSpinner>
                </div>
              }
              {neededVp <= 0 &&
                <IonCard className="votes-summary">
                  <IonCardHeader>
                    <IonCardSubtitle>
                      Acceptance Threshold Reached
                    </IonCardSubtitle>
                    <IonCardTitle>
                      {utils.formatNumber(proposal.required_to_pass)} VP
                    </IonCardTitle>
                  </IonCardHeader>
                </IonCard>
              }
              {neededVp > 0 &&
                <>
                  <IonCard className="votes-summary" color="light">
                    <IonCardHeader>
                      <IonCardSubtitle>
                        Acceptance Threshold
                      </IonCardSubtitle>
                      <IonCardTitle>
                        {utils.formatNumber(proposal.required_to_pass)} VP
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardHeader>
                      <IonCardSubtitle>
                        Needed for Acceptance
                      </IonCardSubtitle>
                      <IonCardTitle>
                        {utils.formatNumber(neededVp)} VP
                      </IonCardTitle>
                    </IonCardHeader>
                  </IonCard>
                </>
              }
            </>
          }
          {proposal.status !== "active" &&
            <>
              {neededVp <= 0 &&
                <IonCard>
                  <IonCardHeader>
                    <IonCardSubtitle>
                      {utils.formatNumber(proposal.required_to_pass)} VP Threshold Reached
                    </IonCardSubtitle>
                    <IonCardTitle>
                      proposal {proposal.status}
                    </IonCardTitle>
                  </IonCardHeader>
                </IonCard>
              }
              {neededVp > 0 &&
                <>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardSubtitle>
                        {utils.formatNumber(proposal.required_to_pass)} VP Threshold Not Reached
                      </IonCardSubtitle>
                      <IonCardTitle>
                        proposal {proposal.status}
                      </IonCardTitle>
                    </IonCardHeader>
                  </IonCard>
                </>
              }
            </>
          }
          <IonList className="voters">
            <IonItem className="owner" lines="none">
              <IonLabel className="votes-title">
                Votes
              </IonLabel>
            </IonItem>
            {proposalVotes?.map(vote =>
              <IonItem className="owner" lines="none">
                <ProfileAvatar profileInfo={vote.profileInfo} ethAddress={vote.profile}></ProfileAvatar>
                <IonLabel slot="start">
                  <ProfileName profileInfo={vote.profileInfo} ethAddress={vote.profile}></ProfileName>
                </IonLabel>
                <IonLabel>
                  {proposal.configuration.choices[vote.choice - 1]}
                </IonLabel>
                <IonLabel slot="end">{utils.formatVp(vote.vp)}</IonLabel>
              </IonItem>
            )}
          </IonList>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default VotesModal;
