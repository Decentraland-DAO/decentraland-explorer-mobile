import { FirebaseAnalytics } from "@capacitor-community/firebase-analytics";
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar, useIonToast } from "@ionic/react"
import { notifications, notificationsOutline, openOutline, shareSocialOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Browser } from '@capacitor/browser';
import EventInfo from "../../components/events/EventInfo";
import { EventsService } from "../../services/EventsService";
import { LocalNotifications } from '@capacitor/local-notifications';
import { sub } from "date-fns";
import { DecentralandEvent } from '../../api/event/DecentralandEvent';
import { Share } from "@capacitor/share";
import { FavoritesService } from "../../services/FavoritesService";

interface PageProps
    extends RouteComponentProps<{
        eventId: string,
    }> { }
const EventDetails: React.FC<PageProps> = ({ match }) => {

    const [event, setEvent] = useState<DecentralandEvent | null>(null);

    const [alarmed, setAlarmed] = useState(false);
    const [presentToast] = useIonToast();

    useEffect(() => {
        getData();
        getReminders();
    }, [])

    useEffect(() => {
        FirebaseAnalytics.logEvent({
            name: "screen_view",
            params: {
                screen_name: "Event Details",
                screen_class: "EventDetails",
            },
        });
    }, []);

    const openExternalUrl = () => {
        Browser.open({ url: `https://events.decentraland.org/event/?id=${match.params.eventId}` });
    }

    const getData = async () => {
        try {
            const eventService = new EventsService();
            const event = await eventService.getEvent(match.params.eventId);
            setEvent(event);
        }
        finally {
        }
    };

    const getReminders = async () => {
        const pendingNotificationsResult = await LocalNotifications.getPending();
        const pendingNotifications = pendingNotificationsResult.notifications;
        const notificationKey = "event-" + match.params.eventId;
        const existingNotification = pendingNotifications.find(n => n.extra && n.extra.key === notificationKey);
        if (existingNotification) {
            setAlarmed(true);
        }
    }

    const hasPermissions = async () => {
        let hasPermissions = false;
        const permissionStatus = await LocalNotifications.checkPermissions();
        if (permissionStatus.display !== "granted") {
            const permissionRequestStatus = await LocalNotifications.requestPermissions();
            if (permissionRequestStatus.display === "granted") {
                hasPermissions = true;
            }
        }
        else {
            hasPermissions = true;
        }

        return hasPermissions;
    }

    const addReminder = async () => {
        if (!await hasPermissions()) {
            return;
        }

        const eventService = new EventsService();
        const event = await eventService.getEvent(match.params.eventId);
        const pendingNotificationsResult = await LocalNotifications.getPending();
        const pendingNotifications = pendingNotificationsResult.notifications;
        const notificationKey = "event-" + event?.id;
        const existingNotification = pendingNotifications.find(n => n.extra && n.extra.key === notificationKey);
        if (existingNotification === undefined) {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: new Date().getTime(),
                        title: "The event is about to start",
                        body: event?.name as string,
                        extra: { key: "event-" + match.params.eventId },
                        smallIcon: "notification",
                        schedule: {
                            at: sub(new Date(event?.next_start_at as string), { minutes: 5 }),
                            allowWhileIdle: true
                        }
                    }
                ]
            });
            setAlarmed(true);
            const favoritesService = new FavoritesService();
            favoritesService.addEvent(event as DecentralandEvent);
            presentToast("We will notify you 5 minutes before the event starts!", 3000);
        }
        else {
            setAlarmed(true);
        }
    }

    const removeReminder = async () => {
        const pendingNotificationsResult = await LocalNotifications.getPending();
        const pendingNotifications = pendingNotificationsResult.notifications;
        const notificationKey = "event-" + match.params.eventId;
        const existingNotification = pendingNotifications.find(n => n.extra && n.extra.key === notificationKey)
        if (existingNotification !== undefined) {
            await LocalNotifications.cancel({
                notifications: [
                    {
                        id: existingNotification.id
                    }
                ]
            })
            setAlarmed(false);
        }

        const favoritesService = new FavoritesService();
        favoritesService.removeEvent(event as DecentralandEvent);
    }

    const shareEvent = async () => {
        await Share.share({
            text: event?.name,
            url: `https://dcland.app/event/${match.params.eventId}`,
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
                        {event && !event.live &&
                            <>
                                <IonButton onClick={shareEvent}><IonIcon icon={shareSocialOutline}></IonIcon></IonButton>
                                {!alarmed &&
                                    <IonButton onClick={addReminder}><IonIcon icon={notificationsOutline}></IonIcon></IonButton>
                                }
                                {alarmed &&
                                    <IonButton onClick={removeReminder}><IonIcon icon={notifications}></IonIcon></IonButton>
                                }
                            </>
                        }
                        <IonButton onClick={openExternalUrl}><IonIcon icon={openOutline}></IonIcon></IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <EventInfo eventId={match.params.eventId}></EventInfo>
            </IonContent>
        </IonPage>
    )
}
export default EventDetails;
