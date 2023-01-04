import * as functions from "firebase-functions";
import { NftService } from "./services/NftService";
import { Collections } from "./constants/Collections";
import { CacheKeys } from "./constants/CacheKeys";
import { CacheItem } from "./models/CacheItem";
import { Sale } from "./models/nft/Sale";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import { Contracts } from "./constants/Contracts";
import { Bid } from "./models/nft/Bid";
import { Order } from "./models/nft/Order";
import { Topics } from "./constants/Topics";
import { Utils } from "./common/Utils";
import { GovernanceService } from "./services/GovernanceService";
import { Proposal } from "./models/governance/Proposal";
import { Item } from "./models/nft/Item";
import admin = require("firebase-admin");

const db = admin.firestore();
const utils = new Utils();

export const checkForDclUpdates = functions.runWith({ memory: "1GB", timeoutSeconds: 500 }).pubsub.schedule("every 1 hours").onRun(async (context) => {
    try {
        // Get latest sales
        await checkLatestSales();

        // Get latest bids
        await checkLatestBids();

        // check latest listings
        await checkLatestListings();

        // check listing updates
        await checkListingUpdates();

        // check latest items
        await checkLatestItems();

        // check latest proposals
        await checkLatestProposals();
    }
    catch (err) {
        functions.logger.error("An error has occured while checking for latest sale data.", err);
    }

    return null;
});

async function checkLatestSales() {
    const nftService = new NftService();
    const latestSales = await nftService.getLatestSales(["estate", "parcel", "ens"], 5, 0);

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_SALES).get();
    let newSales = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const salesCacheItem = qSnap.docs[0].data() as CacheItem;
        const salesInCache = salesCacheItem.value as Array<Sale>;

        // find diff;
        for (const latestSale of latestSales) {
            if (salesInCache.findIndex((s) => s.id === latestSale.id) < 0) {
                // new sale
                newSales.push(latestSale);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newSales = latestSales;
    }

    await publishSaleNotifications(newSales);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_SALES,
        value: latestSales
    });
}

async function publishSaleNotifications(newSales: Sale[]) {
    const nftService = new NftService();
    const messages: Array<Message> = [];
    if (newSales.length > 0) {
        const lastSale = newSales[0];
        let title = "";
        let url = "";
        let topic = "";
        // get nft
        const lastSaleNftInfo = await nftService.getNftInfo(lastSale.contractAddress, lastSale.tokenId);

        // publish latest sale notification to general interest topic
        if (lastSale.contractAddress === Contracts.ESTATE) {
            title = `Estate sold for ${utils.formatPrice(lastSale.price / (1e18))} MANA`;
            url = `/land/${lastSaleNftInfo.nft.data.estate?.parcels[0].x}/${lastSaleNftInfo.nft.data.estate?.parcels[0].y}`;
            topic = Topics.LAND_SALES;
        }
        else if (lastSale.contractAddress === Contracts.PARCEL) {
            title = `Parcel sold for ${utils.formatPrice(lastSale.price / (1e18))} MANA`;
            url = `/land/${lastSaleNftInfo.nft.data.parcel?.x}/${lastSaleNftInfo.nft.data.parcel?.y}`;
            topic = Topics.LAND_SALES;
        }
        else if (lastSale.contractAddress === Contracts.ENS) {
            title = `Name sold for ${utils.formatPrice(lastSale.price / (1e18))} MANA`;
            url = `/name/${lastSale.contractAddress}/${lastSale.tokenId}`;
            topic = Topics.ENS_SALES;
        }

        if (topic !== "") {
            messages.push({
                topic: topic,
                notification: {
                    title: title,
                    body: lastSaleNftInfo.nft.name,
                },
                data: {
                    "url": url
                }
            });
        }

        // publish each sale to nft specific topics
        for (const sale of newSales) {
            const nftTopic = sale.contractAddress + "-" + sale.tokenId;
            const soldNftInfo = await nftService.getNftInfo(sale.contractAddress, sale.tokenId);
            let nftNotificationTitle = "";
            let nftUrl = "";

            if (sale.contractAddress === Contracts.ESTATE) {
                nftNotificationTitle = `Your favorite estate sold for ${utils.formatPrice(sale.price / (1e18))} MANA`;
                nftUrl = `/land/${soldNftInfo.nft.data.estate?.parcels[0].x}/${soldNftInfo.nft.data.estate?.parcels[0].y}`;
            }
            else if (sale.contractAddress === Contracts.PARCEL) {
                nftNotificationTitle = `Your favorite parcel sold for ${utils.formatPrice(sale.price / (1e18))} MANA`;
                nftUrl = `/land/${soldNftInfo.nft.data.parcel?.x}/${soldNftInfo.nft.data.parcel?.y}`;
            }
            else if (sale.contractAddress === Contracts.ENS) {
                nftNotificationTitle = `Your favorite name sold for ${utils.formatPrice(sale.price / (1e18))} MANA`;
                nftUrl = `/name/${sale.contractAddress}/${sale.tokenId}`;
            }
            else {
                continue;
            }

            messages.push({
                topic: nftTopic,
                notification: {
                    title: nftNotificationTitle,
                    body: soldNftInfo.nft.name,
                },
                data: {
                    "url": nftUrl
                }
            });
        }

        await admin.messaging().sendAll(messages);
    }
}

async function checkLatestBids() {
    const nftService = new NftService();
    const latestParcelBids = await nftService.getLatestBids(Contracts.PARCEL, 5, 0);
    const latestEstateBids = await nftService.getLatestBids(Contracts.ESTATE, 5, 0);
    const latestEnsBids = await nftService.getLatestBids(Contracts.ENS, 5, 0);

    const latestBids = [...latestEstateBids, ...latestParcelBids, ...latestEnsBids];

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_BIDS).get();
    let newBids = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const bidsCacheItem = qSnap.docs[0].data() as CacheItem;
        const bidsInCache = bidsCacheItem.value as Array<Bid>;

        // find diff;
        for (const latestBid of latestBids) {
            if (bidsInCache.findIndex((s) => s.id === latestBid.id) < 0) {
                // new sale
                newBids.push(latestBid);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newBids = latestBids;
    }

    await publishBidNotifications(newBids);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_BIDS,
        value: latestBids
    });
}

async function publishBidNotifications(newBids: Bid[]) {
    const nftService = new NftService();
    const messages: Array<Message> = [];
    if (newBids.length > 0) {
        // publish each bid to nft specific topics
        for (const bid of newBids) {
            const nftTopic = bid.contractAddress + "-" + bid.tokenId;
            const nftInfo = await nftService.getNftInfo(bid.contractAddress, bid.tokenId);
            let nftNotificationTitle = "";
            let nftUrl = "";

            if (bid.contractAddress === Contracts.ESTATE) {
                nftNotificationTitle = `Your favorite estate has received a bid of ${utils.formatPrice(bid.price / (1e18))} MANA`;
                nftUrl = `/land/${nftInfo.nft.data.estate?.parcels[0].x}/${nftInfo.nft.data.estate?.parcels[0].y}`;
            }
            else if (bid.contractAddress === Contracts.PARCEL) {
                nftNotificationTitle = `Your favorite parcel has received a bid of ${utils.formatPrice(bid.price / (1e18))} MANA`;
                nftUrl = `/land/${nftInfo.nft.data.parcel?.x}/${nftInfo.nft.data.parcel?.y}`;
            }
            else if (bid.contractAddress === Contracts.ENS) {
                nftNotificationTitle = `Your favorite name has received a bid of ${utils.formatPrice(bid.price / (1e18))} MANA`;
                nftUrl = `/name/${bid.contractAddress}/${bid.tokenId}`;
            }
            else {
                continue;
            }

            messages.push({
                topic: nftTopic,
                notification: {
                    title: nftNotificationTitle,
                    body: nftInfo.nft.name,
                },
                data: {
                    "url": nftUrl
                }
            });
        }

        if (messages.length > 0) {
            await admin.messaging().sendAll(messages);
        }
    }
}

async function checkLatestListings() {
    const nftService = new NftService();
    const latestEstateListings = await nftService.getLatestListings(Contracts.ESTATE, 5, 0);
    const latestParcelListings = await nftService.getLatestListings(Contracts.PARCEL, 5, 0);
    const latestEnsListings = await nftService.getLatestListings(Contracts.ENS, 5, 0);

    const latestListings = [...latestEstateListings, ...latestParcelListings, ...latestEnsListings];

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_LISTINGS).get();
    let newListings = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const listingCacheItem = qSnap.docs[0].data() as CacheItem;
        const listingsInCache = listingCacheItem.value as Array<Order>;

        // find diff;
        for (const latestListing of latestListings) {
            if (listingsInCache.findIndex((s) => s.id === latestListing.id) < 0) {
                // new sale
                newListings.push(latestListing);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newListings = latestListings;
    }

    await publishListingNotifications(newListings);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_LISTINGS,
        value: latestListings
    });
}

async function publishListingNotifications(newListings: Order[]) {
    const nftService = new NftService();
    const messages: Array<Message> = [];
    if (newListings.length > 0) {
        const listing = newListings[0];
        let title = "";
        let url = "";
        let topic = "";
        // get nft
        const nftInfo = await nftService.getNftInfo(listing.contractAddress, listing.tokenId);

        // publish latest sale notification to general interest topic
        if (listing.contractAddress === Contracts.ESTATE) {
            title = `Estate for sale! ${utils.formatPrice(listing.price / (1e18))} MANA`;
            url = `/land/${nftInfo.nft.data.estate?.parcels[0].x}/${nftInfo.nft.data.estate?.parcels[0].y}`;
            topic = Topics.LAND_LISTINGS;
        }
        else if (listing.contractAddress === Contracts.PARCEL) {
            title = `Parcel for sale! ${utils.formatPrice(listing.price / (1e18))} MANA`;
            url = `/land/${nftInfo.nft.data.parcel?.x}/${nftInfo.nft.data.parcel?.y}`;
            topic = Topics.LAND_LISTINGS;
        }
        else if (listing.contractAddress === Contracts.ENS) {
            title = `Name for sale! ${utils.formatPrice(listing.price / (1e18))} MANA`;
            url = `/name/${listing.contractAddress}/${listing.tokenId}`;
            topic = Topics.ENS_LISTINGS;
        }

        if (topic !== "") {
            messages.push({
                topic: topic,
                notification: {
                    title: title,
                    body: nftInfo.nft.name,
                },
                data: {
                    "url": url
                }
            });
        }

        // publish each sale to nft specific topics
        for (const listing of newListings) {
            const nftTopic = listing.contractAddress + "-" + listing.tokenId;
            const listedNftInfo = await nftService.getNftInfo(listing.contractAddress, listing.tokenId);
            let nftNotificationTitle = "";
            let nftUrl = "";

            if (listing.contractAddress === Contracts.ESTATE) {
                nftNotificationTitle = `Your favorite estate is on sale for ${utils.formatPrice(listing.price / (1e18))} MANA`;
                nftUrl = `/land/${listedNftInfo.nft.data.estate?.parcels[0].x}/${listedNftInfo.nft.data.estate?.parcels[0].y}`;
            }
            else if (listing.contractAddress === Contracts.PARCEL) {
                nftNotificationTitle = `Your favorite parcel is on sale for ${utils.formatPrice(listing.price / (1e18))} MANA`;
                nftUrl = `/land/${listedNftInfo.nft.data.parcel?.x}/${listedNftInfo.nft.data.parcel?.y}`;
            }
            else if (listing.contractAddress === Contracts.ENS) {
                nftNotificationTitle = `Your favorite name is on sale for ${utils.formatPrice(listing.price / (1e18))} MANA`;
                nftUrl = `/name/${listing.contractAddress}/${listing.tokenId}`;
            }
            else {
                continue;
            }

            messages.push({
                topic: nftTopic,
                notification: {
                    title: nftNotificationTitle,
                    body: listedNftInfo.nft.name,
                },
                data: {
                    "url": nftUrl
                }
            });
        }

        if (messages.length > 0) {
            await admin.messaging().sendAll(messages);
        }
    }
}

async function checkListingUpdates() {
    const nftService = new NftService();
    const latestEstateListingUpdates = await nftService.getRecentlyUpdatedListings(Contracts.ESTATE, 5, 0);
    const latestParcelListingUpdates = await nftService.getRecentlyUpdatedListings(Contracts.PARCEL, 5, 0);
    const latestEnsListingUpdates = await nftService.getRecentlyUpdatedListings(Contracts.ENS, 5, 0);

    const allUpdates = [...latestEstateListingUpdates, ...latestParcelListingUpdates, ...latestEnsListingUpdates];

    const latestListingUpdates = allUpdates.filter((l) => l.updatedAt !== l.createdAt);

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_LISTING_UPDATES).get();
    let newUpdatedListings = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const listingCacheItem = qSnap.docs[0].data() as CacheItem;
        const listingsInCache = listingCacheItem.value as Array<Order>;

        // find diff;
        for (const latestListingUpdate of latestListingUpdates) {
            if (listingsInCache.findIndex((s) => s.id === latestListingUpdate.id) < 0) {
                // new sale
                newUpdatedListings.push(latestListingUpdate);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newUpdatedListings = latestListingUpdates;
    }

    await publishListingUpdateNotifications(newUpdatedListings);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_LISTING_UPDATES,
        value: latestListingUpdates
    });
}

async function publishListingUpdateNotifications(updatedListings: Order[]) {
    const nftService = new NftService();
    const messages: Array<Message> = [];
    if (updatedListings.length > 0) {
        // publish each sale to nft specific topics
        for (const listing of updatedListings) {
            const nftTopic = listing.contractAddress + "-" + listing.tokenId;
            const nftInfo = await nftService.getNftInfo(listing.contractAddress, listing.tokenId);
            let nftNotificationTitle = "";
            let nftUrl = "";

            if (listing.contractAddress === Contracts.ESTATE) {
                nftNotificationTitle = "The listing of your favorite estate has been updated";
                nftUrl = `/land/${nftInfo.nft.data.estate?.parcels[0].x}/${nftInfo.nft.data.estate?.parcels[0].y}`;
            }
            else if (listing.contractAddress === Contracts.PARCEL) {
                nftNotificationTitle = "The listing of your favorite parcel has been updated";
                nftUrl = `/land/${nftInfo.nft.data.parcel?.x}/${nftInfo.nft.data.parcel?.y}`;
            }
            else if (listing.contractAddress === Contracts.ENS) {
                nftNotificationTitle = "The listing of your favorite name has been updated";
                nftUrl = `/name/${listing.contractAddress}/${listing.tokenId}`;
            }
            else {
                continue;
            }

            messages.push({
                topic: nftTopic,
                notification: {
                    title: nftNotificationTitle,
                    body: nftInfo.nft.name,
                },
                data: {
                    "url": nftUrl
                }
            });
        }

        if (messages.length > 0) {
            await admin.messaging().sendAll(messages);
        }
    }
}

async function checkLatestProposals() {
    const governanceService = new GovernanceService();
    const latestProposals = await governanceService.getLatestProposals(5, 0);

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_PROPOSALS).get();
    let newProposals = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const proposalCacheItem = qSnap.docs[0].data() as CacheItem;
        const proposalsInCache = proposalCacheItem.value as Array<Proposal>;

        // find diff;
        for (const latestProposal of latestProposals) {
            if (proposalsInCache.findIndex((s) => s.id === latestProposal.id) < 0) {
                // new proposal
                newProposals.push(latestProposal);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newProposals = latestProposals;
    }

    await publishProposalNotifications(newProposals);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_PROPOSALS,
        value: latestProposals
    });
}

async function publishProposalNotifications(newProposals: Proposal[]) {
    const messages: Array<Message> = [];
    if (newProposals.length > 0) {
        const proposal = newProposals[0];
        messages.push({
            topic: Topics.PROPOSALS,
            notification: {
                title: "New proposal has been submitted to DAO",
                body: proposal.title,
            },
            data: {
                "url": `/proposal/${proposal.id}`
            }
        });

        if (messages.length > 0) {
            await admin.messaging().sendAll(messages);
        }
    }
}

async function checkLatestItems() {
    const nftService = new NftService();
    const latestItems = await nftService.getLatestItems(5, 0);

    let cacheDocRef = db.collection(Collections.DCL_CACHE).doc();

    // Compare data with cache
    const qSnap = await db.collection(Collections.DCL_CACHE).where("key", "==", CacheKeys.LATEST_ITEMS).get();
    let newItems = [];
    if (!qSnap.empty) {
        cacheDocRef = qSnap.docs[0].ref;
        const itemCacheItem = qSnap.docs[0].data() as CacheItem;
        const itemsInCache = itemCacheItem.value as Array<Item>;

        // find diff;
        for (const latestItem of latestItems) {
            if (itemsInCache.findIndex((s) => s.id === latestItem.id) < 0) {
                // new proposal
                newItems.push(latestItem);
            }
        }
    }
    else {
        // cache is empty, all incoming data is considered as new
        newItems = latestItems;
    }

    await publishItemNotifications(newItems);

    // Save latest data in cache
    await cacheDocRef.set({
        key: CacheKeys.LATEST_ITEMS,
        value: latestItems
    });
}

async function publishItemNotifications(newItems: Item[]) {
    const messages: Array<Message> = [];
    if (newItems.length > 0) {
        const item = newItems.find((i) => i.category === "wearable" || i.category === "emote");
        if (item) {
            messages.push({
                topic: Topics.ITEM_LISTINGS,
                notification: {
                    title: `New ${item.category} is available for minting. ${utils.formatPrice(item.price / (1e18))} MANA`,
                    body: item.name
                },
                data: {
                    "url": `/item/${item.contractAddress}/${item.itemId}`
                }
            });
        }

        if (messages.length > 0) {
            await admin.messaging().sendAll(messages);
        }
    }
}
