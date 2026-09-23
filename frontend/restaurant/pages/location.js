let map;
let marker;
let selectedLat = null;
let selectedLng = null;

export async function render() {

  document.getElementById("content").innerHTML = `
    <div class="location-page">

      <div class="location-title">
        Want to change pick-up location of your restaurant?
      </div>

      <div id="map"></div>

      <div class="location-info" id="locationInfo">
        Tap on map to select location
      </div>

      <div class="location-actions">
        <button class="btn-save-location" onclick="saveLocation()">
          Save Location
        </button>
      </div>

    </div>
  `;

  setTimeout(initMap, 100);
}

// 🔹 INIT MAP
async function initMap() {

  let lat = 28.81;
  let lng = 78.78;

  try {
    const res = await apiGet("/restaurant-control/location");

    if (res.data && res.data.lat && res.data.lng) {
      lat = res.data.lat;
      lng = res.data.lng;
    }

  } catch (err) {
    console.error(err);
  }

  map = L.map('map').setView([lat, lng], 15);
  setTimeout(() => map.invalidateSize(), 500);
  setTimeout(() => map.invalidateSize(), 200);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  marker = L.marker([lat, lng]).addTo(map);

  selectedLat = lat;
  selectedLng = lng;

  updateInfo();

  map.on('click', function (e) {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    marker.setLatLng(e.latlng);

    updateInfo();
  });
}

// 🔹 UPDATE INFO
function updateInfo() {
  document.getElementById("locationInfo").innerText =
    `Lat: ${selectedLat.toFixed(5)} | Lng: ${selectedLng.toFixed(5)}`;
}

// 🔹 SAVE
window.saveLocation = async function () {

  if (!selectedLat || !selectedLng) return;

  const ok = confirm("Save this location?");
  if (!ok) return;

  try {
    await apiPost("/restaurant-control/location", {
      lat: selectedLat,
      lng: selectedLng
    });

    alert("Location saved");

  } catch (err) {
    console.error(err);
    alert("Error saving location");
  }
};
