import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonLabel } from '@ionic/react';
import { useEffect, useState } from 'react';
import { FreeMode } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { GovernanceService } from '../../services/GovernanceService';
import { Utils } from '../../services/Utils';
import "./DAOSummary.css";

const DAOSummary: React.FC = () => {
    const [activeProposalsCount, setActiveProposalsCount] = useState<null | number>(null);

    const [proposalsEndingSoonCount, setProposalsEndingSoonCount] = useState<null | number>(null);

    const [votesThisWeek, setVotesThisWeek] = useState<null | number>(null);

    const [votesIn30Days, setVotesIn30Days] = useState<null | number>(null);

    const [treasury, setTreasury] = useState<null | number>(null);

    const utils = new Utils();

    useEffect(() => {
        const governanceService = new GovernanceService();
        
        const getActiveProposalsCount = async () => {
            const count = await governanceService.getActiveProposalsCount();
            setActiveProposalsCount(count);
        }

        const getProposalsEndingSoonCount = async () => {
            const count = await governanceService.getProposalsEndingSoonCount();
            setProposalsEndingSoonCount(count);
        }

        const getThisWeekVotesCount = async () => {
            const count = await governanceService.getVotesInThisWeekCount();
            setVotesThisWeek(count);
        }

        const get30DaysVotesCount = async () => {
            const count = await governanceService.getVotesIn30DaysCount();
            setVotesIn30Days(count);
        }

        const getTreasury = async () => {
            const balance = await governanceService.getBalance();
            setTreasury(balance);
        }

        getActiveProposalsCount();
        getProposalsEndingSoonCount();
        getThisWeekVotesCount();
        get30DaysVotesCount();
        getTreasury();

    }, []);

    return (
        <div className="dao-summary">
            <Swiper
                freeMode={true}
                slidesPerView="auto"
                modules={[FreeMode]}>
                <SwiperSlide>
                    <IonCard className="dao-summary-card">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h3>Proposals</h3>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                <IonLabel color="primary" >{activeProposalsCount} active proposals</IonLabel>
                            </IonCardSubtitle>
                            <IonCardSubtitle>
                                <IonLabel color="secondary">{proposalsEndingSoonCount} ending in the next 48 hours</IonLabel>
                            </IonCardSubtitle>
                        </IonCardHeader>
                    </IonCard >
                </SwiperSlide>
                <SwiperSlide>
                    <IonCard className="dao-summary-card">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h3>Votes</h3>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                <IonLabel color="primary">{votesThisWeek} votes this week</IonLabel>
                            </IonCardSubtitle>
                            <IonCardSubtitle>
                                <IonLabel color="secondary">{votesIn30Days} votes in last 30 days</IonLabel>
                            </IonCardSubtitle>
                        </IonCardHeader>
                    </IonCard >
                </SwiperSlide>
                <SwiperSlide>
                    <IonCard className="dao-summary-card">
                        <IonCardHeader>
                            <IonCardTitle>
                                <h3>Treasury</h3>
                            </IonCardTitle>
                            <IonCardSubtitle>
                                <IonLabel color="primary">{utils.formatUsd(treasury as number)}</IonLabel>
                            </IonCardSubtitle>
                            <IonCardSubtitle>
                                <IonLabel color="secondary">consolidated in USD</IonLabel>
                            </IonCardSubtitle>
                        </IonCardHeader>
                    </IonCard >
                </SwiperSlide>
            </Swiper>
        </div>
    )
}
export default DAOSummary;
