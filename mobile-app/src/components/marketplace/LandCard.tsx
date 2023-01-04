import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonIcon, IonLabel, IonText } from '@ionic/react';
import { location } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { Utils } from '../../services/Utils';
import './LandCard.css';
import RetriedImg from '../RetriedImg';

interface ContainerProps {
  item: NFTInfo
}

const LandCard: React.FC<ContainerProps> = ({ item }) => {
  const utils = new Utils();
  const history = useHistory();

  return (
    <IonCard className="land-card" onClick={() => history.push(`/land/${item.nft.data.parcel ? item.nft.data.parcel.x : item.nft.data.estate?.parcels[0].x}/${item.nft.data.parcel ? item.nft.data.parcel.y : item.nft.data.estate?.parcels[0].y}`)}>
      <div className="img-container">
        <RetriedImg alt={item.nft.name} src={item.nft.image + "?width=256&height=256"} defaultSrc={process.env.PUBLIC_URL + "/assets/img/land.png"} retries={3}></RetriedImg>
      </div>
      <IonCardHeader>
        <IonCardTitle>
          {item.nft.name}
        </IonCardTitle>
        <IonCardSubtitle>
          {item.nft.data.estate &&
            <>
              {/* <IonChip color="primary" outline={true}>
                <IonIcon icon={grid} />
                <IonLabel>Estate</IonLabel>
              </IonChip> */}
              <IonChip color="secondary" outline={true}>
                <IonIcon icon={location} />
                <IonLabel>{item.nft.data.estate?.size} Parcels</IonLabel>
              </IonChip>
            </>
          }
          {item.nft.data.parcel &&
            <IonChip color="primary" outline={true}>
              <IonIcon icon={location} />
              <IonLabel>{item.nft.data.parcel.x},{item.nft.data.parcel.y}</IonLabel>
            </IonChip>
          }
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="price">
        {item.order &&
          <>
            <IonText><i className={"mana " + (item.nft.network === "ETHEREUM" ? "ethereum" : "polygon")}></i></IonText>
            <IonText color="dark">{utils.formatPrice(item.order.price / (1e18))}</IonText>
          </>
        }
        {!item.order &&
          <>
            <IonText color="dark">&nbsp;</IonText>
          </>
        }
      </IonCardContent>
    </IonCard>
  );
};

export default LandCard;
