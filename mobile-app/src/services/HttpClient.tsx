import { CapacitorHttp } from '@capacitor/core';
export class HttpClient {
    public async post(url: string, data: any): Promise<any> {
        return await this.send("POST", url, data, null, null);
    }

    public async get(url: string, params: any): Promise<any> {
        return await this.send("GET", url, null, params, null);
    }

    public async put(url: string, data: any): Promise<any> {
        return await this.send("PUT", url, data, null, null);
    }

    public async delete(url: string, params: any): Promise<any> {
        return await this.send("DELETE", url, null, params, null);
    }

    public async send(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data: any, params: any, customHeaders: any): Promise<any> {
        let config : any = {
            method: method,
            url: url,
            params: params,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                ...customHeaders,
            },
        };

        if (data !== null) {
            config.data = data;
        }
        try {
            const result = await CapacitorHttp.request(config)
            return result.data;
        }
        catch (err) {
            const error = err as any;
            throw error;
        }
    }
}
