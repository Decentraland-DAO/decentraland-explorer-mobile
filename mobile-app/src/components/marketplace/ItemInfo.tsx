import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonItem, IonLabel, IonList, IonNote, IonSpinner, IonText } from '@ionic/react';
import { female, male, maleFemale, pricetag } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { format } from "date-fns"
import { Sale } from '../../api/nft/Sale';
import { ProfileInfo } from '../../api/profile/ProfileInfo';
import { ProfileService } from '../../services/ProfileService';
import { Utils } from '../../services/Utils';
import './LocationInfo.css';
import './ItemInfo.css';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileName from '../profile/ProfileName';
import { Item } from '../../api/marketplace/Item';
import { MarketplaceService } from '../../services/MarketplaceService';
import { useHistory } from 'react-router';

interface ContainerProps {
  contractAddress: string,
  itemId: string,
  onDataLoaded?: (data: Item) => void
}

const ItemInfo: React.FC<ContainerProps> = ({ contractAddress, itemId, onDataLoaded }) => {

  const [loading, setLoading] = useState(true);

  const [frameLoaded, setFrameLoaded] = useState(false);

  const [item, setItem] = useState<Item | null>(null);

  const [ownerInfo, setOwnerInfo] = useState<ProfileInfo | null>(null);

  const [sales, setSales] = useState<Array<Sale>>([]);

  const [loadSalesProfiles, setLoadSalesProfiles] = useState(false);

  const history = useHistory();

  const utils = new Utils();

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getSaleProfiles();
  }, [loadSalesProfiles]);

  const getSaleProfiles = async () => {
    const profileService = new ProfileService();
    const buyers = sales.map(s => { return s.buyer });
    const buyerSellerProfiles = await profileService.getProfileInfos([...buyers, item?.beneficiary as string]) as Array<ProfileInfo>;
    for (const sale of sales) {
      sale.sellerProfile = buyerSellerProfiles.find(b => b.avatars[0].ethAddress.toLowerCase() === sale.seller.toLowerCase());
      sale.buyerProfile = buyerSellerProfiles.find(b => b.avatars[0].ethAddress.toLowerCase() === sale.buyer.toLowerCase());
    };
    setSales([...sales]);
  }

  const getData = async () => {
    setLoading(true);
    try {
      const marketplaceService = new MarketplaceService();
      const data = await marketplaceService.getItem(contractAddress, itemId);
      setItem(data);
      getProfileInfo(data.beneficiary);
      getSales();
      if (onDataLoaded) {
        onDataLoaded(data);
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

  const getSales = async () => {
    const marketplaceService = new MarketplaceService();
    const data = await marketplaceService.getItemSales(contractAddress, itemId, 12, 0);
    setSales(data);
    setLoadSalesProfiles(true);
  }

  const renderGenderChip = (item: Item) => {
    const wearable = item.data.wearable;
    const emote = item.data.emote;
    let bodyShapes = null;
    if (wearable) {
      bodyShapes = wearable.bodyShapes;
    }
    else if (emote) {
      bodyShapes = emote.bodyShapes;
    }

    if (bodyShapes) {
      if (bodyShapes.length === 2) {
        return (<IonChip color="dark" outline={true}>
          <IonIcon icon={maleFemale}></IonIcon>
          <IonLabel>Unisex</IonLabel>
        </IonChip>)
      }
      else {
        if (bodyShapes[0] === "BaseMale") {
          return (<IonChip color="dark" outline={true}>
            <IonIcon icon={male}></IonIcon>
            <IonLabel>Male</IonLabel>
          </IonChip>)
        }
        else if (bodyShapes[0] === "BaseFemale") {
          return (<IonChip color="dark" outline={true}>
            <IonIcon icon={female}></IonIcon>
            <IonLabel>Female</IonLabel>
          </IonChip>)
        }
      }
    }
  }

  const onFrameLoaded = () => {
    setTimeout(() => {
      setFrameLoaded(true);
    }, 3000);
  }

  return (
    <div className="location-info item-info">
      <IonCard>
        {loading &&
          <IonCardContent className="loading">
            <IonSpinner />
          </IonCardContent>
        }
        {!loading &&
          <>
            <div className={"img-container " + item?.rarity}>
              {!frameLoaded &&
                <div className="frame-loading">
                  <IonSpinner />
                </div>
              }
              <iframe title="preview" style={{ visibility: frameLoaded ? "visible" : "hidden" }} onLoad={onFrameLoaded} src={`https://wearable-preview.decentraland.org/?contract=${contractAddress}&item=${itemId}`}></iframe>
            </div>
            <IonCardHeader>
              <IonCardTitle>{item?.name}</IonCardTitle>
              <IonCardSubtitle>
                <IonChip className={item?.rarity} outline={true}>
                  <IonLabel>{item?.rarity}</IonLabel>
                </IonChip>
                {item?.data.wearable &&
                  <IonChip color="dark" outline={true}>
                    <IonLabel>{item?.data.wearable?.category}</IonLabel>
                  </IonChip>
                }
                {item?.data.emote &&
                  <IonChip color="dark" outline={true}>
                    <IonLabel>{item?.data.emote?.category}</IonLabel>
                  </IonChip>
                }
                {renderGenderChip(item as Item)}
              </IonCardSubtitle>
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
                    <i className={"mana " + (item?.network === "ETHEREUM" ? "ethereum" : "polygon")}></i>
                  </IonLabel>
                  <IonLabel>
                    {utils.formatPrice(item?.price as number / (1e18))}
                  </IonLabel>
                </IonChip>
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                {item?.data.wearable?.description}
              </p>
              <div className="owner-info">
                <strong><IonText color="dark">Creator</IonText></strong>
                <IonItem className="owner" lines="none" onClick={() => history.push(`/account/${item?.beneficiary}`)}>
                  <ProfileAvatar profileInfo={ownerInfo} ethAddress={item?.beneficiary as string}></ProfileAvatar>
                  <IonLabel>
                    <ProfileName profileInfo={ownerInfo} ethAddress={item?.beneficiary as string}></ProfileName>
                  </IonLabel>
                </IonItem>
              </div>
              <div className="owner-info">
                <strong><IonText color="dark">Latest Sales</IonText></strong>
              </div>
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
            </IonCardContent>
          </>
        }
      </IonCard>
    </div>
  );
};

export default ItemInfo;
