import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from "@capacitor-community/fcm";
import { Preferences } from '@capacitor/preferences';
import { NotificationSettings } from '../models/NotificationSettings';
import { FavoritesService } from './FavoritesService';
import { Device } from '@capacitor/device';

export class PushService {

    public static async initialize(history: any) {
        const deviceInfo = await Device.getInfo();
        if (deviceInfo.platform !== "web") {
            await PushNotifications.addListener('registration', token => {
                console.info('Push Registration token: ', token.value);
            });

            await PushNotifications.addListener('registrationError', err => {
                console.error('Push Registration error: ', err.error);
            });

            await PushNotifications.addListener('pushNotificationReceived', notification => {
                console.log('Push notification received: ', notification);
            });

            await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
                if (notification.notification.data && notification.notification.data.url) {
                    history.push(notification.notification.data.url);
                }
            });

            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                // wait and then request for permission
                setTimeout(async () => {
                    permStatus = await PushNotifications.requestPermissions();
                    if (permStatus.receive === 'granted') {
                        this.registerPushNotifications();
                    }
                }, 30000);
            }
            else {
                if (permStatus.receive === 'granted') {
                    this.registerPushNotifications();
                }
            }
        }
    }
    
    private static async registerPushNotifications() {
        await PushNotifications.register();

        // Get time zone
        const now = new Date();
        const timeZoneOffset = now.getTimezoneOffset();
        const timeZone = Math.round(timeZoneOffset / (-60));
        const timeZoneTopic = "time_zone_" + timeZone;

        FCM.subscribeTo({ topic: timeZoneTopic })
            .then((r) => console.log(`push subscribed to time zone topic`))
            .catch((err) => console.log(err));

        const notificationPreferenceResult = await Preferences.get({
            key: "notification-settings"
        });

        if (!notificationPreferenceResult.value) {
            // Init with default preferences
            const settings: NotificationSettings = {
                favorites: true,
                landListings: true,
                nameListings: true,
                landSales: true,
                nameSales: true,
                itemListings: false,
                proposals: false,
            }

            await Promise.all([
                FCM.subscribeTo({
                    topic: "favorite-assets"
                }),
                FCM.subscribeTo({
                    topic: "land-sales"
                }),
                FCM.subscribeTo({
                    topic: "name-sales"
                }),
                FCM.subscribeTo({
                    topic: "land-listings"
                }),
                FCM.subscribeTo({
                    topic: "name-listings"
                }),
            ]);

            await Preferences.set({
                key: "notification-settings",
                value: JSON.stringify(settings)
            });

            // subscribe to favorite asset topics
            const favoritesService = new FavoritesService();
            const favoriteLands = await favoritesService.getLands();
            const favoriteNames = await favoritesService.getNames();

            if (favoriteLands) {
                for (const land of favoriteLands) {
                    await FCM.subscribeTo({
                        topic: `${land.nft.contractAddress}-${land.nft.tokenId}`
                    });
                }
            }

            if (favoriteNames) {
                for (const name of favoriteNames) {
                    await FCM.subscribeTo({
                        topic: `${name.nft.contractAddress}-${name.nft.tokenId}`
                    });
                }
            }
        }
    }
}
