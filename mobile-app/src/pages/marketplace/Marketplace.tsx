import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Marketplace.css';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useEffect, useState } from 'react';
import { MarketplaceService } from '../../services/MarketplaceService';
import { Item } from '../../api/marketplace/Item';
import MarketplaceSlider from '../../components/marketplace/MarketplaceSlider';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import ToolbarMenuButton from '../../components/ToolbarMenuButton';

const Marketplace: React.FC = () => {

  const [newestWearables, setNewestWearables] = useState<Array<Item>>([]);

  const [newestEmotes, setNewestEmotes] = useState<Array<Item>>([]);

  const [newestLands, setNewestLands] = useState<Array<NFTInfo>>([]);

  const [newestNames, setNewestNames] = useState<Array<NFTInfo>>([]);

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Marketplace Home",
        screen_class: "Marketplace",
      },
    });
  }, []);

  useEffect(() => {
    getNewestWearables();
    getEmotes();
    getLands();
    getNames();
  }, []);

  const getNewestWearables = async () => {
    const marketplaceService = new MarketplaceService();
    const data = await marketplaceService.getNewestWearables();  
    setNewestWearables(data);
  }

  const getEmotes = async () => {
    const marketplaceService = new MarketplaceService();
    const data = await marketplaceService.getNewestEmotes();  
    setNewestEmotes(data);
  }

  const getLands = async () => {
    const marketplaceService = new MarketplaceService();
    const data = await marketplaceService.getNewestLands();
    setNewestLands(data);
  }

  const getNames = async () => {
    const marketplaceService = new MarketplaceService();
    const data = await marketplaceService.getNewestNames();
    setNewestNames(data);
  }

  return (
    <IonPage className="marketplace">
      <IonHeader>
        <IonToolbar>
          <ToolbarMenuButton></ToolbarMenuButton>
          <IonTitle>Marketplace</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Marketplace</IonTitle>
          </IonToolbar>
        </IonHeader>
        <MarketplaceSlider title="Wearables" target="/marketplace/wearables/recently_listed" itemType="Item" items={newestWearables}></MarketplaceSlider>
        <MarketplaceSlider title="Emotes" target="/marketplace/emotes/recently_listed" itemType="Item" items={newestEmotes}></MarketplaceSlider>
        <MarketplaceSlider title="Land" target="/marketplace/land/recently_listed" itemType="Land" items={newestLands}></MarketplaceSlider>
        <MarketplaceSlider title="Names" target="/marketplace/names/recently_listed" itemType="Name" items={newestNames}></MarketplaceSlider>
      </IonContent>
    </IonPage >
  );
};

export default Marketplace;
