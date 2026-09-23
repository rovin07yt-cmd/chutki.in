import { areaState } from "./state.js";

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export function initializeMap() {
  if (!window.L) {
    throw new Error("Leaflet is not loaded");
  }

  if (areaState.map) {
    areaState.map.invalidateSize();
    return areaState.map;
  }

  areaState.map = L.map("areaMap", {
    zoomControl: true,
    attributionControl: true
  });

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }
  ).addTo(areaState.map);

  areaState.map.setView(
    DEFAULT_CENTER,
    DEFAULT_ZOOM
  );

  setTimeout(() => {
    areaState.map?.invalidateSize();
  }, 100);

  return areaState.map;
}

export function invalidateMap() {
  areaState.map?.invalidateSize();
}

export function setMapView(
  latitude,
  longitude,
  zoom = 14
) {
  if (!areaState.map) return;

  areaState.map.setView(
    [Number(latitude), Number(longitude)],
    zoom
  );
}

export function fitMapToLayers(
  layers,
  padding = [40, 40]
) {
  if (!areaState.map || !layers.length) {
    return;
  }

  let bounds = null;

  for (const layer of layers) {
    if (!layer?.getBounds) continue;

    const layerBounds = layer.getBounds();

    if (!bounds) {
      bounds = layerBounds;
    } else {
      bounds = bounds.extend(layerBounds);
    }
  }

  if (!bounds || !bounds.isValid()) {
    return;
  }

  areaState.map.fitBounds(
    bounds,
    {
      padding,
      maxZoom: 14
    }
  );
}

export function clearMapLayers() {
  if (!areaState.map) return;

  areaState.circleLayers.forEach(
    layer => {
      areaState.map.removeLayer(layer);
    }
  );

  areaState.circleLayers.clear();
}

export function onMapClick(handler) {
  if (!areaState.map) return;

  areaState.map.on(
    "click",
    handler
  );
}

export function offMapClick(handler) {
  if (!areaState.map) return;

  areaState.map.off(
    "click",
    handler
  );
}
