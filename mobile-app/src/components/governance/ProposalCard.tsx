import { IonChip, IonIcon, IonItem, IonLabel, IonText } from '@ionic/react';
import { formatDistanceToNowStrict } from 'date-fns';
import { checkmark } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { CommentList } from '../../api/governance/CommentList';
import { Proposal } from '../../api/governance/Proposal';
import { Vote } from '../../api/governance/Vote';
import { GovernanceService } from '../../services/GovernanceService';
import ProfileAvatar from '../profile/ProfileAvatar';

interface ContainerProps {
  proposal: Proposal,
}

const ProposalCard: React.FC<ContainerProps> = ({ proposal }) => {

  const [votes, setVotes] = useState<Array<Vote>>([]);
  const [comments, setComments] = useState<CommentList | null>(null);
  const history = useHistory();

  useEffect(() => {     
    const governanceService = new GovernanceService();   
    const getProposalVotes = async () => {
      const votes = await governanceService.getProposalVotes(proposal.id);
      setVotes(votes)
    }
    const getProposalComments = async () => {
      const comments = await governanceService.getProposalComments(proposal.id);
      setComments(comments);
    }

    getProposalVotes();
    getProposalComments();
  }, [proposal])

  return (
    <IonItem onClick={(e) => history.push(`/proposal/${proposal.id}`)} lines="full">
      <ProfileAvatar ethAddress={proposal.user} profileInfo={proposal.userProfile}></ProfileAvatar>
      <IonLabel>
        <IonText>{proposal.title}</IonText>
        <IonChip className={proposal.status} outline={true}>
          {(proposal.status === "passed" || proposal.status === "enacted") &&
            <IonIcon icon={checkmark} />
          }
          <IonLabel>{proposal.status}</IonLabel>
        </IonChip>
        <IonChip className={proposal.type}>
          <IonLabel>{proposal.type.replace('_', ' ')}</IonLabel>
        </IonChip>
        <div className="meta">
          {proposal.userProfile &&
            <IonText color="primary">by {proposal.userProfile.avatars[0].name}</IonText>
          }
        </div>
        <div className="meta">
          {votes &&
            <IonText>{votes.length} votes</IonText>
          }
          {comments &&
            <IonText>{comments.totalComments} comments</IonText>
          }
          {proposal.status === "active" &&
            <IonText color="secondary">ends {formatDistanceToNowStrict(new Date(proposal.finish_at), { addSuffix: true })}</IonText>
          }
          {proposal.status !== "active" &&
            <IonText color="medium">ended {formatDistanceToNowStrict(new Date(proposal.finish_at), { addSuffix: true })}</IonText>
          }
        </div>
      </IonLabel>
    </IonItem>
  );
};

export default ProposalCard;
