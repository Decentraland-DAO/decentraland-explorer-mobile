export const ParcelMarker = L.Marker.extend({
    options: {
        icon: L.icon({
            iconUrl: process.env.PUBLIC_URL + "/assets/img/marker.png",             
            iconSize: [25, 41],            
            iconAnchor: [12, 35],
        }),
    },
});