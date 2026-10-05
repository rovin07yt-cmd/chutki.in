session.requireRole("rider");

function toggleSidebar() {
  document.getElementById("sidebar")
    .classList.toggle("active");

  document.getElementById("overlay")
    .classList.toggle("active");
}

async function loadPage(page) {

  document.querySelectorAll(".menu-item").forEach(el => {
    el.classList.remove("active");
    if (el.dataset.page === page) {
      el.classList.add("active");
    }
  });

  document.getElementById("pageTitle")
    .innerText = page.toUpperCase();

  const content =
    document.getElementById("content");

  content.innerHTML = "Loading...";

  try {

    const module = await import(
      `./pages/${page}.js?v=${Date.now()}`
    );

    if (module.default) {
      await module.default(content);
    }

  } catch (err) {

    console.error(err);

    content.innerHTML =
      `<div>Failed to load page</div>`;
  }
  document.getElementById("sidebar")
    .classList.remove("active");

  document.getElementById("overlay")
    .classList.remove("active");

}

function logout() {
  localStorage.clear();
  window.location.href =
    "/auth/login.html";
}


async function loadSidebarProfile() {

  try {

    const res = await apiGet("/rider-profile");

    const name = document.querySelector(".restro-name");

    if (name) {
      name.innerText = res.data?.name || "Rider";
    }

    const img = document.getElementById("sidebarImg");

    if (img && res.data?.image) {
      img.src = imageUrl(res.data.image) + "?t=" + Date.now();
    }

  } catch(err) {
    console.error(err);
  }
}

window.onload = () => {

  startRiderLocationTracking();

  const toggle =
    document.getElementById("statusToggle");

  const statusText =
    document.getElementById("statusText");

  const refreshStatus = async () => {
    try {
      const res = await apiGet("/rider-status");
      const online = !!res.data.is_online;
      toggle.checked = online;
      statusText.innerText = online ? "ONLINE" : "OFFLINE";
      statusText.style.color = online ? "lightgreen" : "white";
    } catch(err){
      console.error(err);
    }
  };

  refreshStatus();

  toggle.addEventListener("change", async () => {

    try {

      await apiPost(
        "/rider-status/online",
        { is_online: toggle.checked }
      );

      statusText.innerText = toggle.checked
        ? "ONLINE"
        : "OFFLINE";

      statusText.style.color = toggle.checked
        ? "lightgreen"
        : "white";

    } catch(err){

      toggle.checked = !toggle.checked;
      alert(err.message || "Failed");

    }

  });

  loadSidebarProfile();
  loadPage("home");
};

window.toggleSidebar = toggleSidebar;
window.loadPage = loadPage;
window.logout = logout;


let lastUnreadCount = 0;

async function refreshNotifications(){

  try{

    const res =
      await apiGet(
        "/rider/notifications/unread-count"
      );

    const count =
      Number(
        res.data?.unread_count || 0
      );

      const bell =
        document.getElementById(
          "notificationBell"
        );

    if(bell){
      bell.innerText =
        `🔔 ${count}`;
    }

    lastUnreadCount = count;

  }catch(err){

    console.error(err);

  }

}

setInterval(
  refreshNotifications,
  5000
);

refreshNotifications();



/* ============================================================
   RIDER LIVE LOCATION
   Location tracking is independent of orders/Route page.
   ============================================================ */

let riderLocationWatchId = null;
let lastLocationSentAt = 0;

async function sendRiderLocation(position) {

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  try {

    const now = Date.now();

    if (now - lastLocationSentAt < 10000) {
      return;
    }

    lastLocationSentAt = now;

    const res = await apiPost(
      "/rider-location/update",
      {
        lat,
        lng
      }
    );

    if (
      res.data &&
      res.data.serviceable === false
    ) {

      const toggle =
        document.getElementById("statusToggle");

      const statusText =
        document.getElementById("statusText");

      if (toggle) {
        toggle.checked = false;
      }

      if (statusText) {
        statusText.innerText = "OFFLINE";
        statusText.style.color = "white";
      }
    }

  } catch (err) {

    console.error(
      "Rider location update failed:",
      err
    );
  }
}


function startRiderLocationTracking() {

  if (!navigator.geolocation) {

    console.warn(
      "Geolocation is not supported by this browser."
    );

    return;
  }

  if (riderLocationWatchId !== null) {
    return;
  }

  riderLocationWatchId =
    navigator.geolocation.watchPosition(
      sendRiderLocation,
      err => {

        console.warn(
          "Rider GPS error:",
          err.message
        );

      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );
}


function stopRiderLocationTracking() {

  if (
    riderLocationWatchId !== null &&
    navigator.geolocation
  ) {

    navigator.geolocation.clearWatch(
      riderLocationWatchId
    );

    riderLocationWatchId = null;
  }
}
