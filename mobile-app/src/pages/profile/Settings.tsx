import { FCM } from "@capacitor-community/fcm";
import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { Preferences } from "@capacitor/preferences";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToggle, IonToolbar, useIonToast } from "@ionic/react"
import { helpCircleOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { NotificationSettings } from "../../models/NotificationSettings";
import "./Settings.css";

const Settings: React.FC = () => {

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        favorites: false,
        landSales: false,
        nameSales: false,
        landListings: false,
        nameListings: false,
        itemListings: false,
        proposals: false,
    });

    const [loading, setLoading] = useState(true);

    const [presentToast] = useIonToast();

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Settings",
                screen_class: "Settings",
            },
        });
    }, []);

    useEffect(() => {
        getSettings();
    }, []);

    const getSettings = async () => {
        const notificationPreferenceResult = await Preferences.get({
            key: "notification-settings"
        });

        if (notificationPreferenceResult.value) {
            try {
                const value = JSON.parse(notificationPreferenceResult.value);
                setNotificationSettings(value);
            }
            catch { }
        }

        setLoading(false);
    }

    const displayHint = (topic: string) => {
        let message = "";
        if (topic === "land-sales") {
            message = "Toggle on to get notified when a parcel/estate is sold";
        }
        else if (topic === "name-sales") {
            message = "Toggle on to get notified when a name is sold";
        }
        else if (topic === "land-listings") {
            message = "Toggle on to get notified when a parcel/estate is listed for sale";
        }
        else if (topic === "name-listings") {
            message = "Toggle on to get notified when a name is listed for sale";
        }
        else if (topic === "item-listings") {
            message = "Toggle on to get notified when a new wearable or emote is available for minting";
        }
        else if (topic === "favorite-assets") {
            message = "Toggle on to get notified about all updates (bids, sales, price changes) regarding your favorite assets.";
        }
        else if (topic === "proposals") {
            message = "Toggle on to get notified when a new proposal is submitted to DAO";
        }

        presentToast({
            message: message,
            duration: 5000,
            position: "middle"
        });
    }

    const handleToggleChange = async (topic: string, checked: boolean) => {

        if (checked) {
            await FCM.subscribeTo({ topic: topic });
        }
        else {
            await FCM.unsubscribeFrom({ topic: topic });
        }

        if (topic === "land-sales") {
            notificationSettings.landSales = checked;
        }
        else if (topic === "name-sales") {
            notificationSettings.nameSales = checked;
        }
        else if (topic === "land-listings") {
            notificationSettings.landListings = checked;
        }
        else if (topic === "name-listings") {
            notificationSettings.nameListings = checked;
        }
        else if (topic === "item-listings") {
            notificationSettings.itemListings = checked;
        }
        else if (topic === "favorite-assets") {
            notificationSettings.favorites = checked;
        }
        else if (topic === "proposals") {
            notificationSettings.proposals = checked;
        }

        setNotificationSettings(notificationSettings);

        await Preferences.set({
            key: "notification-settings",
            value: JSON.stringify(notificationSettings),
        });
    }

    return (
        <IonPage className="settings">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" />
                    </IonButtons>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Settings</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {!loading &&
                    <IonList>
                        <IonListHeader>
                            Notifications
                        </IonListHeader>
                        <IonItem>
                            <IonLabel>favorites</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("favorite-assets");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.favorites} onIonChange={(e) => handleToggleChange("favorite-assets", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>recent land listings</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("land-listings");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.landListings} onIonChange={(e) => handleToggleChange("land-listings", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>recent name listings</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("name-listings");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.nameListings} onIonChange={(e) => handleToggleChange("name-listings", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>recent wearable listings</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("item-listings");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.itemListings} onIonChange={(e) => handleToggleChange("item-listings", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>land sales</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("land-sales");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.landSales} onIonChange={(e) => handleToggleChange("land-sales", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>name sales</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("name-sales");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.nameSales} onIonChange={(e) => handleToggleChange("name-sales", e.detail.checked)}></IonToggle>
                        </IonItem>
                        <IonItem>
                            <IonLabel>proposals</IonLabel>
                            <IonIcon icon={helpCircleOutline} onClick={() => {
                                displayHint("proposals");
                            }}></IonIcon>
                            <IonToggle slot="end" checked={notificationSettings.proposals} onIonChange={(e) => handleToggleChange("proposals", e.detail.checked)}></IonToggle>
                        </IonItem>
                    </IonList>
                }
            </IonContent>
        </IonPage >
    )
}
export default Settings;
