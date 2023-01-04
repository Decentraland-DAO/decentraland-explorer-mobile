export class SharedState {
    private static _instance: SharedState;

    private values: any = {};

    private subscribers: Map<string, Array<(key: any, val: any) => void>> = new Map<string, Array<(key: any, val: any) => void>>();

    private constructor() {
    }

    public static getInstance(): SharedState {
        if (!this._instance) {
            this._instance = new SharedState();
        }

        return this._instance;
    }

    public getValue(key: string): any {
        return this.values[key];
    }

    public setValue(key: string, value: any) {
        this.values[key] = value;
        this.notifySubscribers(key, value);
    }

    public subscribe(key: string, cb: (key: string, value: any) => void) {
        const cbs = this.subscribers.get(key);
        if (cbs) {
            cbs.push(cb);
            this.subscribers.set(key, cbs);
        }
        else {
            this.subscribers.set(key, [cb]);
        }
    }

    public notifySubscribers(key: string, value: any) {
        const cbs = this.subscribers.get(key);
        if (cbs) {
            for (const cb of cbs) {
                cb(key, value);
            }
        }
    }

}
