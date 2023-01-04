import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonModal, IonPage, IonRow, IonSearchbar, IonSpinner, IonToolbar } from '@ionic/react';
import { filter, swapVertical } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Item } from '../../api/marketplace/Item';
import { NFTInfo } from '../../api/nft/NFTInfo';
import FilterModal, { FilterData } from '../../components/marketplace/FilterModal';
import ItemCard from '../../components/marketplace/ItemCard';
import LandCard from '../../components/marketplace/LandCard';
import NameCard from '../../components/marketplace/NameCard';
import SortByModal from '../../components/marketplace/SortByModal';
import { MarketplaceService } from '../../services/MarketplaceService';
import './MarketplaceBrowser.css';

interface PageProps
  extends RouteComponentProps<{
    category: string,
    sortBy: string
  }> { }

const MarketplaceBrowser: React.FC<PageProps> = ({ match }) => {
  const contentEl = useRef(null);

  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [skip, setSkip] = useState(0);
  const [showSortBy, setShowSortBy] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterData, setFilterData] = useState<FilterData>();
  const [sortBy, setSortBy] = useState(match.params.sortBy);

  const [wearables, setWearables] = useState<Array<Item>>([]);
  const [emotes, setEmotes] = useState<Array<Item>>([]);
  const [lands, setLands] = useState<Array<NFTInfo>>([]);
  const [names, setNames] = useState<Array<NFTInfo>>([]);

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Marketplace Browser",
        screen_class: "MarketplaceBrowser",
      },
    });
  }, []);

  useEffect(() => {
    // prepare filter data
    handleFilterApplied({
      category: match.params.category,
      collection: "all",
      gender: "all",
      network: "all",
      rarity: [],
    })
  }, []);

  useEffect(() => {
    if (filterData) {
      handleFilterApplied(filterData);
    }
  }, [sortBy]);

  useEffect(() => {
    if (filterData) {
      handleFilterApplied(filterData);
    }
  }, [keyword]);

  const handleFilterApplied = (filter: FilterData) => {
    setShowFilter(false);
    setSkip(0);
    setFilterData(filter);
    setWearables([]);
    setEmotes([]);
    setLands([]);
    setNames([]);

    (contentEl.current as any).scrollToTop();
    getData(0, filter);
  }

  const getData = async (offset: number, filter: FilterData) => {
    const marketplaceService = new MarketplaceService();
    try {
      setLoading(true);
      if (filter.category === "wearables") {
        const data = await marketplaceService.getWearables(keyword, filter.subCategory, filter.subCategory2, filter.rarity, filter.gender, filter.network, filter.collection, 24, offset, sortBy);
        if (offset === 0) {
          setWearables(data);
        }
        else {
          setWearables([...wearables, ...data]);
        }
      }
      else if (filter.category === "emotes") {
        const data = await marketplaceService.getEmotes(keyword, filter.subCategory, filter.subCategory2, filter.rarity, filter.gender, filter.network, filter.collection, 24, offset, sortBy);
        if (offset === 0) {
          setEmotes(data);
        }
        else {
          setEmotes([...emotes, ...data]);
        }
      }
      else if (filter.category === "names") {
        const data = await marketplaceService.getNames(keyword, 24, offset, sortBy);
        if (offset === 0) {
          setNames(data);
        }
        else {
          setNames([...names, ...data]);
        }

      }
      else if (filter.category === "land") {
        const data = await marketplaceService.getLands(keyword, 24, offset, sortBy);
        if (offset === 0) {
          setLands(data);
        }
        else {
          setLands([...lands, ...data]);
        }
      }
    }
    finally {
      setLoading(false);
    }
  }  

  const getNextPage = async (e: any) => {
    await getData(skip + 24, filterData as FilterData);
    e.target.complete();
    setSkip(skip + 24);
  }

  return (
    <IonPage className="marketplace-browser">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonSearchbar searchIcon={undefined} debounce={1000} onIonChange={(e) => setKeyword(e.detail.value as string)} value={keyword}></IonSearchbar>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFilter(true)}>
              <IonIcon icon={filter}></IonIcon>
            </IonButton>
            <IonButton onClick={() => setShowSortBy(true)}>
              <IonIcon icon={swapVertical}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentEl} fullscreen>
        {loading &&
          <div className="loading">
            <IonSpinner />
          </div>
        }
        <IonGrid>
          <IonRow>
            {wearables && wearables.map((i, index) =>
              <IonCol key={index}>
                <ItemCard item={i}></ItemCard>
              </IonCol>
            )}
            {emotes && emotes.map((i, index) =>
              <>
              <IonCol key={index}>
                <ItemCard item={i}></ItemCard>
              </IonCol>
              </>
            )}
            {lands && lands.map((land, index) =>
              <IonCol key={index}>
                <LandCard item={land}></LandCard>
              </IonCol>
            )}
            {names && names.map((name, index) =>
              <IonCol key={index}>
                <NameCard item={name}></NameCard>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        <IonInfiniteScroll
          onIonInfinite={getNextPage}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more data..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
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
        isOpen={showFilter}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowFilter(false)}
      >
        <FilterModal
          onDismiss={() => setShowFilter(false)}
          onApply={handleFilterApplied}
          value={filterData}
        ></FilterModal>
      </IonModal>
    </IonPage >
  );
};

export default MarketplaceBrowser;
