import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonChip, IonLabel, IonText } from '@ionic/react';
import { useHistory } from 'react-router';
import { Item } from '../../api/marketplace/Item';
import { Utils } from '../../services/Utils';
import './ItemCard.css';

interface ContainerProps {
  item: Item
}

const ItemCard: React.FC<ContainerProps> = ({ item }) => {
  const utils = new Utils();
  const history = useHistory();

  const handleImgOnError = (e: any, item: Item) => {
    e.target.style.display = "none";
  }

  return (
    <IonCard className="item-card" onClick={() => history.push(`/item/${item.contractAddress}/${item.itemId}`)}>
      <div className={item.rarity + " img-container"}>
        <img className={item.rarity} alt={item.name} src={item.thumbnail} onError={(e => handleImgOnError(e, item))}></img>
      </div>
      <IonCardHeader>
        <IonCardTitle>
          {item.name}
        </IonCardTitle>
        <IonCardSubtitle>
          <IonChip className={item.rarity} outline={true}>
            <IonLabel>{item.rarity}</IonLabel>
          </IonChip>
        </IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent className="price">
        {item.isOnSale &&
          <>
            <IonText><i className={"mana " + (item.network === "ETHEREUM" ? "ethereum" : "polygon")}></i></IonText>
            <IonText color="dark">{utils.formatPrice(item.price / (1e18))}</IonText>
          </>
        }
      </IonCardContent>
    </IonCard>
  );
};

export default ItemCard;
