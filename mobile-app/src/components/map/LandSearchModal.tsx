import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { IonChip, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSearchbar, IonSpinner, IonText, IonThumbnail, IonToolbar } from '@ionic/react';
import { arrowBack, grid, location } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { NFT } from '../../api/nft/NFT';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { MapService } from '../../services/MapService';
import './LandSearchModal.css';
import RetriedImg from '../RetriedImg';

interface ContainerProps {
  onDismiss: () => void,
  onLandSelected: (land: NFT) => void,
}

const LandSearchModal: React.FC<ContainerProps> = ({ onDismiss, onLandSelected }) => {

  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<NFTInfo>>([]);
  const searchEl = useRef<HTMLIonSearchbarElement | null>(null);

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Land Search",
        screen_class: "LandSearch",
      },
    });
  }, []);

  useEffect(() => {
    // auto-focus on search bar
    setTimeout(() => {
      (searchEl.current as HTMLIonSearchbarElement).setFocus();
    }, 500);
  }, [])

  const searchLand = async (e: any) => {
    setSearchResults([]);
    const keyword = e.target.value;
    if (keyword.length >= 3) {
      try {
        setLoading(true);
        const mapService = new MapService();
        const data = await mapService.searchLand(25, 0, false, keyword);
        setSearchResults(data);
      }
      finally {
        setLoading(false);
      }
    }
  }

  const handleSearchbarClick = async (e: any) => {
    const searchInput = await searchEl.current?.getInputElement() as HTMLElement;
    const searchInputRect = searchInput?.getBoundingClientRect();
    const paddingLeftStyle = (e.view as Window).getComputedStyle(searchInput as HTMLElement).paddingLeft;
    const paddingLeft = parseInt(paddingLeftStyle.replace("px", ""));
    if (e.clientX < (searchInputRect?.x as number + paddingLeft)) {
      onDismiss();
    }
  }

  const handleSearchResultClicked = (result: NFTInfo) => {
    const nft = result.nft;
    onLandSelected(nft);
    onDismiss();
  }

  return (
    <>
      <IonHeader className="land-search-modal">
        <IonToolbar>
          <IonSearchbar ref={searchEl} searchIcon={arrowBack} debounce={1000} onIonChange={(e) => searchLand(e)} onClick={(e) => handleSearchbarClick(e)}></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent className="land-search-modal">
        <>
          {loading &&
            <div className="loading">
              <IonSpinner />
            </div>
          }
          <div className="land-search-results">
            <IonList>
              {searchResults.map((searchResult, index) =>
                <IonItem key={index} onClick={(e) => handleSearchResultClicked(searchResult)}>
                  <IonThumbnail slot="start">
                    <RetriedImg src={searchResult.nft.image + "?size=1&width=128&height=128"} alt={searchResult.nft.name} retries={5} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"}></RetriedImg>
                  </IonThumbnail>
                  <IonLabel>
                    <IonText>{searchResult.nft.name}</IonText>
                    <br />
                    {searchResult.nft.data.estate &&
                      <div>
                        <IonChip color="primary" outline={true}>
                          <IonIcon icon={grid} />
                          <IonLabel>Estate</IonLabel>
                        </IonChip>
                        <IonChip color="secondary" outline={true}>
                          <IonIcon icon={location} />
                          <IonLabel>{searchResult.nft.data.estate?.size} Parcels</IonLabel>
                        </IonChip>
                      </div>
                    }
                    {searchResult.nft.data.parcel &&
                      <div>
                        <IonChip color="primary" outline={true}>
                          <IonIcon icon={location} />
                          <IonLabel>{searchResult.nft.data.parcel.x},{searchResult.nft.data.parcel.y}</IonLabel>
                        </IonChip>
                      </div>
                    }
                  </IonLabel>
                </IonItem>
              )}
            </IonList>
          </div>
        </>
      </IonContent>
    </>
  );
};

export default LandSearchModal;
