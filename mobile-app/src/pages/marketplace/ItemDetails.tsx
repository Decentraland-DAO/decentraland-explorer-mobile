import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from "@ionic/react"
import { openOutline, shareSocialOutline, star, starOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import ItemInfo from "../../components/marketplace/ItemInfo";
import { Browser } from '@capacitor/browser';
import { FavoritesService } from "../../services/FavoritesService";
import { Item } from "../../api/marketplace/Item";
import { Share } from "@capacitor/share";

interface PageProps
    extends RouteComponentProps<{
        contractAddress: string,
        itemId: string,
    }> { }
const ItemDetails: React.FC<PageProps> = ({ match }) => {

    const [item, setItem] = useState<Item | null>(null);

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Item Details",
                screen_class: "ItemDetails",
            },
        });
    }, []);

    const openExternalUrl = () => {
        Browser.open({ url: `https://market.decentraland.org/contracts/${match.params.contractAddress}/items/${match.params.itemId}` });
    }

    const addToFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.addItem(item as Item);
        setIsFavorite(true);
    }

    const removeFromFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.removeItem(item as Item);
        setIsFavorite(false);
    }

    const onItemLoaded = (data: Item) => {
        setItem(data);
        checkFavorite(data);
    }

    const checkFavorite = async (data: Item) => {
        const favoritesService = new FavoritesService();
        const favoriteItem = await favoritesService.getItem(data.id);
        if (favoriteItem) {
            setIsFavorite(true);
            // Update data in cache
            favoritesService.updateItem(data);
        }
    }

    const shareItem = async () => {
        await Share.share({
            text: item?.name,
            url: `https://dcland.app/item/${match.params.contractAddress}/${match.params.itemId}`,
            dialogTitle: 'Share with buddies',
        });
    }

    return (
        <IonPage className="name-details">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonButtons slot="end">
                        {item !== null &&
                            <>
                                <IonButton onClick={shareItem}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
                                {!isFavorite &&
                                    <IonButton onClick={addToFavorites}><IonIcon icon={starOutline}></IonIcon></IonButton>
                                }
                                {isFavorite &&
                                    <IonButton onClick={removeFromFavorites}><IonIcon icon={star}></IonIcon></IonButton>
                                }
                            </>
                        }
                        <IonButton onClick={openExternalUrl}><IonIcon icon={openOutline}></IonIcon></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <ItemInfo onDataLoaded={onItemLoaded} contractAddress={match.params.contractAddress} itemId={match.params.itemId}></ItemInfo>
            </IonContent>
        </IonPage>
    )
}
export default ItemDetails;
