import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonLabel } from '@ionic/react';
import { format } from 'date-fns';
import { calendarClear, location, time } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import './EventCard.css';
import RetriedImg from '../RetriedImg';

interface ContainerProps {
  event: DecentralandEvent,
}

const EventCard: React.FC<ContainerProps> = ({ event }) => {
  const history = useHistory();

  return (
    <IonCard className="event-card" onClick={(e) => history.push(`/event/${event.id}`)}>
      <div className="img-container">
        <RetriedImg alt={event.name} src={event.image} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"} retries={3}></RetriedImg>
      </div>
      <IonCardHeader>
        <IonCardTitle>
          {event.name}
        </IonCardTitle>
        <IonCardSubtitle>
          {!event.live &&
            <IonChip color="secondary" outline={true}>
              <IonIcon icon={calendarClear} />
              <IonLabel>{format(new Date(event.start_at), "MMM d, p")}</IonLabel>
            </IonChip>
          }
          {event.live &&
            <IonChip color="danger" outline={true}>
              <IonIcon icon={time} />
              <IonLabel>LIVE</IonLabel>
            </IonChip>
          }
        </IonCardSubtitle>
        <IonCardSubtitle>
          <IonChip className="scene" color="primary" outline={true}>
            <IonIcon icon={location} />
            {event.scene_name &&
              <IonLabel className="ellipsis">{event.scene_name} ({event.coordinates[0]},{event.coordinates[1]})</IonLabel>
            }
            {!event.scene_name &&
              <IonLabel className="ellipsis">{event.coordinates[0]},{event.coordinates[1]}</IonLabel>
            }
          </IonChip>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="price">
      </IonCardContent>
    </IonCard >
  );
};

export default EventCard;
