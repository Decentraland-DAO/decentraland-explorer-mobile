export const SatelliteViewTileLayer = L.TileLayer.extend({
  retries: [],
  getTileUrl: function (coords: any) {

    const zoomLevel = parseInt(coords.z);
    const x = parseInt(coords.x);
    const y = parseInt(coords.y);

    // x is zero based tile index from left edge
    // y is zero based tile index from top edge

    const mapServerUrl = `https://genesis.city/map/latest/${zoomLevel}/${x},${y}.jpg`;
    return mapServerUrl;
  },

  _tileOnError: function (done: any, tile: any, e: any) {
    // map-server may fail to respond at first attempt
    // retry to load the tile again
    let tileRetry = this.retries.find((r: any) => r.src === tile.src);
    if (tileRetry === undefined) {
      tileRetry = {
        src: tile.src,
        retries: 0
      };
      this.retries.push(tileRetry);
    }
    if (tileRetry.retries < 5) {
      tileRetry.retries++;
      setTimeout(() => {
        tile.src = tile.src;
      }, 500);
      done(e, tile);
    }
    else {
      L.TileLayer.prototype._tileOnError.call(this, done, tile, e);
    }
  }

});