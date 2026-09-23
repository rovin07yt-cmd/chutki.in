import { areaState } from "./area/state.js";

import {
  initializeMap,
  onMapClick
} from "./area/map.js";

import {
  renderCircles
} from "./area/circles.js";

import {
  initEditor,
  showEditor,
  startEditing,
  closeEditor
} from "./area/editor.js";

import {
  initAreas,
  loadAreas
} from "./area/areas.js";

export async function render() {
  document.getElementById("pageTitle").textContent =
    "SERVICEABLE AREA";

  document.getElementById("content").innerHTML = `
    <section class="area-page">

      <div class="area-heading">
        <h2>Serviceable Area</h2>
        <p>Manage delivery areas and circles.</p>
      </div>

      <div class="area-map-section">

        <div id="areaMap" class="area-map"></div>

        <button
          id="addCircleBtn"
          class="map-add-circle">
          + ADD CIRCLE
        </button>

        <div
          id="mapMode"
          class="map-mode hidden">
        </div>

        <div
          id="circleEditor"
          class="circle-editor hidden">

          <div class="circle-editor-header">
            <div>
              <strong id="editorTitle">
                Circle
              </strong>

              <span id="editorStatus">
                Selected
              </span>
            </div>

            <button
              id="closeEditorBtn"
              class="icon-btn">
              ×
            </button>
          </div>

          <div class="circle-editor-body">

            <label>Radius</label>

            <div class="radius-input-row">
              <input
                id="radiusInput"
                type="number"
                min="0.1"
                max="100"
                step="0.1">

              <span>km</span>
            </div>

            <input
              id="radiusSlider"
              class="radius-slider"
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value="1">

            <div class="editor-coordinates">

              <div>
                <span>LATITUDE</span>
                <strong id="editorLat">—</strong>
              </div>

              <div>
                <span>LONGITUDE</span>
                <strong id="editorLng">—</strong>
              </div>

            </div>

            <div class="circle-editor-actions">

              <button
                id="editCircleBtn"
                class="area-btn primary">
                EDIT
              </button>

              <button
                id="saveCircleBtn"
                class="area-btn success hidden">
                SAVE
              </button>

              <button
                id="cancelCircleBtn"
                class="area-btn hidden">
                CANCEL
              </button>

              <button
                id="deleteCircleBtn"
                class="area-btn danger">
                DELETE
              </button>

            </div>

          </div>

        </div>

      </div>

      <div class="area-list-section">

        <div class="area-list-heading">

          <div>
            <h3>List of Areas</h3>
            <span id="areaCount">0</span>
          </div>

          <button
            id="createAreaBtn"
            class="area-btn primary">
            + ADD AREA
          </button>

        </div>

        <div
          id="areaList"
          class="area-list">
        </div>

      </div>

    </section>
  `;

  initializeMap();

  onMapClick(handleAddCircleClick);
  initEditor({
    onSaved: async () => {
      await refreshSelectedArea();
    },

    onDeleted: async () => {
      await refreshSelectedArea();
    },

    onCancelled: async () => {
      await refreshSelectedArea();
    }
  });

  initAreas({
    onAreaSelected: async area => {
      await displayArea(area);
    },

    onAreasChanged: async () => {
      await refreshSelectedArea();
    }
  });

  bindAddCircle();

  await loadAreas();
}

async function displayArea(area) {
  closeEditor();

  if (!area) {
    areaState.selectedAreaId = null;

    renderCircles([]);

    return;
  }

  areaState.selectedAreaId =
    Number(area.id);

  renderCircles(
    area.circles || [],
    () => {
      showEditor(areaState.selectedCircle);
    }
  );
}

async function refreshSelectedArea() {
  if (!areaState.selectedAreaId) {
    renderCircles([]);
    return;
  }

  const response =
    await apiGet(
      `/admin/serviceable-areas/${areaState.selectedAreaId}`
    );

  if (!response?.success) {
    console.error(
      "Unable to refresh area:",
      response?.message
    );

    return;
  }

  await displayArea(response.data);
}

function bindAddCircle() {
  document
    .getElementById("addCircleBtn")
    ?.addEventListener(
      "click",
      startAddCircle
    );
}

function startAddCircle() {
  if (!areaState.selectedAreaId) {
    alert("Select an area first.");
    return;
  }

  areaState.addingCircle = true;

  const mode =
    document.getElementById("mapMode");

  mode?.classList.remove("hidden");

  if (mode) {
    mode.textContent =
      "ADD CIRCLE — click on the map";
  }
}

function handleAddCircleClick(event) {
  if (!areaState.addingCircle) {
    return;
  }

  areaState.addingCircle = false;

  const mode =
    document.getElementById("mapMode");

  mode?.classList.add("hidden");

  const lat =
    event.latlng.lat;

  const lng =
    event.latlng.lng;

  createNewCircle(
    lat,
    lng
  );
}

function createNewCircle(
  latitude,
  longitude
) {
  if (!areaState.map) return;

  const radius = 1;

  const layer =
    L.circle(
      [latitude, longitude],
      {
        radius: radius * 1000,
        color: "#1565c0",
        fillColor: "#1565c0",
        fillOpacity: 0.18,
        weight: 2,
        dashArray: "7 6"
      }
    ).addTo(areaState.map);

  areaState.draftCircle =
    layer;

  areaState.selectedCircle = {
    id: null,
    areaId:
      areaState.selectedAreaId,

    center_lat:
      latitude,

    center_lng:
      longitude,

    radius,

    saved: false,

    layer
  };

  showEditor(
    areaState.selectedCircle
  );

  document
    .getElementById(
      "editCircleBtn"
    )
    ?.classList.add("hidden");

  document
    .getElementById(
      "deleteCircleBtn"
    )
    ?.classList.add("hidden");

  document
    .getElementById(
      "saveCircleBtn"
    )
    ?.classList.remove("hidden");

  document
    .getElementById(
      "cancelCircleBtn"
    )
    ?.classList.remove("hidden");

  startEditing();
}

