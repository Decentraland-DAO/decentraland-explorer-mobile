import { DecentralandEvent } from "../api/event/DecentralandEvent";
import { HttpClient } from "./HttpClient";

export class EventsService {

    private httpClient = new HttpClient();

    private events: Array<DecentralandEvent> = [];

    public async getEvents(): Promise<Array<DecentralandEvent>> {
        const url = "https://events.decentraland.org/api/events";
        const data = await this.httpClient.get(url, null);
        let events = data.data as Array<DecentralandEvent>;
        events = events.sort((event1: DecentralandEvent, event2: DecentralandEvent) => {
            const start1 = new Date(event1.next_start_at);
            const start2 = new Date(event2.next_start_at);
            return start1.getTime() - start2.getTime();
        });
        this.events = events;
        return events;
    }

    public async getEvent(eventId: string): Promise<DecentralandEvent | null> {
        const url = `https://events.decentraland.org/api/events/${eventId}`;
        const data = await this.httpClient.get(url, null);
        return data.data as DecentralandEvent;
    }
}
