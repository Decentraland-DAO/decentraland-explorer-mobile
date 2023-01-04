import { Emote } from "./Emote";
import { ENS } from "./ENS";
import { Estate } from "./Estate";
import { Parcel } from "./Parcel";
import { Wearable } from "./Wearable";

export interface NFT{
    activeOrderId: string,
    category: string,
    chainId: number,
    contractAddress: string,
    createdAt: number,
    data: {
        estate?: Estate,
        parcel?: Parcel,
        ens?: ENS,
        wearable?: Wearable,
        emote?: Emote
    },
    id: string,
    image: string,
    issuedId: string,
    itemId: string,
    name: string,
    network: string,
    owner: string,
    soldAt: number,
    tokenId: string,
    updatedAt: number,
    url: string
}
