import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCardContent, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonModal, IonNote, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from "@ionic/react"
import { checkmark, ellipsisHorizontal, openOutline, shareSocialOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { FreeMode } from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import { CommentList } from "../../api/governance/CommentList";
import { LinkedWearablesConfiguration } from "../../api/governance/LinkedWearablesConfiguration";
import { POIConfiguration } from "../../api/governance/POIConfiguration";
import { Proposal } from "../../api/governance/Proposal";
import { Vote } from "../../api/governance/Vote";
import { ProfileInfo } from "../../api/profile/ProfileInfo";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import VotesModal from "../../components/governance/VotesModal";
import { GovernanceService } from "../../services/GovernanceService";
import { HttpClient } from "../../services/HttpClient";
import { ProfileService } from "../../services/ProfileService";
import { Utils } from "../../services/Utils";
import "./ProposalDetail.css";

interface PageProps
    extends RouteComponentProps<{
        proposalId: string,
    }> { }

const ProposalDetail: React.FC<PageProps> = ({ match }) => {

    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [proposalProfile, setProposalProfile] = useState<ProfileInfo | null>(null);
    const [votes, setVotes] = useState<Array<Vote>>([]);
    const [comments, setComments] = useState<CommentList | null>(null);
    const [sceneThumbnail, setSceneThumbnail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showVotes, setShowVotes] = useState(false);
    const governanceService = new GovernanceService();
    const profileService = new ProfileService();
    const utils = new Utils();
    const history = useHistory();

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "About",
                screen_class: "About",
            },
        });
    }, []);

    useEffect(() => {
        getProposal();
        getProposalVotes();
        getProposalComments();
    }, []);


    const getProposal = async () => {
        try {
            const proposal = await governanceService.getProposal(match.params.proposalId);
            setProposal(proposal)
            if (proposal.type === "poi") {
                getSceneThumbnail(proposal);
            }
            getProposalProfile(proposal);
        }
        finally {
            setLoading(false);
        }
    }

    const getProposalProfile = async (proposal: Proposal) => {
        const profile = await profileService.getProfileInfo(proposal.user as string);
        setProposalProfile(profile);
    }

    const getProposalVotes = async () => {
        const votes = await governanceService.getProposalVotes(match.params.proposalId);
        setVotes(votes);

    }

    const getProposalComments = async () => {
        const comments = await governanceService.getProposalComments(match.params.proposalId);
        setComments(comments);
    }

    const openExternalUrl = () => {
        Browser.open({ url: `https://governance.decentraland.org/proposal?id=${match.params.proposalId}` });
    }

    const shareItem = async () => {
        await Share.share({
            text: proposal?.title,
            url: `https://dcland.app/proposal/${match.params.proposalId}`,
            dialogTitle: 'Share with buddies',
        });
    }

    const getParcelImg = (proposal: Proposal) => {
        const config = proposal.configuration as POIConfiguration;
        return `https://api.decentraland.org/v1/parcels/${config.x}/${config.y}/map.png?width=256&height=256"`;
    }

    const getSceneThumbnail = async (proposal: Proposal) => {
        const config = proposal?.configuration as POIConfiguration;
        const sceneUrl = `https://peer.decentraland.org/content/entities/scene?pointer=${config.x},${config.y}`;
        const httpClient = new HttpClient();
        const scenes = await httpClient.get(sceneUrl, null);
        const scene = scenes[0];
        const thumbnailFile = scene.metadata.display.navmapThumbnail;
        const thumbnailContent = scene.content.find((c: any) => c.file === thumbnailFile);
        setSceneThumbnail(`https://peer.decentraland.org/content/contents/${thumbnailContent.hash}`);
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
            <IonText color={choiceIndex === 0 ? "success" : choiceIndex === 1 ? "danger" : "warning"}>{choice.toLowerCase()} {percentage}%</IonText>
        )
    }

    return (
        <IonPage className="proposal-detail">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>Proposal</IonTitle>
                    <IonButtons slot="end">
                        {proposal !== null &&
                            <>
                                <IonButton onClick={shareItem}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
                            </>
                        }
                        <IonButton onClick={openExternalUrl}><IonIcon icon={openOutline}></IonIcon></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Proposal</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {loading &&
                    <IonCardContent className="loading">
                        <IonSpinner />
                    </IonCardContent>
                }
                {!loading && proposal &&
                    <>
                        <div className="content">
                            <h3 className="title">{proposal?.title}</h3>
                            {proposalProfile &&
                                <div className="proposal-profile" onClick={() => history.push("/account/" + proposal.user)}>
                                    <ProfileAvatar ethAddress={proposal.user} profileInfo={proposalProfile}></ProfileAvatar>
                                    <IonLabel><IonText color="medium">{proposalProfile.avatars[0].name}</IonText></IonLabel>
                                </div>
                            }
                            <IonChip className={proposal?.status} outline={true}>
                                {(proposal?.status === "passed" || proposal?.status) === "enacted" &&
                                    <IonIcon icon={checkmark} />
                                }
                                <IonLabel>{proposal?.status}</IonLabel>
                            </IonChip>
                            <IonChip className={proposal?.type}>
                                <IonLabel>{proposal?.type.replace('_', ' ')}</IonLabel>
                            </IonChip>
                            {proposal?.type === "linked_wearables" && (proposal?.configuration as LinkedWearablesConfiguration).image_previews &&
                                <Swiper freeMode={true}
                                    slidesPerView="auto"
                                    modules={[FreeMode]}>
                                    {(proposal?.configuration as LinkedWearablesConfiguration).image_previews.map(preview =>
                                        <SwiperSlide>
                                            <IonImg src={preview} />
                                        </SwiperSlide>
                                    )}
                                </Swiper>
                            }
                            {proposal?.type === "poi" &&
                                <Swiper freeMode={true}
                                    slidesPerView="auto"
                                    modules={[FreeMode]}>
                                    {sceneThumbnail &&
                                        <SwiperSlide>
                                            <IonImg src={sceneThumbnail}></IonImg>
                                        </SwiperSlide>
                                    }
                                    <SwiperSlide>
                                        <IonImg src={getParcelImg(proposal)}></IonImg>
                                    </SwiperSlide>
                                </Swiper>
                            }
                            <IonText>
                                <p dangerouslySetInnerHTML={{ __html: utils.parseMarkdown(proposal?.description as string) }}></p>
                            </IonText>
                            <h2>Comments</h2>
                            <IonList className="comments">
                                {comments && comments.comments && comments.comments.map(comment =>
                                    <IonItem>
                                        <IonAvatar>
                                            <img alt={comment.username} src={comment.avatar_url}></img>
                                        </IonAvatar>
                                        <IonLabel>
                                            <IonNote>{comment.username}</IonNote>
                                            <IonText dangerouslySetInnerHTML={{ __html: utils.sanitize(comment.cooked) }}></IonText>
                                        </IonLabel>
                                    </IonItem>
                                )}
                                {comments === null &&
                                    <IonItem>
                                        <IonLabel>
                                            <IonText>No comments yet</IonText>
                                        </IonLabel>
                                    </IonItem>
                                }
                            </IonList>
                        </div>
                    </>
                }
            </IonContent>
            {proposal &&
                <>
                    <IonFooter>
                        <IonToolbar onClick={() => setShowVotes(true)}>
                            <IonTitle>
                                <IonText>Votes: </IonText>
                                {proposal.configuration.choices.map((choice, choiceIndex) =>
                                    renderChoice(choice, choiceIndex)
                                )}
                            </IonTitle>
                            <IonButtons slot="end">
                                <IonButton><IonIcon icon={ellipsisHorizontal}></IonIcon></IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonFooter>
                    <IonModal className="sort-by"
                        isOpen={showVotes}
                        onDidDismiss={() => setShowVotes(false)}
                    >
                        <VotesModal votes={votes} proposal={proposal} onDismiss={() => setShowVotes(false)} onVoted={getProposalVotes}></VotesModal>
                    </IonModal>
                </>
            }
        </IonPage >
    )
}
export default ProposalDetail;
