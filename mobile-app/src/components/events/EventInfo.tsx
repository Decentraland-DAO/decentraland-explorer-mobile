import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonSpinner, IonText } from '@ionic/react';
import { calendarClear, location, time } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { format } from "date-fns"
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { ProfileService } from '../../services/ProfileService';
import '../marketplace/LocationInfo.css';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileName from '../profile/ProfileName';
import RetriedImg from '../RetriedImg';
import { EventsService } from '../../services/EventsService';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import Linkify from 'react-linkify';
import { Browser } from '@capacitor/browser';
import { useHistory } from 'react-router';

interface ContainerProps {
  eventId: string
}

const EventInfo: React.FC<ContainerProps> = ({ eventId }) => {

  const [loading, setLoading] = useState(true);

  const [event, setEvent] = useState<DecentralandEvent | null>(null);

  const [ownerInfo, setOwnerInfo] = useState<ProfileInfo | null>(null);

  const history = useHistory();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const eventService = new EventsService();
        const event = await eventService.getEvent(eventId);
        setEvent(event);
        getProfileInfo(event?.user as string);
      }
      finally {
        setLoading(false);
      }
    };
    getData();
  }, [eventId]);

  const getProfileInfo = async (profileId: string) => {
    const profileService = new ProfileService();
    const profileInfo = await profileService.getProfileInfo(profileId);
    setOwnerInfo(profileInfo);
  }

  return (
    <div className="location-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading && event &&
          <>
            <RetriedImg className="main-img" alt={event.name} src={event.image} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land_512x256.png"} retries={5}></RetriedImg>
            <IonCardHeader>
              <IonCardTitle>{event.name}</IonCardTitle>
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
                <div className="owner-info">
                  <strong><IonText color="dark">Organized by</IonText></strong>
                  <IonItem className="owner" lines="none" onClick={() => history.push(`/account/${event.user}`)}>
                    <ProfileAvatar profileInfo={ownerInfo} ethAddress={event.user as string}></ProfileAvatar>
                    <IonLabel>
                      <ProfileName profileInfo={ownerInfo} ethAddress={event.user as string}></ProfileName>
                    </IonLabel>
                  </IonItem>
                </div>
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a onClick={(e) => Browser.open({ url: decoratedHref })} key={key}>
                    {decoratedText}
                  </a>
                )}>
                  {event.description}
                </Linkify>
              </p>
            </IonCardContent>
          </>
        }
      </IonCard>
    </div>
  );
};

export default EventInfo;
