import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonChip, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSegment, IonSegmentButton, IonSpinner, IonText } from '@ionic/react';
import { pricetag } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from "date-fns"
import { Bid } from '../../api/nft/Bid';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { Sale } from '../../api/nft/Sale';
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { NftService } from '../../services/NftService';
import { ProfileService } from '../../services/ProfileService';
import { Utils } from '../../services/Utils';
import './LocationInfo.css';
import './NameInfo.css';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileName from '../profile/ProfileName';
import { useHistory } from 'react-router';

interface ContainerProps {
  contractAddress: string,
  tokenId: string,
  onNFTInfoLoaded?: (data: NFTInfo) => void,
}

const NameInfo: React.FC<ContainerProps> = ({ contractAddress, tokenId, onNFTInfoLoaded }) => {

  const [loading, setLoading] = useState(true);

  const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);

  const [ownerInfo, setOwnerInfo] = useState<ProfileInfo | null>(null);

  const [sales, setSales] = useState<Array<Sale>>([]);

  const [bids, setBids] = useState<Array<Bid>>([]);

  const [loadSalesProfiles, setLoadSalesProfiles] = useState(false);

  const [loadBidsProfiles, setLoadBidsProfiles] = useState(false);

  const [segment, setSegment] = useState("sales");

  const [segmentList, setSegmentList] = useState("sales");

  const utils = new Utils();

  const history = useHistory();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getBidProfiles();
  }, [loadBidsProfiles]);

  useEffect(() => {
    setSegmentList(segment);
  }, [segment]);

  const getBidProfiles = async () => {
    const profileService = new ProfileService();
    for (const bid of bids) {
      const profileInfo = await profileService.getProfileInfo(bid.bidder);
      bid.bidderProfile = profileInfo;
    }
    setBids([...bids]);
  }

  useEffect(() => {
    getSaleProfiles();
  }, [loadSalesProfiles]);

  const getSaleProfiles = async () => {
    const profileService = new ProfileService();
    for (const sale of sales) {
      const sellerProfileInfo = await profileService.getProfileInfo(sale.seller);
      sale.sellerProfile = sellerProfileInfo;

      const buyerProfileInfo = await profileService.getProfileInfo(sale.buyer);
      sale.buyerProfile = buyerProfileInfo;
    };
    setSales([...sales]);
  }

  const getData = async () => {
    setLoading(true);
    try {
      const nftService = new NftService();
      const data = await nftService.getNftInfo(contractAddress, tokenId);
      setNftInfo(data);
      getProfileInfo(data.nft.owner);
      getSales();
      getBids();
      if(onNFTInfoLoaded){
        onNFTInfoLoaded(data);
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

  const getBids = async () => {
    const nftService = new NftService();
    const data = await nftService.getBids(contractAddress, tokenId);
    setBids(data);
    setLoadBidsProfiles(true);
  }

  const getSales = async () => {
    const nftService = new NftService();
    const data = await nftService.getSales(contractAddress, tokenId, 12, 0);
    setSales(data);
    setLoadSalesProfiles(true);
  }

  return (
    <div className="location-info name-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading &&
          <>
            <div className="img-container">
              <h1>{nftInfo?.nft.name}</h1>
              <small>{nftInfo?.nft.data.ens?.subdomain}</small>
            </div>
            <IonCardHeader>
              <IonCardSubtitle>
                <IonChip color="primary" outline={true}>
                  <IonLabel>Name</IonLabel>
                </IonChip>
              </IonCardSubtitle>
              {nftInfo?.order !== null && nftInfo?.order?.price !== undefined &&
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
                      {utils.formatPrice(nftInfo?.order.price / (1e18))}
                    </IonLabel>
                  </IonChip>
                </IonCardSubtitle>
              }
            </IonCardHeader>
            <IonCardContent>
              <div className="owner-info">
                <strong><IonText color="dark">Owner</IonText></strong>
                <IonItem className="owner" lines="none" onClick={() => history.push(`/account/${nftInfo?.nft.owner}`)}>
                  <ProfileAvatar profileInfo={ownerInfo} ethAddress={nftInfo?.nft?.owner as string}></ProfileAvatar>
                  <IonLabel>
                    <ProfileName profileInfo={ownerInfo} ethAddress={nftInfo?.nft?.owner as string}></ProfileName>
                  </IonLabel>
                </IonItem>
              </div>
              <IonSegment value={segment} onIonChange={(e: any) => { setSegment(e.target.value) }}>
                <IonSegmentButton value="sales">Sales</IonSegmentButton>
                <IonSegmentButton value="bids">Bids</IonSegmentButton>
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

export default NameInfo;
