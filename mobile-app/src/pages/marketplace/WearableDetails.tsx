import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from "@ionic/react"
import { openOutline, shareSocialOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Browser } from '@capacitor/browser';
import { Share } from "@capacitor/share";
import { FavoritesService } from "../../services/FavoritesService";
import { NFTInfo } from "../../api/nft/NFTInfo";
import WearableInfo from "../../components/marketplace/WearableInfo";

interface PageProps
    extends RouteComponentProps<{
        contractAddress: string,
        tokenId: string,
    }> { }
const WearableDetails: React.FC<PageProps> = ({ match }) => {

    const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Wearable Details",
                screen_class: "WearableDetails",
            },
        });
    }, []);

    const openExternalUrl = () => {
        Browser.open({ url: `https://market.decentraland.org/contracts/${match.params.contractAddress}/tokens/${match.params.tokenId}` });
    }

    const onNFTInfoLoaded = (data: NFTInfo) => {
        setNftInfo(data);
        //checkFavorite(data);
    }

    const checkFavorite = async (data: NFTInfo) => {
        const favoritesService = new FavoritesService();
        const favoriteItem = await favoritesService.getName(data.nft.id as string);
        if (favoriteItem) {
            setIsFavorite(true);
            // Update data in cache
            favoritesService.updateName(data);
        }
    }

    const addToFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.addName(nftInfo as NFTInfo);
        setIsFavorite(true);
    }

    const removeFromFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.removeName(nftInfo as NFTInfo);
        setIsFavorite(false);
    }

    const shareName = async () => {
        await Share.share({
            url: `https://dcland.app/wearable/${match.params.contractAddress}/${match.params.tokenId}`,
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
                        {nftInfo !== null &&
                            <>
                                <IonButton onClick={shareName}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
                                {/* {!isFavorite &&
                                    <IonButton onClick={addToFavorites}><IonIcon icon={starOutline}></IonIcon></IonButton>
                                }
                                {isFavorite &&
                                    <IonButton onClick={removeFromFavorites}><IonIcon icon={star}></IonIcon></IonButton>
                                } */}
                            </>
                        }
                        <IonButton onClick={openExternalUrl}><IonIcon icon={openOutline}></IonIcon></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <WearableInfo onNFTInfoLoaded={onNFTInfoLoaded} contractAddress={match.params.contractAddress} tokenId={match.params.tokenId}></WearableInfo>
            </IonContent>
        </IonPage>
    )
}
export default WearableDetails;
