
import { StorageService } from './StorageService';
import { Item } from '../api/marketplace/Item';
import { NFTInfo } from '../api/nft/NFTInfo';
import { DecentralandEvent } from '../api/event/DecentralandEvent';
import { FCM } from '@capacitor-community/fcm';

export class FavoritesService {

    private FAVORITE_ITEMS_KEY = "favorite-items";

    private FAVORITE_LANDS_KEY = "favorite-lands";

    private FAVORITE_EVENTS_KEY = "favorite-events";

    private FAVORITE_NAMES_KEY = "favorite-names";

    public async getItems(): Promise<Array<Item> | null> {
        return await this.getElements(this.FAVORITE_ITEMS_KEY);
    }

    public async getItem(id: string): Promise<Item | undefined> {
        return await this.getElement(this.FAVORITE_ITEMS_KEY, (item: Item) => item.id === id);
    }

    public async addItem(item: Item): Promise<void> {
        await this.addElement(this.FAVORITE_ITEMS_KEY, item, (i: Item) => i.id === item.id);
    }

    public async updateItem(item: Item): Promise<void> {
        await this.updateElement(this.FAVORITE_ITEMS_KEY, item, (i: Item) => i.id === item.id);
    }

    public async removeItem(item: Item): Promise<void> {
        await this.removeElement(this.FAVORITE_ITEMS_KEY, item, (i: Item) => i.id === item.id);
    }

    public async getLands(): Promise<Array<NFTInfo> | null> {
        return await this.getElements(this.FAVORITE_LANDS_KEY);
    }

    public async getLand(id: string): Promise<NFTInfo | undefined> {
        return await this.getElement(this.FAVORITE_LANDS_KEY, (land: NFTInfo) => land.nft.id === id);
    }

    public async addLand(land: NFTInfo): Promise<void> {
        await this.addElement(this.FAVORITE_LANDS_KEY, land, (l: NFTInfo) => l.nft.id === land.nft.id);
        await this.subscribeToTopic(land);
    }

    public async updateLand(land: NFTInfo): Promise<void> {
        await this.updateElement(this.FAVORITE_LANDS_KEY, land, (l: NFTInfo) => l.nft.id === land.nft.id);
    }

    public async removeLand(land: NFTInfo): Promise<void> {
        await this.removeElement(this.FAVORITE_LANDS_KEY, land, (l: NFTInfo) => l.nft.id === land.nft.id);
        await this.unsubscribeFromTopic(land);
    }

    public async getEvents(): Promise<Array<DecentralandEvent> | null> {
        const events = await this.getElements(this.FAVORITE_EVENTS_KEY);

        // remove expired events from favorites
        const unexpiredEvents: Array<DecentralandEvent> = [];
        const expiredEvents = events?.filter((e: DecentralandEvent) => {
            const eventFinish = new Date(e.next_finish_at);
            const now = new Date();
            if (eventFinish >= now) {
                unexpiredEvents.push(e);
            }
            return eventFinish < now;
        });

        if (expiredEvents && expiredEvents.length > 0) {
            for (const expiredEvent of expiredEvents) {
                await this.removeEvent(expiredEvent);
            }
        }
        return unexpiredEvents;
    }

    public async getEvent(id: string): Promise<DecentralandEvent | undefined> {
        return await this.getElement(this.FAVORITE_EVENTS_KEY, (event: DecentralandEvent) => event.id === id);
    }

    public async addEvent(event: DecentralandEvent): Promise<void> {
        await this.addElement(this.FAVORITE_EVENTS_KEY, event, (i: DecentralandEvent) => i.id === event.id);
    }

    public async updateEvent(event: DecentralandEvent): Promise<void> {
        await this.updateElement(this.FAVORITE_EVENTS_KEY, event, (i: DecentralandEvent) => i.id === event.id);
    }

    public async removeEvent(event: DecentralandEvent): Promise<void> {
        await this.removeElement(this.FAVORITE_EVENTS_KEY, event, (i: DecentralandEvent) => i.id === event.id);
    }

    public async getNames(): Promise<Array<NFTInfo> | null> {
        return await this.getElements(this.FAVORITE_NAMES_KEY);
    }

    public async getName(id: string): Promise<NFTInfo | undefined> {
        return await this.getElement(this.FAVORITE_NAMES_KEY, (name: NFTInfo) => name.nft.id === id);
    }

    public async addName(name: NFTInfo): Promise<void> {
        await this.addElement(this.FAVORITE_NAMES_KEY, name, (l: NFTInfo) => l.nft.id === name.nft.id);
        await this.subscribeToTopic(name);
    }

    public async updateName(name: NFTInfo): Promise<void> {
        await this.updateElement(this.FAVORITE_NAMES_KEY, name, (l: NFTInfo) => l.nft.id === name.nft.id);
    }

    public async removeName(name: NFTInfo): Promise<void> {
        await this.removeElement(this.FAVORITE_NAMES_KEY, name, (l: NFTInfo) => l.nft.id === name.nft.id);
        await this.unsubscribeFromTopic(name);
    }

    public async getElements(container: string): Promise<Array<any> | null> {
        let elements = await StorageService.getInstance().get(container);
        if (elements === null) {
            elements = [];
        }
        return elements;
    }

    public async getElement(container: string, searchFn: (element: any) => void): Promise<any | undefined> {
        let elements = await StorageService.getInstance().get(container) as Array<any>;
        let element = undefined;
        if (elements) {
            element = elements.find(searchFn);
        }
        return element;
    }

    public async addElement(container: string, element: any, searchFn: (element: any) => void): Promise<void> {
        let elements = await StorageService.getInstance().get(container);
        if (elements === null) {
            elements = [];
        }
        const elementIndex = elements.findIndex(searchFn);
        if (elementIndex < 0) {
            elements.push(element);
        }
        await StorageService.getInstance().set(container, elements);
    }

    public async updateElement(container: string, element: any, searchFn: (element: any) => void): Promise<void> {
        let elements = await StorageService.getInstance().get(container) as Array<any>;
        if (elements !== null) {
            const elementIndex = elements.findIndex(searchFn);
            if (elementIndex >= 0) {
                elements[elementIndex] = element;
            }
        }
        await StorageService.getInstance().set(container, elements);
    }

    public async removeElement(container: string, element: any, searchFn: (element: any) => void): Promise<void> {
        let elements = await StorageService.getInstance().get(container) as Array<any>;
        if (elements !== null) {
            const elementIndex = elements.findIndex(searchFn);
            if (elementIndex >= 0) {
                elements.splice(elementIndex, 1);
            }
        }
        await StorageService.getInstance().set(container, elements);
    }

    private async subscribeToTopic(nftInfo: NFTInfo) {
        await FCM.subscribeTo({ topic: `${nftInfo.nft.contractAddress}-${nftInfo.nft.tokenId}` });
    }

    private async unsubscribeFromTopic(nftInfo: NFTInfo) {
        await FCM.unsubscribeFrom({ topic: `${nftInfo.nft.contractAddress}-${nftInfo.nft.tokenId}` });
    }
}
