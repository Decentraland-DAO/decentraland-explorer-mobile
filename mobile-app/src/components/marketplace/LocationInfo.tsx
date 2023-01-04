import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSegment, IonSegmentButton, IonSpinner, IonText } from '@ionic/react';
import { business, flag, grid, location, pricetag, trailSign } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from "date-fns"
import { Attribute } from '../../api/map/Attribute';
import { EstateInfo } from '../../api/map/EstateInfo';
import { ParcelInfo } from '../../api/map/ParcelInfo';
import { Bid } from '../../api/nft/Bid';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { Sale } from '../../api/nft/Sale';
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { MapService } from '../../services/MapService';
import { NftService } from '../../services/NftService';
import { ProfileService } from '../../services/ProfileService';
import { Utils } from '../../services/Utils';
import './LocationInfo.css';
import { TileInfo } from '../../api/map/TileInfo';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileName from '../profile/ProfileName';
import RetriedImg from '../RetriedImg';
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { useHistory } from 'react-router';

interface ContainerProps {
  x: number,
  y: number,
  onDataLoaded?: (data: EstateInfo | ParcelInfo) => void,
  onNFTInfoLoaded?: (data: NFTInfo) => void,
}

const LocationInfo: React.FC<ContainerProps> = ({ x, y, onDataLoaded, onNFTInfoLoaded }) => {

  const [loading, setLoading] = useState(true);

  const [isEstate, setIsEstate] = useState(false);

  const [tileInfo, setTileInfo] = useState<TileInfo | null>(null);

  const [attributes, setAttributes] = useState<Array<Attribute>>([]);

  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);

  const [ownerInfo, setOwnerInfo] = useState<ProfileInfo | null>(null);

  const [sales, setSales] = useState<Array<Sale>>([]);

  const [bids, setBids] = useState<Array<Bid>>([]);

  const [loadSalesProfiles, setLoadSalesProfiles] = useState(false);

  const [loadBidsProfiles, setLoadBidsProfiles] = useState(false);

  const [segment, setSegment] = useState("sales");

  const [segmentList, setSegmentList] = useState("sales");

  const history = useHistory();

  const utils = new Utils();

  useEffect(() => {
    getData();

    FirebaseAnalytics.logEvent({
      name: "select_content",
      params: {
        content_type: "location_info",
        content_id: x + "_" + y,
      },
    });
  }, [x, y]);

  useEffect(() => {
    setSegmentList(segment);
  }, [segment]);

  useEffect(() => {
    getBidProfiles();
  }, [loadBidsProfiles]);

  const getBidProfiles = async () => {
    const profileService = new ProfileService();
    const bidders = bids.map(b => { return b.bidder });
    const bidderProfiles = await profileService.getProfileInfos(bidders) as Array<ProfileInfo>;
    for (const bid of bids) {
      bid.bidderProfile = bidderProfiles.find(b => b.avatars[0].ethAddress.toLowerCase() === bid.bidder.toLowerCase());
    }
    setBids([...bids]);
  }

  useEffect(() => {
    getSaleProfiles();
  }, [loadSalesProfiles]);

  const getSaleProfiles = async () => {
    const profileService = new ProfileService();
    const sellers = sales.map(s => { return s.seller });
    const buyers = sales.map(s => { return s.buyer });
    const buyerSellerProfiles = await profileService.getProfileInfos([...buyers, ...sellers]) as Array<ProfileInfo>;
    for (const sale of sales) {
      sale.sellerProfile = buyerSellerProfiles.find(s => s.avatars[0].ethAddress.toLowerCase() === sale.seller.toLowerCase());
      sale.buyerProfile = buyerSellerProfiles.find(b => b.avatars[0].ethAddress.toLowerCase() === sale.buyer.toLowerCase());
    };
    setSales([...sales]);
  }

  const getData = async () => {
    setLoading(true);
    try {
      const mapService = new MapService();
      const nftService = new NftService();
      const tileInfo = await mapService.getTileInfo(x, y);
      setTileInfo(tileInfo);
      getProfileInfo(tileInfo.owner);
      if (tileInfo.estateId !== undefined) {
        setIsEstate(true);
        getEstateInfo(tileInfo.estateId);
        getEstateBids(tileInfo.estateId);
        getEstateSales(tileInfo.estateId);
        const estateNFT = await nftService.getEstateNftInfo(tileInfo.estateId);
        setNftInfo(estateNFT);
        if (onNFTInfoLoaded) {
          onNFTInfoLoaded(estateNFT);
        }
      }
      else {
        getParcelInfo(x, y);
        getParcelBids(tileInfo.tokenId);
        getParcelSales(tileInfo.tokenId);
        const parcelNft = await nftService.getParcelNftInfo(tileInfo.tokenId);
        setNftInfo(parcelNft);
        if (onNFTInfoLoaded) {
          onNFTInfoLoaded(parcelNft);
        }
      }
    }
    finally {
      setLoading(false);
    }
  };

  const getProfileInfo = async (profileId: string) => {
    const profileService = new ProfileService();
    const profileInfo = await profileService.getProfileInfo(profileId);
    setOwnerInfo(profileInfo);
  }

  const getEstateInfo = async (estateId: string) => {
    const mapService = new MapService();
    const estateInfo = await mapService.getEstateInfo(estateId);
    setAttributes(estateInfo.attributes);
    if (onDataLoaded) {
      onDataLoaded(estateInfo);
    }
  }

  const getParcelInfo = async (x: number, y: number) => {
    const mapService = new MapService();
    const parcelInfo = await mapService.getParcelInfo(x, y);
    setAttributes(parcelInfo.attributes);
    if (onDataLoaded) {
      onDataLoaded(parcelInfo);
    }
  }

  const getEstateBids = async (estateId: string) => {
    const nftService = new NftService();
    const estateBids = await nftService.getEstateBids(estateId);
    setBids(estateBids);
    setLoadBidsProfiles(true);
  }

  const getParcelBids = async (tokenId: string) => {
    const nftService = new NftService();
    const parcelBids = await nftService.getParcelBids(tokenId);
    setBids(parcelBids);
    setLoadBidsProfiles(true);
  }

  const getEstateSales = async (estateId: string) => {
    const nftService = new NftService();
    const estateSales = await nftService.getEstateSales(estateId, 12, 0);
    setSales(estateSales);
    setLoadSalesProfiles(true);
  }

  const getParcelSales = async (tokenId: string) => {
    const nftService = new NftService();
    const parcelSales = await nftService.getParcelSales(tokenId, 12, 0);
    setSales(parcelSales);
    setLoadSalesProfiles(true);
  }

  const getDistanceText = (value: any): string => {
    const distance = parseInt(value);
    if (distance === 0) {
      return "Adjacent";
    }
    else {
      return distance + " parcels away";
    }
  }

  return (
    <div className="location-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading &&
          <>
            <RetriedImg className="main-img" alt={nftInfo?.nft.name} src={nftInfo?.nft.image + "?width=512&height=256"} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land_512x256.png"} retries={5}></RetriedImg>
            <IonCardHeader>
              <IonCardTitle>{nftInfo?.nft.name}</IonCardTitle>
              {isEstate &&
                <IonCardSubtitle>
                  <IonChip color="primary" outline={true}>
                    <IonIcon icon={grid} />
                    <IonLabel>Estate</IonLabel>
                  </IonChip>
                  <IonChip color="secondary" outline={true}>
                    <IonIcon icon={location} />
                    <IonLabel>{nftInfo?.nft.data.estate?.size} Parcels</IonLabel>
                  </IonChip>
                </IonCardSubtitle>
              }
              {!isEstate &&
                <IonCardSubtitle>
                  <IonChip color="primary" outline={true}>
                    <IonIcon icon={location} />
                    <IonLabel>{x},{y}</IonLabel>
                  </IonChip>
                </IonCardSubtitle>
              }
              {nftInfo?.order !== null && tileInfo?.price !== undefined &&
                <IonCardSubtitle>
                  <IonChip color="dark" outline={true}>
                    <IonIcon icon={pricetag}>
                    </IonIcon>
                    <IonLabel>
                      For Sale
                    </IonLabel>
                  </IonChip>
                  <IonChip color="dark" outline={true}>
                    <IonLabel>
                      <i className={"mana " + (nftInfo?.order.network === "ETHEREUM" ? "ethereum" : "polygon")}></i>
                    </IonLabel>
                    <IonLabel>
                      {utils.formatPrice(tileInfo.price)}
                    </IonLabel>
                  </IonChip>
                </IonCardSubtitle>
              }
            </IonCardHeader>
            <IonCardContent>
              {isEstate &&
                <p>
                  {nftInfo?.nft.data.estate?.description}
                </p>
              }
              {!isEstate &&
                <>
                  <p>
                    {nftInfo?.nft.data.parcel?.description}
                  </p>
                </>
              }
              {attributes.map((attr, index) =>
                <React.Fragment key={index}>
                  {attr.trait_type === "Distance to Plaza" &&
                    <IonItem lines="none">
                      <IonButton slot="start" disabled={true} size="default" className="plaza">
                        <IonIcon icon={flag}></IonIcon>
                      </IonButton>
                      <IonLabel>
                        <strong>Plaza</strong><br />
                        {getDistanceText(attr.value)}
                      </IonLabel>
                    </IonItem>
                  }
                  {attr.trait_type === "Distance to Road" &&
                    <IonItem lines="none">
                      <IonButton slot="start" disabled={true} size="default" className="road">
                        <IonIcon icon={trailSign}></IonIcon>
                      </IonButton>
                      <IonLabel>
                        <strong>Road</strong><br />
                        {getDistanceText(attr.value)}
                      </IonLabel>
                    </IonItem>
                  }
                  {attr.trait_type === "Distance to District" &&
                    <IonItem lines="none">
                      <IonButton slot="start" disabled={true} size="default" className="district">
                        <IonIcon icon={business}></IonIcon>
                      </IonButton>
                      <IonLabel>
                        <strong>District</strong><br />
                        {getDistanceText(attr.value)}
                      </IonLabel>
                    </IonItem>
                  }
                </React.Fragment>
              )}
              <div className="owner-info">
                <strong><IonText color="dark">Owner</IonText></strong>
                <IonItem className="owner" lines="none" onClick={() => history.push(`/account/${tileInfo?.owner}`)}>
                  <ProfileAvatar profileInfo={ownerInfo} ethAddress={tileInfo?.owner as string}></ProfileAvatar>
                  <IonLabel>
                    <ProfileName profileInfo={ownerInfo} ethAddress={tileInfo?.owner as string}></ProfileName>
                  </IonLabel>
                </IonItem>
              </div>
              <IonSegment value={segment} onIonChange={(e) => { setSegment(e.detail.value as string); e.stopImmediatePropagation(); e.stopPropagation(); }}>
                <IonSegmentButton value="sales"><IonLabel>Sales</IonLabel></IonSegmentButton>
                <IonSegmentButton value="bids"><IonLabel>Bids</IonLabel></IonSegmentButton>
              </IonSegment>
              {segmentList === "sales" &&
                <IonList className="sales">
                  {sales.length === 0 &&
                    <IonItem>
                      <IonLabel><IonNote>No records found</IonNote></IonLabel>
                    </IonItem>
                  }
                  {sales.map((sale, index) =>
                    <IonItem key={index}>
                      <IonLabel>
                        <IonItem lines="none" onClick={() => history.push(`/account/${sale.seller}`)}>
                          <ProfileAvatar profileInfo={sale.sellerProfile} ethAddress={sale.seller as string}></ProfileAvatar>
                          <IonLabel className="buyer-seller">
                            <IonNote>from</IonNote>
                            <br />
                            <IonText>
                              <ProfileName profileInfo={sale.sellerProfile} ethAddress={sale.seller as string}></ProfileName>
                            </IonText>
                          </IonLabel>
                        </IonItem>
                        <IonItem lines="none" onClick={() => history.push(`/account/${sale.buyer}`)}>
                          <ProfileAvatar profileInfo={sale.buyerProfile} ethAddress={sale.buyer as string}></ProfileAvatar>
                          <IonLabel className="buyer-seller">
                            <IonNote>to</IonNote>
                            <br />
                            <IonText>
                              <ProfileName profileInfo={sale.buyerProfile} ethAddress={sale.buyer as string}></ProfileName>
                            </IonText>
                          </IonLabel>
                        </IonItem>
                      </IonLabel>
                      <IonLabel slot="end" className="price-date">
                        <IonText><i className={"mana " + (sale.network === "ETHEREUM" ? "ethereum" : "polygon")}></i></IonText>
                        <IonText>{utils.formatPrice(sale.price / (1e18))}</IonText><br />
                        <IonText>{format(new Date(sale.timestamp), "PPP")}</IonText>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              }
              {segmentList === "bids" &&
                <IonList className="bids">
                  {bids.length === 0 &&
                    <IonItem>
                      <IonLabel><IonNote>No records found</IonNote></IonLabel>
                    </IonItem>
                  }
                  {bids.map((bid, index) =>
                    <IonItem key={index}>
                      <IonItem lines="none" onClick={() => history.push(`/account/${bid.bidder}`)}>
                        <ProfileAvatar profileInfo={bid.bidderProfile} ethAddress={bid.bidder as string}></ProfileAvatar>
                        <IonLabel className="bidder">
                          <ProfileName profileInfo={bid.bidderProfile} ethAddress={bid.bidder as string}></ProfileName>
                        </IonLabel>
                      </IonItem>
                      <IonLabel slot="end" className="price-date">
                        <IonText><i className={"mana " + (bid.network === "ETHEREUM" ? "ethereum" : "polygon")}></i></IonText>
                        <IonText>{utils.formatPrice(bid.price / (1e18))}</IonText><br />
                        <IonText>{formatDistanceToNow(new Date(bid.expiresAt))} left</IonText>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              }
            </IonCardContent>
          </>
        }
      </IonCard>
    </div>
  );
};

export default LocationInfo;
