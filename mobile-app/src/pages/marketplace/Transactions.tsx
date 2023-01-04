import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonModal, IonPage, IonSegment, IonSegmentButton, IonSpinner, IonText, IonThumbnail, IonTitle, IonToolbar } from '@ionic/react';
import './Transactions.css';
import { useEffect, useRef, useState } from 'react';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import ToolbarMenuButton from '../../components/ToolbarMenuButton';
import { BidsSalesService } from '../../services/BidsSalesService';
import { Utils } from '../../services/Utils';
import { format } from 'date-fns';
import ProfileName from '../../components/profile/ProfileName';
import { Bid } from '../../graph/Bid';
import { Sale } from '../../graph/Sale';
import { filter } from 'ionicons/icons';
import RetriedImg from '../../components/RetriedImg';
import { useHistory } from 'react-router';
import BidsSalesFilter from '../../components/marketplace/BidsSalesFilter';
import { CollectionSale } from '../../graph/CollectionSale';

const Transactions: React.FC = () => {

  const contentEl = useRef(null);

  const [loading, setLoading] = useState(false);

  const [segment, setSegment] = useState("sales");

  const [showFilter, setShowFilter] = useState(false);

  const [filterBy, setFilterBy] = useState("");

  const [skip, setSkip] = useState(0);

  const [bids, setBids] = useState<Array<Bid>>([]);

  const [sales, setSales] = useState<Array<Sale>>([]);

  const [mints, setMints] = useState<Array<CollectionSale>>([]);

  const utils = new Utils();

  const history = useHistory();

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "TxBrowser",
        screen_class: "TxBrowser",
      },
    });
  }, []);

  useEffect(() => {
    setSkip(0);
    getData(0);
  }, [filterBy, segment]);

  const getData = async (offset: number) => {
    try {
      if (offset === 0) {
        setBids([]);
        setSales([]);
        setMints([]);
        (contentEl.current as any).scrollToTop();
        setLoading(true);
      }
      if (segment === "bids") {
        await getBids(offset);
      }
      else if (segment === "sales") {
        await getSales(offset);
      }
      else if (segment === "mints") {
        await getMints(offset);
      }
    }
    finally {
      setLoading(false);
    }
  }

  const getBids = async (offset: number) => {
    if (offset === 0) {
      setBids([]);
    }
    const service = new BidsSalesService();
    const data = await service.getBids(50, offset, filterBy);
    setBids(bids);
    if (offset === 0) {
      setBids(data);
    }
    else {
      setBids([...bids, ...data]);
    }
  }

  const getSales = async (offset: number) => {
    if (offset === 0) {
      setSales([]);
    }
    const service = new BidsSalesService();
    const data = await service.getSales(50, offset, filterBy);
    if (offset === 0) {
      setSales(data);
    }
    else {
      setSales([...sales, ...data]);
    }
  }

  const getMints = async (offset: number) => {
    if (offset === 0) {
      setMints([]);
    }
    const service = new BidsSalesService();
    const data = await service.getCollectionSales(50, offset);
    if (offset === 0) {
      setMints(data);
    }
    else {
      setMints([...mints, ...data]);
    }
  }

  const getNextPage = async (e: any) => {
    try {
      await getData(skip + 24);
      setSkip(skip + 24);
    }
    finally {
      e.target.complete();
    }
  }

  const handleBidClick = (bid: Bid | Sale) => {
    if (bid.nft.estate) {
      history.push(`/land/${bid.nft.estate.parcels[0].x}/${bid.nft.estate.parcels[0].y}`)
    }
    else if (bid.nft.parcel) {
      history.push(`/land/${bid.nft.parcel.x}/${bid.nft.parcel.y}`);
    }
    else if (bid.nft.wearable) {
      history.push(`/wearable/${bid.nft.contractAddress}/${bid.nft.tokenId}`);
    }
    else if (bid.nft.ens) {
      history.push(`/name/${bid.nft.contractAddress}/${bid.nft.tokenId}`);
    }
    else if (bid.nft.emote) {
      history.push(`/emote/${bid.nft.contractAddress}/${bid.nft.tokenId}`);
    }
  }

  const handleMintClick = (mint: CollectionSale) => {
    try {
      if (mint.item.metadata.emote) {
        history.push(`/emote/${mint.nft.contractAddress}/${mint.nft.tokenId}`);
      }
      else if (mint.item.metadata.wearable) {
        history.push(`/wearable/${mint.nft.contractAddress}/${mint.nft.tokenId}`);
      }
    }
    catch {
    }
  }

  const getBidStatus = (bid: Bid) => {
    let status = bid.status;
    if (bid.status === "open") {
      if (parseInt(bid.expiresAt) < (new Date()).getTime()) {
        status = "expired";
      }
      else {
        status = bid.status;
      }
    }
    return (<span className={"status " + status}>{status}</span>);
  }

  const getNftTitle = (bid: Bid | Sale) => {
    if (bid.nft.name) {
      return bid.nft.name;
    }
    else {
      if (bid.nft.parcel) {
        return "Parcel " + bid.nft.parcel.x + "," + bid.nft.parcel.y;
      }
      else if (bid.nft.estate) {
        return "Estate";
      }
      else {
        return "";
      }
    }
  }

  const getMintTitle = (mint: CollectionSale): string => {
    try {
      if (mint.item.metadata.emote) {
        return mint.item.metadata.emote.name;
      }
      else if (mint.item.metadata.wearable) {
        return mint.item.metadata.wearable.name;
      }
      else {
        return "";
      }
    }
    catch {
      return "";
    }
  }

  const getMintRarity = (mint: CollectionSale): string => {
    try {
      if (mint.item.metadata.emote) {
        return mint.item.metadata.emote.rarity;
      }
      else if (mint.item.metadata.wearable) {
        return mint.item.metadata.wearable.rarity;
      }
      else {
        return "";
      }
    }
    catch {
      return "";
    }
  }

  return (
    <IonPage className="transactions">
      <IonHeader>
        <IonToolbar>
          <ToolbarMenuButton></ToolbarMenuButton>
          <IonTitle>Tx Browser</IonTitle>
          <IonButtons slot="end">
            {segment !== "mints" &&
              <IonButton onClick={() => setShowFilter(true)}>
                <IonIcon icon={filter}></IonIcon>
              </IonButton>
            }
          </IonButtons>
        </IonToolbar>
        <IonToolbar className="segments">
          <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
            <IonSegmentButton value="sales">Sales</IonSegmentButton>
            <IonSegmentButton value="bids">Bids</IonSegmentButton>
            <IonSegmentButton value="mints">Mints</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentEl} fullscreen>
        {loading &&
          <div className="loading">
            <IonSpinner />
          </div>
        }
        <IonList className="bids">
          {segment === "bids" &&
            <>
              {bids.map((bid, index) =>
                <IonItem className="bid-row" key={index} onClick={(e) => handleBidClick(bid)}>
                  <IonItem lines="none">
                    {bid.category === "ens" &&
                      <IonThumbnail className="ens-thumbnail" slot="start">
                        <div>
                          <small>{bid.nft.name}</small>
                        </div>
                      </IonThumbnail>
                    }
                    {bid.category !== "ens" &&
                      <IonThumbnail slot="start" className={bid.nft.wearable?.rarity}>
                        <RetriedImg src={bid.nft.image + "?size=1&width=128&height=128"} retries={5} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"}></RetriedImg>
                      </IonThumbnail>
                    }
                    <IonLabel>
                      <IonText>{getNftTitle(bid)}</IonText><br />
                      {/* <ProfileAvatar profileInfo={null} ethAddress={bid.bidder as string}></ProfileAvatar> */}
                      <IonLabel className="bidder">
                        bidder: <ProfileName profileInfo={null} ethAddress={bid.bidder as string}></ProfileName>...
                      </IonLabel><br />
                      <IonLabel>
                        <>
                          {getBidStatus(bid)}
                        </>
                      </IonLabel>
                    </IonLabel>
                  </IonItem>
                  <IonLabel slot="end" className="price-date">
                    <IonText><i className={"mana ethereum"}></i></IonText>
                    <IonText>{utils.formatPrice(bid.price / (1e18))}</IonText><br />
                    <IonText>exp. {format(new Date(parseInt(bid.expiresAt)), "PPP")}</IonText>
                  </IonLabel>
                </IonItem>
              )}
            </>
          }
          {segment === "sales" &&
            <>
              {sales.map((sale, index) =>
                <IonItem className="bid-row" key={index} onClick={(e) => handleBidClick(sale)}>
                  <IonItem lines="none">
                    {sale.nft.ens &&
                      <IonThumbnail className="ens-thumbnail" slot="start">
                        <div>
                          <small>{sale.nft.name}</small>
                        </div>
                      </IonThumbnail>
                    }
                    {!sale.nft.ens &&
                      <IonThumbnail slot="start" className={sale.nft.wearable?.rarity}>
                        <RetriedImg src={sale.nft.image + "?size=1&width=128&height=128"} retries={5} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"}></RetriedImg>
                      </IonThumbnail>
                    }
                    <IonLabel>
                      <IonText>{getNftTitle(sale)}</IonText><br />
                      <IonLabel className="bidder">
                        buyer: <ProfileName profileInfo={null} ethAddress={sale.buyer as string}></ProfileName>...
                      </IonLabel><br />
                    </IonLabel>
                  </IonItem>
                  <IonLabel slot="end" className="price-date">
                    <IonText><i className={"mana ethereum"}></i></IonText>
                    <IonText>{utils.formatPrice(sale.price / (1e18))}</IonText><br />
                    <IonText>{format(new Date(parseInt(sale.timestamp) * 1000), "PPP")}</IonText>
                  </IonLabel>
                </IonItem>
              )
              }
            </>
          }
          {segment === "mints" &&
            <>
              {mints.map((mint, index) =>
                <IonItem className="bid-row" key={index} onClick={(e) => handleMintClick(mint)}>
                  <IonItem lines="none">
                    <IonThumbnail slot="start" className={getMintRarity(mint)}>
                      <RetriedImg src={mint.nft.image + "?size=1&width=128&height=128"} retries={5} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"}></RetriedImg>
                    </IonThumbnail>
                    <IonLabel>
                      <IonText>{getMintTitle(mint)}</IonText><br />
                      <IonLabel className="bidder">
                        buyer: <ProfileName profileInfo={null} ethAddress={mint.buyer as string}></ProfileName>...
                      </IonLabel><br />
                    </IonLabel>
                  </IonItem>
                  <IonLabel slot="end" className="price-date">
                    <IonText><i className={"mana ethereum"}></i></IonText>
                    <IonText>{utils.formatPrice(mint.price / (1e18))}</IonText><br />
                    <IonText>{format(new Date(parseInt(mint.timestamp) * 1000), "PPP")}</IonText>
                  </IonLabel>
                </IonItem>
              )
              }
            </>
          }
          {(sales.length > 0 || bids.length > 0 || mints.length > 0) &&
            <IonInfiniteScroll
              onIonInfinite={getNextPage}
            >
              <IonInfiniteScrollContent
                loadingSpinner="bubbles"
                loadingText="Loading more data..."
              ></IonInfiniteScrollContent>
            </IonInfiniteScroll>
          }
        </IonList>
      </IonContent>
      <IonModal className="filter-by"
        isOpen={showFilter}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5]}
        swipeToClose={true}
        onDidDismiss={() => setShowFilter(false)}
      >
        <BidsSalesFilter
          onDismiss={() => setShowFilter(false)}
          onApply={(val) => {
            setFilterBy(val);
            setShowFilter(false);
          }}
          value={filterBy}
        ></BidsSalesFilter>
      </IonModal>
    </IonPage >
  );
};

export default Transactions;
