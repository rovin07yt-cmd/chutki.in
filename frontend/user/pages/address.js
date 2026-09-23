let map;
let marker;
let selectedLat = null;
let selectedLng = null;

export async function render() {

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="address-card">

      <div class="address-map" id="map"
        style="height:300px;border-radius:12px;margin-bottom:10px;">
      </div>

      <div id="locationInfo" class="location-info" style="margin-bottom:10px;">
        Tap map to select location
      </div>

<div class="address-form">
      <input class="address-input" id="label" placeholder="Home / Office / Other">

      <button class="address-save-btn" id="addBtn">Save Address</button>
</div>

      <hr>

      <div id="addressList">Loading...</div>

    </div>
  `;

  document
    .getElementById("addBtn")
    .addEventListener("click", addAddress);

  setTimeout(initMap, 100);

  await loadAddresses();
}

async function initMap() {

  let lat = 28.6139;
  let lng = 77.2090;

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(
      pos => {
        createMap(
          pos.coords.latitude,
          pos.coords.longitude
        );
      },
      () => createMap(lat, lng)
    );

  } else {
    createMap(lat, lng);
  }
}

function createMap(lat, lng) {

  map = L.map("map").setView([lat, lng], 15);

  setTimeout(() => map.invalidateSize(), 300);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap"
    }
  ).addTo(map);

  marker = L.marker([lat, lng]).addTo(map);

  selectedLat = lat;
  selectedLng = lng;

  updateInfo();

  map.on("click", e => {

    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    marker.setLatLng(e.latlng);

    updateInfo();
  });
}

function updateInfo() {

  document.getElementById("locationInfo").innerText =
    `Lat: ${selectedLat.toFixed(5)} | Lng: ${selectedLng.toFixed(5)}`;
}

async function loadAddresses() {

  const box = document.getElementById("addressList");

  const res = await apiGet("/address/my");

  if (!res.success) {
    box.innerHTML = "Failed to load addresses";
    return;
  }

  if (!res.data.length) {
    box.innerHTML = "No addresses found";
    return;
  }

  box.innerHTML = `<div class="address-list">` + res.data.map(a => `
    <div class="address-item ${localStorage.getItem("selected_address_id") == a.id ? "address-selected" : ""}" data-address-id="${a.id}" data-label="${a.label || "Address"}">
      <div class="address-label">📍 ${a.label || "Address"}</div>
      <div class="address-coords">
        Lat: ${Number(a.latitude).toFixed(5)}<br>
        Lng: ${Number(a.longitude).toFixed(5)}
      </div>
      <div class="address-actions">
        <button class="address-select" onclick="selectAddress(${a.id})">Select</button>
        <button class="address-delete" onclick="deleteAddress(${a.id})">Delete</button>
      </div>
    </div>
  `).join("") + `</div>`;
}

async function addAddress() {

  const label =
    document.getElementById("label").value.trim();

  if (selectedLat === null || selectedLng === null) {
    alert("Select location on map");
    return;
  }

  const res = await apiPost(
    "/address/add",
    {
      latitude: selectedLat,
      longitude: selectedLng,
      label
    }
  );

  if (!res.success) {
    alert(res.message);
    return;
  }

  document.getElementById("label").value = "";

  await loadAddresses();

  alert("Address saved");
}

window.selectAddress = function(id) {
  localStorage.setItem("selected_address_id", id);

  const el = document.querySelector(`[data-address-id="${id}"]`);

  if (el) {
    localStorage.setItem("selected_address_label", el.dataset.label);
  }

  loadPage("cart");
};

window.deleteAddress = async function(id) {

  const res = await apiPost(
    "/address/delete",
    { id }
  );

  if (!res.success) {
    alert(res.message);
    return;
  }

  await loadAddresses();
};
