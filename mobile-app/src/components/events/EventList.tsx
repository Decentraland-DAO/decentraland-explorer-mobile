import { IonChip, IonIcon, IonItem, IonLabel, IonList, IonNote, IonText, IonThumbnail } from '@ionic/react';
import { format } from 'date-fns';
import { calendarClear, time } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import "./EventList.css";
import RetriedImg from '../RetriedImg';

interface ContainerProps {
    events: Array<DecentralandEvent>,
}
const EventList: React.FC<ContainerProps> = ({ events }) => {
    const history = useHistory();
    return (
        <div className="event-list">
            <IonList>
                {events.length === 0 &&
                    <IonItem>
                        <IonLabel><IonNote>No records found</IonNote></IonLabel>
                    </IonItem>
                }
                {events.map((event, index) =>
                    <IonItem key={index} onClick={(e) => history.push(`/event/${event.id}`)}>
                        <IonThumbnail slot="start">
                            <RetriedImg src={event.image} alt={event.name} retries={5} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"}></RetriedImg>
                        </IonThumbnail>
                        <IonLabel>
                            <IonText>{event.name}</IonText>
                            {!event.live &&
                                <IonChip color="secondary" outline={true}>
                                    <IonIcon icon={calendarClear} />
                                    <IonLabel>{format(new Date(event.next_start_at), "MMM d, p")}</IonLabel>
                                </IonChip>
                            }
                            {event.live &&
                                <IonChip color="danger" outline={true}>
                                    <IonIcon icon={time} />
                                    <IonLabel>LIVE</IonLabel>
                                </IonChip>
                            }
                        </IonLabel>
                    </IonItem>
                )}
            </IonList>
        </div>
    )
}
export default EventList;
