export const DecentralandTileLayer = L.TileLayer.extend({
  retries: [],
  getTileUrl: function (coords: any) {

    const zoomLevel = parseInt(coords.z);
    const x = parseInt(coords.x);
    const y = parseInt(coords.y);

    // x is zero based tile index from left edge
    // y is zero based tile index from top edge

    const mapHeight = 512;
    const mapWidth = 512;
    const tileWidth = mapWidth / (Math.pow(2, zoomLevel));
    const tileHeight = mapHeight / (Math.pow(2, zoomLevel));
    const xCenterDistanceToLeftEdge = (x + 0.5) * tileWidth;
    const yCenterDistanceToTopEdge = (y + 0.5) * tileHeight;
    const originDistanceToLeftEdge = mapWidth / 2;
    const originDistanceToTopEdge = mapHeight / 2;
    const xCenter = xCenterDistanceToLeftEdge - originDistanceToLeftEdge;
    const yCenter = originDistanceToTopEdge - yCenterDistanceToTopEdge;

    const imageWidth = 2560;
    const imageHeight = 2560;
    const imageParcelWidth = 5 * (Math.pow(2, zoomLevel));
    const mapServerUrl = `https://api.decentraland.org/v2/map.png?width=${imageWidth}&height=${imageHeight}&size=${imageParcelWidth}&center=${xCenter},${yCenter}&on-sale=true`;

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