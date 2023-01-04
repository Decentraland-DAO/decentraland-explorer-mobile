import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButtons, IonCardContent, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonSpinner, IonText, IonTitle, IonToolbar } from "@ionic/react"
import { useEffect, useState } from "react";
import { Vote } from "../../api/governance/Vote";
import { ProfileInfo } from "../../api/profile/ProfileInfo";
import ProfileAvatar from "../../components/profile/ProfileAvatar";
import ProfileName from "../../components/profile/ProfileName";
import { GovernanceService } from "../../services/GovernanceService";
import { ProfileService } from "../../services/ProfileService";
import "./About.css";


const About: React.FC = () => {

    const [proposalVotes, setProposalVotes] = useState<Array<Vote> | null>(null);
    const [loading, setLoading] = useState(true);

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
        getVotes();
    }, [])

    const getVotes = async () => {
        const governanceService = new GovernanceService();
        const votes = await governanceService.getProposalVotes("73b27280-fd23-11ec-a32a-859962cd3c29");
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
        setLoading(false);
    }

    return (
        <IonPage className="about">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>About</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">About</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {loading &&
                    <IonCardContent className="loading">
                        <IonSpinner />
                    </IonCardContent>
                }
                {!loading &&
                    <>
                        <div className="ad-free">
                            <IonText>
                                <p>Decentraland Explorer Mobile App is an attempt to bring Decentraland metaverse to “mobile” in an incremental manner. </p>
                                <p>The app was released in March 2022 and it is officially backed by Decentraland DAO as of July 20, 2022.
                                    Special thanks to the following community members who supported the app by their votes.
                                </p>
                            </IonText>
                            <IonText className="thanks">
                                <h3>Special Thanks</h3>
                            </IonText>
                        </div>
                        {proposalVotes?.map(vote =>
                            <IonItem className="owner" lines="none">
                                <ProfileAvatar profileInfo={vote.profileInfo} ethAddress={vote.profile}></ProfileAvatar>
                                <IonLabel>
                                    <ProfileName profileInfo={vote.profileInfo} ethAddress={vote.profile}></ProfileName>
                                </IonLabel>
                            </IonItem>
                        )}
                    </>
                }
            </IonContent>
        </IonPage >
    )
}
export default About;
