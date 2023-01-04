import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Home from './pages/Home';
import MarketplaceBrowser from './pages/marketplace/MarketplaceBrowser';
import LandDetails from './pages/marketplace/LandDetails';
import NameDetails from './pages/marketplace/NameDetails';
import ItemDetails from './pages/marketplace/ItemDetails';
import { Network } from '@capacitor/network';
import { useEffect, useState } from 'react';
import NoConnection from './pages/other/NoConnection';
import EventDetails from './pages/events/EventDetails';
import AppUrlListener from './AppUrlListener';
import WearableDetails from './pages/marketplace/WearableDetails';
import Feedback from './pages/other/Feedback';
import AppMenu from './components/AppMenu';
import ErrorBoundary from './ErrorBoundary';
import EmoteDetails from './pages/marketplace/EmoteDetails';
import AnnouncementDetails from './pages/other/AnnouncementDetails';
import About from './pages/other/About';
import AccountDetails from './pages/profile/AccountDetails';
import { Web3Modal } from '@web3modal/react'
import { chains, providers } from '@web3modal/ethereum';
import DAO from './pages/governance/DAO';
import Proposals from './pages/governance/Proposals';
import ProposalDetail from './pages/governance/ProposalDetail';
import { ConfigOptions } from '@web3modal/core';
import Settings from './pages/profile/Settings';

const config: ConfigOptions = {
  projectId: '5c4477cb8656b17ea0fb30a7ecf96a1e',
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'Decentraland Explorer',
    autoConnect: true,
    chains: [chains.mainnet],
    providers: [providers.walletConnectProvider({ projectId: "5c4477cb8656b17ea0fb30a7ecf96a1e" })]
  }
}

setupIonicReact();

const App: React.FC = () => {

  const [connected, setConnected] = useState(true);

  useEffect(() => {
    Network.addListener('networkStatusChange', status => {
      setConnected(status.connected);
    });

    const getCurrentNetworkStatus = async () => {
      const result = await Network.getStatus();
      setConnected(result.connected);
    };

    getCurrentNetworkStatus();
  }, [])

  return (
    <>
      <IonApp>
        {connected &&
          <>
            <IonReactRouter>
              <AppUrlListener></AppUrlListener>
              <AppMenu></AppMenu>
              <IonRouterOutlet id="router-outlet">
                <Route exact path="/">
                  <Redirect to="/home/map" />
                </Route>
                <Route path="/home">
                  <Home />
                </Route>
                <ErrorBoundary>
                  <Route path="/marketplace/:category/:sortBy" component={MarketplaceBrowser} />
                  <Route path="/land/:x/:y" component={LandDetails} />
                  <Route path="/name/:contractAddress/:tokenId" component={NameDetails} />
                  <Route path="/wearable/:contractAddress/:tokenId" component={WearableDetails} />
                  <Route path="/emote/:contractAddress/:tokenId" component={EmoteDetails} />
                  <Route path="/item/:contractAddress/:itemId" component={ItemDetails} />
                  <Route path="/account/:accountAddress" component={AccountDetails} />
                  <Route path="/event/:eventId" component={EventDetails} />
                  <Route path="/announcement/:announcementId" component={AnnouncementDetails} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/feedback" component={Feedback} />
                  <Route path="/about" component={About} />
                  <Route path="/dao" component={DAO} />
                  <Route path="/proposals" component={Proposals} />
                  <Route path="/proposal/:proposalId" component={ProposalDetail} />
                </ErrorBoundary>
              </IonRouterOutlet>
            </IonReactRouter>

          </>
        }
        {!connected &&
          <NoConnection></NoConnection>
        }
      </IonApp>
      <Web3Modal config={config}></Web3Modal>
    </>
  )
}

export default App;
