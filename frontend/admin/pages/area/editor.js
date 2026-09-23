import { areaState } from "./state.js";
import {
  createCircle,
  updateCircle,
  deleteCircle
} from "./api.js";
import {
  updateSelectedCircleLayer,
  highlightSelectedCircle
} from "./circles.js";

const MIN_RADIUS_KM = 0.1;
const MAX_RADIUS_KM = 100;
const DEFAULT_RADIUS_KM = 1;

let onSavedCallback = null;
let onDeletedCallback = null;
let onCancelledCallback = null;

export function initEditor(options = {}) {
  onSavedCallback =
    options.onSaved || null;

  onDeletedCallback =
    options.onDeleted || null;

  onCancelledCallback =
    options.onCancelled || null;

  bindEditorEvents();
}

function bindEditorEvents() {
  const editButton =
    document.getElementById(
      "editCircleBtn"
    );

  const saveButton =
    document.getElementById(
      "saveCircleBtn"
    );

  const cancelButton =
    document.getElementById(
      "cancelCircleBtn"
    );

  const deleteButton =
    document.getElementById(
      "deleteCircleBtn"
    );

  const closeButton =
    document.getElementById(
      "closeEditorBtn"
    );

  const radiusInput =
    document.getElementById(
      "radiusInput"
    );

  const radiusSlider =
    document.getElementById(
      "radiusSlider"
    );

  editButton?.addEventListener(
    "click",
    startEditing
  );

  saveButton?.addEventListener(
    "click",
    saveSelectedCircle
  );

  cancelButton?.addEventListener(
    "click",
    cancelEditing
  );

  deleteButton?.addEventListener(
    "click",
    deleteSelectedCircle
  );

  closeButton?.addEventListener(
    "click",
    closeEditor
  );

  radiusInput?.addEventListener(
    "input",
    handleRadiusInput
  );

  radiusSlider?.addEventListener(
    "input",
    handleRadiusSlider
  );
}

export function showEditor(circleData) {
  if (!circleData) return;

  const editor =
    document.getElementById(
      "circleEditor"
    );

  if (!editor) return;

  editor.classList.remove("hidden");

  setEditorValues(circleData);
  setEditorMode(false);
}

export function hideEditor() {
  document
    .getElementById("circleEditor")
    ?.classList.add("hidden");
}

function setEditorValues(circle) {
  const title =
    document.getElementById(
      "editorTitle"
    );

  const status =
    document.getElementById(
      "editorStatus"
    );

  const radiusInput =
    document.getElementById(
      "radiusInput"
    );

  const radiusSlider =
    document.getElementById(
      "radiusSlider"
    );

  const lat =
    document.getElementById(
      "editorLat"
    );

  const lng =
    document.getElementById(
      "editorLng"
    );

  if (title) {
    title.textContent =
      circle.saved
        ? `Circle #${circle.id}`
        : "New Circle";
  }

  if (status) {
    status.textContent =
      areaState.editingCircle
        ? "Editing"
        : "Selected";
  }

  if (radiusInput) {
    radiusInput.value =
      Number(circle.radius).toFixed(1);
  }

  if (radiusSlider) {
    radiusSlider.value =
      clampRadius(circle.radius);
  }

  if (lat) {
    lat.textContent =
      Number(circle.center_lat)
        .toFixed(6);
  }

  if (lng) {
    lng.textContent =
      Number(circle.center_lng)
        .toFixed(6);
  }
}

function setEditorMode(editing) {
  areaState.editingCircle =
    Boolean(editing);

  const editButton =
    document.getElementById(
      "editCircleBtn"
    );

  const saveButton =
    document.getElementById(
      "saveCircleBtn"
    );

  const cancelButton =
    document.getElementById(
      "cancelCircleBtn"
    );

  const deleteButton =
    document.getElementById(
      "deleteCircleBtn"
    );

  const status =
    document.getElementById(
      "editorStatus"
    );

  if (editing) {
    editButton?.classList.add("hidden");
    saveButton?.classList.remove("hidden");
    cancelButton?.classList.remove("hidden");

    if (areaState.selectedCircle?.saved) {
      deleteButton?.classList.add("hidden");
    }

    if (status) {
      status.textContent = "Editing";
    }

    createEditHandles();

  } else {
    editButton?.classList.remove("hidden");
    saveButton?.classList.add("hidden");
    cancelButton?.classList.add("hidden");

    if (areaState.selectedCircle?.saved) {
      deleteButton?.classList.remove("hidden");
    }

    if (status) {
      status.textContent = "Selected";
    }

    removeEditHandles();

  if (areaState.draftCircle) {
    areaState.map?.removeLayer(areaState.draftCircle);
    areaState.draftCircle = null;
  }
  }
}

export function startEditing() {
  if (!areaState.selectedCircle) {
    return;
  }

  setEditorMode(true);
}

function createEditHandles() {
  removeEditHandles();

  if (areaState.draftCircle) {
    areaState.map?.removeLayer(areaState.draftCircle);
    areaState.draftCircle = null;
  }

  const circle =
    areaState.selectedCircle;

  if (!circle || !areaState.map) {
    return;
  }

  const center = [
    Number(circle.center_lat),
    Number(circle.center_lng)
  ];

  areaState.centerMarker =
    L.marker(center, {
      draggable: true,
      zIndexOffset: 1000,
      icon: createHandleIcon("center")
    }).addTo(areaState.map);

  areaState.centerMarker.on(
    "drag",
    event => {
      const position =
        event.target.getLatLng();

      circle.center_lat =
        position.lat;

      circle.center_lng =
        position.lng;

      updateSelectedCircleLayer();

      positionRadiusHandle();

      setEditorValues(circle);
    }
  );

  areaState.radiusHandle =
    L.marker(
      getRadiusHandlePosition(),
      {
        draggable: true,
        zIndexOffset: 1100,
        icon: createHandleIcon("radius")
      }
    ).addTo(areaState.map);

  areaState.radiusHandle.on(
    "drag",
    event => {
      const position =
        event.target.getLatLng();

      const center =
        L.latLng(
          circle.center_lat,
          circle.center_lng
        );

      let meters =
        center.distanceTo(position);

      meters =
        Math.max(
          MIN_RADIUS_KM * 1000,
          Math.min(
            MAX_RADIUS_KM * 1000,
            meters
          )
        );

      circle.radius =
        meters / 1000;

      updateSelectedCircleLayer();

      setEditorValues(circle);
    }
  );
}

function createHandleIcon(type) {
  const className =
    type === "center"
      ? "map-center-handle"
      : "map-radius-handle";

  return L.divIcon({
    className:
      "custom-map-handle",

    html:
      `<div class="${className}"></div>`,

    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function getRadiusHandlePosition() {
  const circle =
    areaState.selectedCircle;

  const center =
    L.latLng(
      circle.center_lat,
      circle.center_lng
    );

  return destinationPoint(
    center.lat,
    center.lng,
    Number(circle.radius) * 1000,
    0
  );
}

function positionRadiusHandle() {
  if (!areaState.radiusHandle) {
    return;
  }

  areaState.radiusHandle.setLatLng(
    getRadiusHandlePosition()
  );
}

function destinationPoint(
  lat,
  lng,
  distanceMeters,
  bearingDegrees
) {
  const R = 6371000;

  const bearing =
    bearingDegrees *
    Math.PI /
    180;

  const lat1 =
    lat *
    Math.PI /
    180;

  const lng1 =
    lng *
    Math.PI /
    180;

  const angularDistance =
    distanceMeters / R;

  const lat2 =
    Math.asin(
      Math.sin(lat1) *
        Math.cos(angularDistance) +
      Math.cos(lat1) *
        Math.sin(angularDistance) *
        Math.cos(bearing)
    );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) *
        Math.sin(angularDistance) *
        Math.cos(lat1),

      Math.cos(angularDistance) -
        Math.sin(lat1) *
        Math.sin(lat2)
    );

  return [
    lat2 * 180 / Math.PI,
    lng2 * 180 / Math.PI
  ];
}

function handleRadiusInput(event) {
  if (!areaState.editingCircle) {
    return;
  }

  let value =
    Number(event.target.value);

  if (!Number.isFinite(value)) {
    return;
  }

  value =
    clampRadius(value);

  areaState.selectedCircle.radius =
    value;

  syncRadiusControls();

  updateSelectedCircleLayer();
  positionRadiusHandle();

  setEditorValues(
    areaState.selectedCircle
  );
}

function handleRadiusSlider(event) {
  if (!areaState.editingCircle) {
    return;
  }

  const value =
    clampRadius(
      Number(event.target.value)
    );

  areaState.selectedCircle.radius =
    value;

  syncRadiusControls();

  updateSelectedCircleLayer();
  positionRadiusHandle();

  setEditorValues(
    areaState.selectedCircle
  );
}

function syncRadiusControls() {
  const circle =
    areaState.selectedCircle;

  if (!circle) return;

  const input =
    document.getElementById(
      "radiusInput"
    );

  const slider =
    document.getElementById(
      "radiusSlider"
    );

  if (input) {
    input.value =
      Number(circle.radius)
        .toFixed(1);
  }

  if (slider) {
    slider.value =
      clampRadius(circle.radius);
  }
}

function clampRadius(value) {
  return Math.max(
    MIN_RADIUS_KM,
    Math.min(
      MAX_RADIUS_KM,
      Number(value)
    )
  );
}

export async function saveSelectedCircle() {
  const circle =
    areaState.selectedCircle;

  if (!circle ||
      !areaState.editingCircle) {
    return;
  }

  const payload = {
    center_lat:
      Number(circle.center_lat),

    center_lng:
      Number(circle.center_lng),

    radius:
      Number(circle.radius)
  };

  if (
    !Number.isFinite(payload.center_lat) ||
    !Number.isFinite(payload.center_lng) ||
    !Number.isFinite(payload.radius)
  ) {
    alert(
      "Circle values are invalid."
    );
    return;
  }

  if (
    payload.center_lat < -90 ||
    payload.center_lat > 90
  ) {
    alert(
      "Latitude must be between -90 and 90."
    );
    return;
  }

  if (
    payload.center_lng < -180 ||
    payload.center_lng > 180
  ) {
    alert(
      "Longitude must be between -180 and 180."
    );
    return;
  }

  if (
    payload.radius <= 0
  ) {
    alert(
      "Radius must be greater than 0."
    );
    return;
  }

  let response;

  try {
    if (circle.saved) {
      response =
        await updateCircle(
          circle.id,
          payload
        );
    } else {
      response =
        await createCircle(
          areaState.selectedAreaId,
          payload
        );
    }
  } catch (error) {
    console.error(
      "Circle save error:",
      error
    );

    alert(
      error.message ||
      "Unable to save circle."
    );

    return;
  }

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to save circle."
    );

    return;
  }

  setEditorMode(false);

  if (typeof onSavedCallback === "function") {
    await onSavedCallback(
      response.data
    );
  }
}

export async function deleteSelectedCircle() {
  const circle =
    areaState.selectedCircle;

  if (!circle?.saved) {
    return;
  }

  if (
    !confirm(
      `Delete Circle #${circle.id}?`
    )
  ) {
    return;
  }

  let response;

  try {
    response =
      await deleteCircle(
        circle.id
      );
  } catch (error) {
    console.error(
      "Circle delete error:",
      error
    );

    alert(
      error.message ||
      "Unable to delete circle."
    );

    return;
  }

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to delete circle."
    );

    return;
  }

  setEditorMode(false);

  if (typeof onDeletedCallback === "function") {
    await onDeletedCallback(
      circle.id
    );
  }
}

export function cancelEditing() {
  if (!areaState.selectedCircle) {
    return;
  }

  if (!areaState.selectedCircle.saved) {
    closeEditor();

    if (typeof onCancelledCallback === "function") {
      onCancelledCallback();
    }

    return;
  }

  setEditorMode(false);

  if (typeof onCancelledCallback === "function") {
    onCancelledCallback();
  }
}

export function closeEditor() {
  removeEditHandles();

  if (areaState.draftCircle) {
    areaState.map?.removeLayer(areaState.draftCircle);
    areaState.draftCircle = null;
  }

  areaState.selectedCircle = null;
  areaState.editingCircle = false;

  hideEditor();

  highlightSelectedCircle();
}

function removeEditHandles() {
  if (areaState.centerMarker) {
    areaState.map?.removeLayer(
      areaState.centerMarker
    );

    areaState.centerMarker = null;
  }

  if (areaState.radiusHandle) {
    areaState.map?.removeLayer(
      areaState.radiusHandle
    );

    areaState.radiusHandle = null;
  }
}
