import { Attribute } from "./Attribute";

export interface EstateInfo {
    id: string,
    name: string,
    description: string,
    image: string,
    external_url: string,
    attributes: Array<Attribute>
}