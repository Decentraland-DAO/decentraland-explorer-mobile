import { EstateInfo } from "../api/map/EstateInfo";
import { ParcelInfo } from "../api/map/ParcelInfo";
import { TileInfo } from "../api/map/TileInfo";
import { NFTInfo } from "../api/nft/NFTInfo";
import { HttpClient } from "./HttpClient";

export class MapService {

    private httpClient = new HttpClient();

    public async getTileInfo(x: number, y: number): Promise<TileInfo> {
        const url = `https://api.decentraland.org/v2/tiles?x1=${x}&x2=${x}&y1=${y}&y2=${y}`;
        const data = await this.httpClient.get(url, null);
        const result = data.data[`${x},${y}`] as TileInfo;
        return result;
    }

    public async getParcelInfo(x: number, y: number): Promise<ParcelInfo> {
        const url = `https://api.decentraland.org/v2/parcels/${x}/${y}`;
        const data = await this.httpClient.get(url, null);
        return data as ParcelInfo;
    }

    public async getEstateInfo(estateId: string): Promise<EstateInfo> {
        const url = `https://api.decentraland.org/v2/estates/${estateId}`;
        const data = await this.httpClient.get(url, null);
        return data as EstateInfo;
    }

    public async searchLand(first: number, skip: number, isOnSale: boolean, keyword: string): Promise<Array<NFTInfo>> {
        const url = `https://nft-api.decentraland.org/v1/nfts?first=${first}&skip=${skip}&sortBy=name&search=${keyword}&isLand=true`;
        const data = await this.httpClient.get(url, null);
        return data.data as Array<NFTInfo>;
    }

    public convertToXY(lng: number, lat: number, parcelSize: number, tileSize: number): Array<number> {
        const x = lng - (tileSize / 2);
        const y = lat + (tileSize / 2);
        const xScaled = (x - 0.5) / parcelSize;
        const yScaled = (y - 0.5) / parcelSize;
        let xParcel = Math.round(xScaled);
        let yParcel = Math.round(yScaled);
        if(xParcel === 0){
            xParcel = 1;
        }
        if(yParcel === 0){
            yParcel = 1;
        }
        return [xParcel, yParcel];
    }

    public convertToLatLng(x: number, y: number, parcelSize: number, tileSize: number, latOffset: number, lngOffset: number): Array<number>{
        const xScaled = (x * parcelSize) + 0.5;
        const yScaled = (y * parcelSize) + 0.5;
        const lng = xScaled + (tileSize / 2);
        const lat = yScaled - (tileSize / 2);
        return [lat - latOffset, lng - lngOffset];
    }
}