import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonSegment, IonSegmentButton, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import './Favorites.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useEffect, useState } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { FavoritesService } from '../../services/FavoritesService';
import { Item } from '../../api/marketplace/Item';
import ItemCard from '../../components/marketplace/ItemCard';
import LandCard from '../../components/marketplace/LandCard';
import { NFTInfo } from '../../api/nft/NFTInfo';
import NameCard from '../../components/marketplace/NameCard';
import EventSlider from '../../components/events/EventSlider';
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import ToolbarMenuButton from '../../components/ToolbarMenuButton';

const Favorites: React.FC = () => {

  const [lands, setLands] = useState<Array<NFTInfo> | null>([]);

  const [items, setItems] = useState<Array<Item> | null>([]);

  const [names, setNames] = useState<Array<NFTInfo> | null>([]);

  const [events, setEvents] = useState<Array<DecentralandEvent> | null>([]);

  const [segment, setSegment] = useState("wearables");

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Favorites",
        screen_class: "Favorites",
      },
    });
  }, []);

  useIonViewDidEnter(() => {
    getFavorites();
  });

  const getFavorites = async () => {
    const favoritesService = new FavoritesService();
    const items = await favoritesService.getItems();
    const lands = await favoritesService.getLands();
    const names = await favoritesService.getNames();
    const events = await favoritesService.getEvents();
    setEvents(events);
    setItems(items);
    setLands(lands);
    setNames(names);
  }

  return (
    <IonPage className="favorites">
      <IonHeader>
        <IonToolbar>
          <ToolbarMenuButton></ToolbarMenuButton>
          <IonTitle>Favorites</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Favorites</IonTitle>
          </IonToolbar>
        </IonHeader>
        {events && events.length > 0 &&
          <EventSlider items={events}></EventSlider>
        }
        <div>
          <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
            <IonSegmentButton value="wearables">Wearables</IonSegmentButton>
            <IonSegmentButton value="lands">Lands</IonSegmentButton>
            <IonSegmentButton value="names">Names</IonSegmentButton>
          </IonSegment>
          {segment === "wearables" &&
            <IonGrid>
              <IonRow>
                {items?.length === 0 &&
                  <IonCol>
                    <p style={{ textAlign: "center" }}>No favorite wearables yet!</p>
                  </IonCol>
                }
                {items && items.map((i, index) =>
                  <IonCol key={index} size="6">
                    <ItemCard item={i}></ItemCard>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          }
          {segment === "lands" &&
            <IonGrid>
              <IonRow>
                {lands?.length === 0 &&
                  <IonCol>
                    <p style={{ textAlign: "center" }}>No favorite lands yet!</p>
                  </IonCol>
                }
                {lands && lands.map((land, index) =>
                  <IonCol key={index} size="6">
                    <LandCard item={land}></LandCard>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          }
          {segment === "names" &&
            <IonGrid>
              <IonRow>
                {names?.length === 0 &&
                  <IonCol>
                    <p style={{ textAlign: "center" }}>No favorite names yet!</p>
                  </IonCol>
                }
                {names && names.map((name, index) =>
                  <IonCol key={index} size="6">
                    <NameCard item={name}></NameCard>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>
          }
        </div>
      </IonContent>
    </IonPage >
  );
};

export default Favorites;
