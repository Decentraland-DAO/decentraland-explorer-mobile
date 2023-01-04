import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';
import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonModal, IonPage, IonRow, IonSearchbar, IonText, IonThumbnail, IonTitle, IonToolbar, useIonViewDidEnter } from '@ionic/react';
import { layers, location } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { NFT } from '../../api/nft/NFT';
import LandSearchModal from '../../components/map/LandSearchModal';
import ToolbarMenuButton from '../../components/ToolbarMenuButton';
import { DecentralandTileLayer } from '../../leaflet/DecentralandTileLayer';
import { SatelliteViewTileLayer } from '../../leaflet/SatelliteViewTileLayer';
import { ParcelMarker } from '../../leaflet/ParcelMarker';
import { MapService } from '../../services/MapService';
import './MetaverseMap.css';

const MetaverseMap: React.FC = () => {

  const [showSearch, setShowSearch] = useState(false);
  const [showMapTypes, setShowMapTypes] = useState(false);
  const [layerType, setLayerType] = useState("");
  const [activeLayer, setActiveLayer] = useState<any>(null);
  const map = useRef(null);
  const attributionControl = useRef(null);
  const marker = useRef(null);
  const history = useHistory();

  useEffect(() => {
    FirebaseAnalytics.logEvent({
      name: "screen_view",
      params: {
        screen_name: "Metaverse Map",
        screen_class: "MetaverseMap",
      },
    });
  }, []);

  const initMap = () => {
    if (map.current !== null) {
      return;
    }
    var container = L.DomUtil.get("map");
    if (container != null) {
      try {
        (map.current as any).remove();
        //container._leaflet_id = null;
      } catch { }
    }
    map.current = L.map("map", {
      crs: L.CRS.Simple,
      zoomControl: false,
      attributionControl: false,
      bounceAtZoomLimits: false,
    });

    attributionControl.current = L.control.attribution({ prefix: false });

    //(map.current as any).attributionControl.options.prefix = "";
    viewMapLayer();
    (map.current as any).invalidateSize();
  }

  useEffect(() => {
    if (activeLayer && map.current) {
      (map.current as any).off("click");
      (map.current as any).on("click", (e: any) => {
        handleMapClick(e);
      });
    }
  }, [activeLayer]);

  useIonViewDidEnter(() => {
    // required hack
    // leaflet map needs to be invalidated between screen transitions
    const leafletMap = map.current as any;
    if (leafletMap !== null) {
      leafletMap.invalidateSize();
    }
  })

  useEffect(() => {
    initMap();
  }, []);

  const goToLand = (land: NFT) => {
    let x = 0;
    let y = 0;
    if (land.data.estate) {
      x = land.data.estate.parcels[0].x;
      y = land.data.estate.parcels[0].y;
    }
    else if (land.data.parcel) {
      x = land.data.parcel.x;
      y = land.data.parcel.y;
    }

    // Convert from x, y to lng, lat
    const mapService = new MapService();
    const [lat, lng] = mapService.convertToLatLng(x, y, activeLayer.options.parcelSize, activeLayer.options.tileSize, activeLayer.options.latOffset, activeLayer.options.lngOffset);

    (map.current as any).flyTo([lat, lng], 3);

    // add marker
    if (marker.current !== null) {
      (map.current as any).removeLayer(marker.current);
    }
    marker.current = new ParcelMarker([lat, lng]).addTo(map.current);
  }

  const viewMapLayer = () => {
    if (layerType !== "map") {
      const tileSize = 2560;
      const layer = new DecentralandTileLayer("", {
        tileSize: tileSize,
        zoomOffset: 0,
        minZoom: 0,
        maxZoom: 3,
        lngOffset: 0,
        latOffset: 0,
        parcelSize: 5,
        bounds: L.latLngBounds(L.latLng(0, 0), L.latLng(-1 * tileSize, tileSize)),
      });
      (map.current as any).removeControl(attributionControl.current);
      viewLayer(layer);
      setLayerType("map");
    }
  }

  const viewSatelliteLayer = () => {
    if (layerType !== "satellite") {
      const tileSize = 512;
      const layer = new SatelliteViewTileLayer("", {
        tileSize: tileSize,
        zoomOffset: 0,
        minZoom: 1,
        maxZoom: 6,
        lngOffset: 12,
        latOffset: -12,
        parcelSize: 1.6,
        bounds: L.latLngBounds(L.latLng(0, 0), L.latLng(-1 * tileSize, tileSize)),
        attribution: "Satellite View by https://genesis.city"
      });

      (map.current as any).addControl(attributionControl.current);
      viewLayer(layer);
      setLayerType("satellite");
    }
  }

  const viewLayer = (layer: any) => {
    let tileSize = layer.options.tileSize;
    let center = [-1 * tileSize / 2, tileSize / 2];
    let zoom = layer.options.minZoom;

    if (activeLayer !== null) {
      const activeCenter = (map.current as any).getCenter();
      const activeZoom = (map.current as any).getZoom();
      activeLayer.remove();

      // re-calculate center in terms of new layer's scales
      const mapService = new MapService();
      let [centerX, centerY] = mapService.convertToXY(activeCenter.lng + activeLayer.options.lngOffset, activeCenter.lat + activeLayer.options.latOffset, activeLayer.options.parcelSize, activeLayer.options.tileSize);
      if (centerX > 150) {
        centerX = 150;
      }
      else if (centerX < -150) {
        centerX = -150;
      }

      if (centerY > 150) {
        centerY = 150;
      }
      else if (centerY < -150) {
        centerY = -150;
      }
      const [newLayerCenterLat, newLayerCenterLng] = mapService.convertToLatLng(centerX, centerY, layer.options.parcelSize, layer.options.tileSize, layer.options.latOffset, layer.options.lngOffset);
      const layersMinZoomDiff = activeLayer.options.minZoom - layer.options.minZoom;
      center = [newLayerCenterLat, newLayerCenterLng];
      zoom = activeZoom > layer.options.maxZoom ? layer.options.maxZoom : activeZoom - layersMinZoomDiff;
    }

    (map.current as any).setMaxBounds(layer.options.bounds);
    (map.current as any).setMaxZoom(layer.options.maxZoom);
    (map.current as any).setMinZoom(layer.options.minZoom);
    (map.current as any).setZoom(zoom);
    setTimeout(() => {
      (map.current as any).setView(center, zoom);
      layer.addTo(map.current);
    }, 500);
    setActiveLayer(layer);
  }

  const handleMapClick = async (e: any) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const mapService = new MapService();
    let [xParcel, yParcel] = mapService.convertToXY(lng + activeLayer.options.lngOffset, lat + activeLayer.options.latOffset, activeLayer.options.parcelSize, activeLayer.options.tileSize);
    if (!(xParcel >= -150 && xParcel <= 150 && yParcel >= -150 && yParcel <= 150)) {
      const tileInfo = await mapService.getTileInfo(xParcel, yParcel);
      if (!tileInfo) {
        // empty parcels
        return;
      }
    }

    history.push(`/land/${xParcel}/${yParcel}`);
  }

  return (
    <>
      <IonPage className="metaverse-map">
        <IonContent fullscreen={true}>
          <IonHeader slot="fixed">
            <IonToolbar>
              <ToolbarMenuButton></ToolbarMenuButton>
              <IonSearchbar inputMode="none" onClick={() => { setShowSearch(true) }} searchIcon={location}></IonSearchbar>
            </IonToolbar>
          </IonHeader>
          <div id="map">
          </div>
          <IonModal
            isOpen={showSearch}
            animated={false}
          >
            <LandSearchModal
              onLandSelected={(land) => goToLand(land)}
              onDismiss={() => setShowSearch(false)}
            ></LandSearchModal>
          </IonModal>
          <IonFab className="fab-layers" horizontal="end" vertical="center">
            <IonFabButton size="small" color="dark" onClick={() => setShowMapTypes(true)}>
              <IonIcon icon={layers}></IonIcon>
            </IonFabButton>
          </IonFab>
          <IonModal
            onDidDismiss={() => setShowMapTypes(false)}
            isOpen={showMapTypes}
            initialBreakpoint={0.25}
            breakpoints={[0, 0.25]}
            handle={false}
            className="map-types"
          >
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowMapTypes(false)}>Close</IonButton>
                </IonButtons>
                <IonTitle>Map Type</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonGrid>
              <IonRow>
                <IonCol onClick={() => {
                  setShowMapTypes(false);
                  viewMapLayer();
                }}>
                  <IonThumbnail>
                    <img alt="map view" src={process.env.PUBLIC_URL + "/assets/img/map-view.png"}></img>
                  </IonThumbnail>
                  <IonText>Map View</IonText>
                </IonCol>
                <IonCol onClick={() => {
                  setShowMapTypes(false);
                  viewSatelliteLayer();
                }}>
                  <IonThumbnail>
                    <img alt="satellite view" src={process.env.PUBLIC_URL + "/assets/img/satellite-view.png"}></img>
                  </IonThumbnail>
                  <IonText>Satellite View</IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default MetaverseMap;
