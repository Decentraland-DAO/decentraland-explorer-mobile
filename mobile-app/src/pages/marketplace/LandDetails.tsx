import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar } from "@ionic/react"
import { openOutline, shareSocialOutline, star, starOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import LocationInfo from "../../components/marketplace/LocationInfo";
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { EstateInfo } from "../../api/map/EstateInfo";
import { ParcelInfo } from "../../api/map/ParcelInfo";
import { FavoritesService } from "../../services/FavoritesService";
import { NFTInfo } from "../../api/nft/NFTInfo";

interface PageProps
    extends RouteComponentProps<{
        x: string,
        y: string,
    }> { }
const LandDetails: React.FC<PageProps> = ({ match }) => {
    const [x, setX] = useState(parseInt(match.params.x));
    const [y, setY] = useState(parseInt(match.params.y));
    const [externalUrl, setExternalUrl] = useState("");
    const [nftInfo, setNftInfo] = useState<NFTInfo | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Land Details",
                screen_class: "LandDetails",
            },
        });
    }, []);

    const openExternalUrl = () => {
        if (externalUrl !== "") {
            Browser.open({ url: externalUrl });
        }
    }

    const onLocationDataLoad = (data: EstateInfo | ParcelInfo) => {
        setExternalUrl(data.external_url);
    }

    const onNFTInfoLoaded = (data: NFTInfo) => {
        setNftInfo(data);
        checkFavorite(data);
    }

    const checkFavorite = async (data: NFTInfo) => {
        const favoritesService = new FavoritesService();
        const favoriteItem = await favoritesService.getLand(data.nft.id as string);
        if (favoriteItem) {
            setIsFavorite(true);
            // Update data in cache
            favoritesService.updateLand(data);
        }
    }

    const addToFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.addLand(nftInfo as NFTInfo);
        setIsFavorite(true);
    }

    const removeFromFavorites = async () => {
        const favoritesService = new FavoritesService();
        await favoritesService.removeLand(nftInfo as NFTInfo);
        setIsFavorite(false);
    }

    const shareLand = async () => {
        await Share.share({
            text: nftInfo?.nft.name,
            url: `https://dcland.app/land/${match.params.x}/${match.params.y}`,
            dialogTitle: 'Share with buddies',
        });
    }

    return (
        <IonPage className="land-details">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonButtons slot="end">
                        {nftInfo !== null &&
                            <>
                                <IonButton onClick={shareLand}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
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
                {x !== 0 && y !== 0 &&
                    <LocationInfo onNFTInfoLoaded={onNFTInfoLoaded} onDataLoaded={onLocationDataLoad} x={x} y={y}></LocationInfo>
                }
            </IonContent>
        </IonPage>
    )
}
export default LandDetails;
