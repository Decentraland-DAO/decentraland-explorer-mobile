import { Attribute } from "./Attribute";

export interface ParcelInfo {
    id: string,
    name: string,
    description: string,
    image: string,
    external_url: string,
    attributes: Array<Attribute>
}