import { IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { calendar, map, star, storefront, swapHorizontal } from 'ionicons/icons';
import { Redirect, Route, useHistory } from 'react-router';
import Events from './events/Events';
import Favorites from './profile/Favorites';
import Marketplace from './marketplace/Marketplace';
import MetaverseMap from './map/MetaverseMap';
import Transactions from './marketplace/Transactions';

const Home: React.FC = () => {
  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home/map">
            <MetaverseMap />
          </Route>
          <Route exact path="/home/marketplace">
            <Marketplace />
          </Route>
          <Route exact path="/home/events">
            <Events />
          </Route>
          <Route exact path="/home/favorites">
            <Favorites />
          </Route>
          <Route exact path="/home/transactions">
            <Transactions />
          </Route>
          <Redirect exact={true} from="/home" to="/home/map" />
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="favorites" href="/home/favorites">
            <IonIcon icon={star} />
          </IonTabButton>
          <IonTabButton tab="marketplace" href="/home/marketplace">
            <IonIcon icon={storefront} />
          </IonTabButton>
          <IonTabButton tab="map" href="/home/map">
            <IonIcon icon={map} />
          </IonTabButton>
          <IonTabButton tab="events" href="/home/events">
            <IonIcon icon={calendar} />
          </IonTabButton>
          <IonTabButton tab="transactions" href="/home/transactions">
            <IonIcon icon={swapHorizontal} />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default Home;
