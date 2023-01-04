import { Storage } from "@ionic/storage";

export class StorageService {
    private static s_instance: StorageService;

    private store = new Storage();

    private constructor() {
    }

    public static getInstance(): StorageService {
        if (!this.s_instance) {
            this.s_instance = new StorageService();
            this.s_instance.initialize();
        }

        return this.s_instance;
    }

    private async initialize(): Promise<void> {
        await this.store.create();
    }

    public async get(key: string): Promise<any> {
        return await this.store.get(key);
    }

    public async set(key: string, value: any): Promise<void> {
        await this.store.set(key, value);
    }

    public async remove(key: string): Promise<void> {
        await this.store.remove(key);
    }
}
