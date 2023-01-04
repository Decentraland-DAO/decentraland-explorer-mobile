import { IonContent, IonHeader, IonPage, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/react';
import './Events.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useEffect, useState } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { EventsService } from '../../services/EventsService';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import EventSlider from '../../components/events/EventSlider';
import EventList from '../../components/events/EventList';
import ToolbarMenuButton from '../../components/ToolbarMenuButton';

const Events: React.FC = () => {

  const [highlightedEvents, setHighlightedEvents] = useState<Array<DecentralandEvent>>([]);

  const [trendingEvents, setTrendingEvents] = useState<Array<DecentralandEvent>>([]);

  const [allEvents, setAllEvents] = useState<Array<DecentralandEvent>>([]);

  const [segment, setSegment] = useState("trending");

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Events",
        screen_class: "Events",
      },
    });
  }, []);

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = async () => {
    const service = new EventsService();
    const events = await service.getEvents();
    const hEvents = [];
    const tEvents = [];
    for (const e of events) {
      if (e.highlighted) {
        hEvents.push(e);
      }
      else if (e.trending) {
        tEvents.push(e);
      }
    }
    setHighlightedEvents(hEvents);
    setTrendingEvents(tEvents);
    setAllEvents(events);
  }

  return (
    <IonPage className="events">
      <IonHeader>
        <IonToolbar>
          <ToolbarMenuButton></ToolbarMenuButton>
          <IonTitle>Events</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Events</IonTitle>
          </IonToolbar>
        </IonHeader>
        <EventSlider items={highlightedEvents}></EventSlider>
        <div>
          <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
            <IonSegmentButton value="trending">Trending</IonSegmentButton>
            <IonSegmentButton value="all">All</IonSegmentButton>
          </IonSegment>
          {segment === "trending" &&
            <EventList events={trendingEvents}></EventList>
          }
          {segment === "all" &&
            <EventList events={allEvents}></EventList>
          }
        </div>
      </IonContent>
    </IonPage >
  );
};

export default Events;
