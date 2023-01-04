import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonLabel, IonText } from '@ionic/react';
import { useHistory } from 'react-router';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { Utils } from '../../services/Utils';
import './WearableCard.css';

interface ContainerProps {
  item: NFTInfo,
}

const WearableCard: React.FC<ContainerProps> = ({ item }) => {
  const utils = new Utils();
  const history = useHistory();

  const handleImgOnError = (e: any) => {
    e.target.style.display = "none";
  }

  return (
    <IonCard className="wearable-card" onClick={() => history.push(`/wearable/${item.nft.contractAddress}/${item.nft.tokenId}`)}>
      <div className={item.nft.data.wearable?.rarity + " img-container"}>
        <img className={item.nft.data.wearable?.rarity} alt={item.nft.name} src={item.nft.image} onError={(e => handleImgOnError(e))}></img>
      </div>
      <IonCardHeader>
        <IonCardTitle>
          {item.nft.name}
        </IonCardTitle>
        <IonCardSubtitle>
          <IonChip className={item.nft.data.wearable?.rarity} outline={true}>
            <IonLabel>{item.nft.data.wearable?.rarity}</IonLabel>
          </IonChip>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="price">
        {item.order &&
          <>
            <IonText><i className={"mana " + (item.nft.network === "ETHEREUM" ? "ethereum" : "polygon")}></i></IonText>
            <IonText color="dark">{utils.formatPrice(item.order.price / (1e18))}</IonText>
          </>
        }
      </IonCardContent>
    </IonCard>
  );
};

export default WearableCard;
