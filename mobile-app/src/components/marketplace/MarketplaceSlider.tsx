import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonSpinner, IonText } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router';
import { FreeMode } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Item } from "../../api/marketplace/Item";
import { NFTInfo } from '../../api/nft/NFTInfo';
import ItemCard from './ItemCard';
import LandCard from './LandCard';
import "./MarketplaceSlider.css";
import NameCard from './NameCard';

interface ContainerProps {
    title: string,
    target: string,
    itemType: string,
    items: Array<Item> | Array<NFTInfo>,
}
const MarketplaceSlider: React.FC<ContainerProps> = ({ title, target, itemType, items }) => {
    const history = useHistory();
    return (
        <div className="marketplace-slider">
            <IonGrid>
                <IonRow>
                    <IonCol><h5 className="slider-title">{title}</h5></IonCol>
                    <IonCol className="view-all">
                        <IonButton fill="clear" onClick={() => history.push(target)}>
                            <IonText>View All<IonIcon icon={arrowForward}></IonIcon></IonText>
                        </IonButton>
                    </IonCol>
                </IonRow>
            </IonGrid>
            {items.length === 0 &&
                <div className="loading">
                    <IonSpinner />
                </div>
            }
            <Swiper
                freeMode={true}
                slidesPerView="auto"
                modules={[FreeMode]}>
                {items.map((item, index) =>
                    <SwiperSlide key={index}>
                        {itemType === "Item" &&
                            <ItemCard item={item as Item}></ItemCard>
                        }
                        {itemType === "Land" &&
                            <LandCard item={item as NFTInfo}></LandCard>
                        }
                        {itemType === "Name" &&
                            <NameCard item={item as NFTInfo}></NameCard>
                        }
                    </SwiperSlide>
                )}
            </Swiper>
        </div>
    )
}
export default MarketplaceSlider;
