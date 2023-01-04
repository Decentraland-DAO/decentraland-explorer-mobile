import { IonButton, IonButtons, IonCard, IonCardContent, IonCol, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel, IonModal, IonRow, IonSegment, IonSegmentButton, IonSpinner, IonText, IonToolbar } from '@ionic/react';
import { copy, filter } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { NftService } from '../../services/NftService';
import { ProfileService } from '../../services/ProfileService';
import '../marketplace/LocationInfo.css';
import '../marketplace/NameInfo.css';
import './AccountInfo.css';
import ProfileAvatar from './ProfileAvatar';
import ProfileName from './ProfileName';
import { StoreInfo } from '../../api/profile/StoreInfo';
import FilterModal, { FilterData } from '../marketplace/FilterModal';
import ItemCard from '../marketplace/ItemCard';
import NftInfoCard from '../marketplace/NftInfoCard';
import { MarketplaceService } from '../../services/MarketplaceService';
import { Item } from '../../api/marketplace/Item';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import SortByModal from '../marketplace/SortByModal';


interface ContainerProps {
  accountAddress: string,
  onProfileInfoLoaded?: (data: ProfileInfo) => void,
}

const AccountInfo: React.FC<ContainerProps> = ({ accountAddress, onProfileInfoLoaded }) => {

  const [loading, setLoading] = useState(true);

  const [assetsLoading, setAssetsLoading] = useState(true);

  const [originalsLoading, setOriginalsLoading] = useState(true);

  const [assetsSkip, setAssetsSkip] = useState(0);

  const [originalsSkip, setOriginalsSkip] = useState(0);

  const [showSortBy, setShowSortBy] = useState(false);

  const [showAssetsFilter, setShowAssetsFilter] = useState(false);

  const [assetsFilterData, setAssetsFilterData] = useState<FilterData>({
    category: "all",
    collection: "",
    gender: "all",
    network: "all",
    rarity: []
  });

  const [showOriginalsFilter, setShowOriginalsFilter] = useState(false);

  const [originalsFilterData, setOriginalsFilterData] = useState<FilterData>({
    category: "all",
    collection: "",
    gender: "all",
    network: "all",
    rarity: []
  });

  const [sortBy, setSortBy] = useState("newest");

  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);

  const [assets, setAssets] = useState<Array<NFTInfo>>([]);

  const [originals, setOriginals] = useState<Array<Item>>([]);

  const [segment, setSegment] = useState("assets");

  const contentEl = useRef(null);

  const profileService = new ProfileService();

  const nftService = new NftService();

  const marketplaceService = new MarketplaceService();

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        getProfileInfo(accountAddress);
        getStoreInfo(accountAddress);
      }
      finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (segment === "assets") {
      getAccountAssets(0, assetsFilterData);
    }
    else {
      getAccountOriginals(0, assetsFilterData);
    }
  }, [segment]);

  const handleAssetsFilterApplied = (filter: FilterData) => {
    setAssetsFilterData(filter);
    setShowAssetsFilter(false);
    if (segment === "assets") {
      setAssetsSkip(0);
      setAssets([]);
      getAccountAssets(0, filter);
    }
    else if (segment === "originals") {
      setOriginalsSkip(0);
      setOriginals([]);
      getAccountOriginals(0, filter);
    }
  }

  const handleOriginalsFilterApplied = (filter: FilterData) => {
    setOriginalsFilterData(filter);
    setShowOriginalsFilter(false);
    if (segment === "originals") {
      setOriginalsSkip(0);
      setOriginals([]);
      getAccountOriginals(0, filter);
    }
  }

  const getProfileInfo = async (profileId: string) => {
    const profileInfo = await profileService.getProfileInfo(profileId);
    setProfileInfo(profileInfo);
    if (onProfileInfoLoaded) {
      onProfileInfoLoaded(profileInfo as ProfileInfo);
    }
  }

  const getStoreInfo = async (profileId: string) => {
    const storeInfo = await profileService.getStoreInfo(profileId);
    setStoreInfo(storeInfo);
  }

  const getAccountAssets = async (offset: number, filterData: FilterData) => {
    if (offset === 0) {
      setAssetsLoading(true);
    }
    let category = "";
    let wearableCategory = "";
    if (filterData.category === "wearables") {
      category = "wearable";
    }
    else if (filterData.category === "names") {
      category = "ens";
    }
    else if (filterData.category === "emotes") {
      category = "emote";
    }
    else if (filterData.category === "land") {
      category = "land";
    }

    if (filterData.subCategory && filterData.subCategory !== "all") {
      wearableCategory = filterData.subCategory;
      if (filterData.subCategory2 && filterData.subCategory2 !== "all") {
        wearableCategory = filterData.subCategory2;
      }
    }

    const data = await nftService.getAccountNfts(accountAddress, category, wearableCategory, filterData.rarity, filterData.gender, filterData.network, filterData.collection, 24, offset);
    if (offset === 0) {
      setAssets(data);
    }
    else {
      setAssets([...assets, ...data]);
    }
    setAssetsLoading(false);
  }

  const getAccountOriginals = async (offset: number, filterData: FilterData) => {
    if (offset === 0) {
      setOriginalsLoading(true);
    }
    let category = "";
    let wearableCategory = "";
    if (filterData.category === "wearables") {
      category = "wearable";
    }
    else if (filterData.category === "emotes") {
      category = "emote";
    }
    if (filterData.subCategory && filterData.subCategory !== "all") {
      wearableCategory = filterData.subCategory;
      if (filterData.subCategory2 && filterData.subCategory2 !== "all") {
        wearableCategory = filterData.subCategory2;
      }
    }

    const data = await marketplaceService.getItems(category, wearableCategory, filterData.rarity, filterData.gender, filterData.network, filterData.collection, 24, offset, sortBy, undefined, accountAddress);
    if (offset === 0) {
      setOriginals(data);
    }
    else {
      setOriginals([...originals, ...data]);
    }
    setOriginalsLoading(false);
  }

  const getNextAssetsPage = async (e: any) => {
    await getAccountAssets(assetsSkip + 24, assetsFilterData);
    e.target.complete();
    setAssetsSkip(assetsSkip + 24);
  }

  const getNextOriginalsPage = async (e: any) => {
    await getAccountOriginals(originalsSkip + 24, originalsFilterData);
    e.target.complete();
    setOriginalsSkip(originalsSkip + 24);
  }

  const getBackgroundImage = (): string => {
    if (storeInfo) {
      if (storeInfo.content && storeInfo.content.length > 0) {
        const coverImage = storeInfo.content.find(c => c.file.indexOf("cover") >= 0);
        if (coverImage) {
          return `https://peer.decentraland.org/content/contents/${coverImage.hash}`;
        }
      }
    }
    return "";
  }

  const copyAddress = async () => {
    await Clipboard.write({
      string: accountAddress,
    });
    await Toast.show({ text: "Copied to clipboard!" });
  }

  return (
    <div className="account-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading &&
          <>
            <div className="img-container" style={{ backgroundImage: "url(" + getBackgroundImage() + ")", backgroundSize: "cover" }}>
              <ProfileAvatar profileInfo={profileInfo} ethAddress={accountAddress}></ProfileAvatar>
              <IonLabel>
                <h1><ProfileName profileInfo={profileInfo} ethAddress={accountAddress}></ProfileName></h1>
                <small>
                  {accountAddress.substring(0, 6) + "..." + accountAddress.substring(accountAddress.length - 5)}
                  <IonButton size="small" color="dark" fill="clear" onClick={copyAddress}><IonIcon icon={copy}></IonIcon></IonButton>
                </small>
                {storeInfo &&
                  <div className="store-description">
                    <IonText>
                      {storeInfo.metadata.description}
                    </IonText>
                  </div>
                }
              </IonLabel>
            </div>
            <IonCardContent className="nft-cards">
              <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
                <IonSegmentButton value="assets">
                  Assets
                  <small>collected</small>
                </IonSegmentButton>
                <IonSegmentButton value="originals">
                  Originals
                  <small>created</small>
                </IonSegmentButton>
              </IonSegment>
              {segment === "assets" &&
                <>
                  <IonHeader>
                    <IonToolbar>
                      <IonButtons slot="end">
                        <IonButton onClick={() => setShowAssetsFilter(true)}>
                          <IonIcon icon={filter}></IonIcon>
                        </IonButton>
                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  {assetsLoading &&
                    <IonCardContent className="loading">
                      <IonSpinner />
                    </IonCardContent>
                  }
                  {!assetsLoading &&
                    <>
                      <IonGrid className="nft-grid" ref={contentEl}>
                        <IonRow>
                          {assets && assets.map((nftInfo, index) =>
                            <IonCol key={index} size="6">
                              <NftInfoCard nftInfo={nftInfo}></NftInfoCard>
                            </IonCol>
                          )}
                        </IonRow>
                      </IonGrid>
                      <IonInfiniteScroll
                        onIonInfinite={getNextAssetsPage}
                      >
                        <IonInfiniteScrollContent
                          loadingSpinner="bubbles"
                          loadingText="Loading more data..."
                        ></IonInfiniteScrollContent>
                      </IonInfiniteScroll>
                    </>
                  }
                </>
              }
              {segment === "originals" &&
                <>
                  <IonHeader>
                    <IonToolbar>
                      <IonButtons slot="end">
                        <IonButton onClick={() => setShowOriginalsFilter(true)}>
                          <IonIcon icon={filter}></IonIcon>
                        </IonButton>
                      </IonButtons>
                    </IonToolbar>
                  </IonHeader>
                  {originalsLoading &&
                    <IonCardContent className="loading">
                      <IonSpinner />
                    </IonCardContent>
                  }
                  {!originalsLoading &&
                    <>
                      <IonGrid className="nft-grid">
                        <IonRow>
                          {originals && originals.map((item, index) =>
                            <IonCol key={index} size="6">
                              <ItemCard item={item}></ItemCard>
                            </IonCol>
                          )}
                        </IonRow>
                      </IonGrid>
                      <IonInfiniteScroll
                        onIonInfinite={getNextOriginalsPage}
                      >
                        <IonInfiniteScrollContent
                          loadingSpinner="bubbles"
                          loadingText="Loading more data..."
                        ></IonInfiniteScrollContent>
                      </IonInfiniteScroll>
                    </>
                  }
                </>
              }
            </IonCardContent>
          </>
        }
      </IonCard>
      <IonModal className="sort-by"
        isOpen={showSortBy}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowSortBy(false)}
      >
        <SortByModal
          onDismiss={() => setShowSortBy(false)}
          onApply={(val) => {
            setSortBy(val);
            setShowSortBy(false);
          }}
          value={sortBy}
        ></SortByModal>
      </IonModal>
      <IonModal className="filter-by"
        isOpen={showAssetsFilter}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowAssetsFilter(false)}
      >
        <FilterModal
          onDismiss={() => setShowAssetsFilter(false)}
          onApply={handleAssetsFilterApplied}
          value={assetsFilterData}
          hasAllCategoriesOption={true}
        ></FilterModal>
      </IonModal>
      <IonModal className="filter-by"
        isOpen={showOriginalsFilter}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowOriginalsFilter(false)}
      >
        <FilterModal
          onDismiss={() => setShowOriginalsFilter(false)}
          onApply={handleOriginalsFilterApplied}
          value={originalsFilterData}
          hasAllCategoriesOption={true}
          hiddenCategories={["land", "names"]}
        ></FilterModal>
      </IonModal>
    </div>
  );
};

export default AccountInfo;
