import { Device } from "@capacitor/device";
import { HttpClient } from "./HttpClient";

interface ReviewConfig {
    demoWallet: boolean;
    walletAddress?: string;
}

export class AppReviewService {

    private static _instance: AppReviewService;

    private static _instantiating: boolean = false;

    private reviewConfig: ReviewConfig | null = null;

    private configUrl = "https://dcland.app/appreview-v35.json";

    private reviewEndDate = new Date(2022, 11, 30);

    private subscribers: Array<() => void> = [];

    private constructor() {
    }

    public static getInstance(): AppReviewService {
        if (!this._instance) {
            this._instance = new AppReviewService();
            this._instance.getConfig();
        }
        return this._instance;
    }

    private async getConfig(): Promise<void> {
        if (this.reviewConfig === null) {
            const deviceInfo = await Device.getInfo();
            // Review spesific configuration (demo wallet etc.) is only required for Apple reviews
            if (deviceInfo.platform === "ios") {
                const httpClient = new HttpClient();
                const url = this.configUrl + "?d=" + new Date().getTime();
                const now = new Date();
                if (now < this.reviewEndDate) {
                    try {
                        const data = await httpClient.get(url, null);
                        this.reviewConfig = data;
                    }
                    catch {
                        this.reviewConfig = {
                            demoWallet: false
                        };
                    }
                }
            }
            else {
                this.reviewConfig = {
                    demoWallet: false
                };
            }
        }

        this.notifySubscribers();
    }

    subscribe(subscriber: () => void) {
        this.subscribers.push(subscriber);
    }

    notifySubscribers() {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }

    public getReviewConfig(): ReviewConfig {
        return this.reviewConfig as ReviewConfig;
    }
}
