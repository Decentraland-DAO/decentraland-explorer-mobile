import { ProfileInfo } from "../api/profile/ProfileInfo";
import { StoreInfo } from "../api/profile/StoreInfo";
import { HttpClient } from "./HttpClient";

export class ProfileService {

    private httpClient = new HttpClient();

    public async getProfileInfo(id: string): Promise<ProfileInfo | null> {
        const url = `https://peer-lb.decentraland.org/lambdas/profiles?id=${id}`;
        const data = await this.httpClient.get(url, null);
        if (data.length > 0) {
            const result = data[0] as ProfileInfo;
            return result;
        }
        else {
            return null;
        }
    }

    public async getProfileInfos(ids: Array<string>): Promise<Array<ProfileInfo> | null> {
        if (ids.length > 0) {
            const url = `https://peer-lb.decentraland.org/lambdas/profiles?id=${ids.join("&id=")}`;
            const data = await this.httpClient.get(url, null);
            if (data.length > 0) {
                return data as Array<ProfileInfo>;
            }
        }
        return null;
    }

    public async getStoreInfo(id: string): Promise<StoreInfo | null> {
        const url = `https://peer.decentraland.org/content/entities/store?pointer=urn:decentraland:off-chain:marketplace-stores:${id}`;
        const data = await this.httpClient.get(url, null);
        if (data.length > 0) {
            const result = data[0] as StoreInfo;
            return result;
        }
        else {
            return null;
        }
    }
}
