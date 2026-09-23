import { areaState } from "./state.js";
import {
  clearMapLayers,
  fitMapToLayers
} from "./map.js";

export function renderCircles(circles = [], onSelect = null) {
  clearMapLayers();

  if (!areaState.map) {
    return [];
  }

  const layers = [];

  for (const circle of circles) {
    const lat = Number(circle.center_lat);
    const lng = Number(circle.center_lng);
    const radiusKm = Number(circle.radius);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !Number.isFinite(radiusKm)
    ) {
      continue;
    }

    const layer = L.circle(
      [lat, lng],
      {
        radius: radiusKm * 1000,
        color: "#e53935",
        fillColor: "#e53935",
        fillOpacity: 0.16,
        weight: 2
      }
    ).addTo(areaState.map);

    layer.circleData = {
      ...circle,
      center_lat: lat,
      center_lng: lng,
      radius: radiusKm
    };

    layer.on("click", event => {
      L.DomEvent.stopPropagation(event);

      selectCircle(layer);

      if (typeof onSelect === "function") {
        onSelect(layer.circleData);
      }
    });

    areaState.circleLayers.set(
      Number(circle.circle_id),
      layer
    );

    layers.push(layer);
  }

  if (layers.length) {
    fitMapToLayers(layers);
  }

  return layers;
}

export function selectCircle(layer) {
  if (!layer) return;

  areaState.selectedCircle = {
    id: Number(layer.circleData.circle_id),
    areaId: areaState.selectedAreaId,

    center_lat: Number(
      layer.circleData.center_lat
    ),

    center_lng: Number(
      layer.circleData.center_lng
    ),

    radius: Number(
      layer.circleData.radius
    ),

    saved: true,
    layer
  };

  highlightSelectedCircle();
}

export function highlightSelectedCircle() {
  areaState.circleLayers.forEach(
    layer => {
      const selected =
        areaState.selectedCircle &&
        Number(
          layer.circleData.circle_id
        ) === Number(
          areaState.selectedCircle.id
        );

      layer.setStyle({
        color: selected
          ? "#b71c1c"
          : "#e53935",

        fillColor: selected
          ? "#b71c1c"
          : "#e53935",

        fillOpacity: selected
          ? 0.25
          : 0.16,

        weight: selected
          ? 3
          : 2
      });
    }
  );
}

export function updateSelectedCircleLayer() {
  const circle =
    areaState.selectedCircle;

  if (!circle) return;

  if (circle.saved) {
    const layer =
      areaState.circleLayers.get(
        Number(circle.id)
      );

    if (!layer) return;

    layer.setLatLng([
      Number(circle.center_lat),
      Number(circle.center_lng)
    ]);

    layer.setRadius(
      Number(circle.radius) * 1000
    );

    layer.circleData.center_lat =
      Number(circle.center_lat);

    layer.circleData.center_lng =
      Number(circle.center_lng);

    layer.circleData.radius =
      Number(circle.radius);
  }

  if (areaState.draftCircle) {
    areaState.draftCircle.setLatLng([
      Number(circle.center_lat),
      Number(circle.center_lng)
    ]);

    areaState.draftCircle.setRadius(
      Number(circle.radius) * 1000
    );
  }
}

export function getSelectedCircleLayer() {
  if (!areaState.selectedCircle) {
    return null;
  }

  return areaState.circleLayers.get(
    Number(areaState.selectedCircle.id)
  ) || null;
}

export function removeCircleLayer(circleId) {
  const layer =
    areaState.circleLayers.get(
      Number(circleId)
    );

  if (!layer) return;

  areaState.map?.removeLayer(layer);

  areaState.circleLayers.delete(
    Number(circleId)
  );
}

export function getCircleLayers() {
  return Array.from(
    areaState.circleLayers.values()
  );
}
