import { IonCard, IonCardContent, IonText } from '@ionic/react';
import { useHistory } from 'react-router';
import { NFTInfo } from '../../api/nft/NFTInfo';
import { Utils } from '../../services/Utils';
import './NameCard.css';

interface ContainerProps {
  item: NFTInfo
}

const NameCard: React.FC<ContainerProps> = ({ item }) => {
  const utils = new Utils();
  const history = useHistory();

  return (
    <IonCard className="name-card" onClick={() => history.push(`/name/${item.nft.contractAddress}/${item.nft.tokenId}`)}>
      <div className="img-container">
        <h1>{item.nft.name}</h1>
        <small>{item.nft.name}</small>
      </div>
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

export default NameCard;
