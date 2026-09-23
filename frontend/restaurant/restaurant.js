session.requireRole("restaurant");

// 🔹 GLOBAL STATE
let currentUser = null;

// 🔹 INIT
async function init() {
  await loadProfile();
  setupToggle();
  loadPage("home");
}

// 🔹 SIDEBAR
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// 🔹 LOGOUT
function logout() {
  session.logout();
}

// 🔹 PROFILE
async function loadProfile() {
  try {
    const res = await apiGet("/restaurant-profile");
    currentUser = res.data;

    const el = document.querySelector(".restro-name");
    if (el) el.innerText = currentUser.profile?.restaurant_name || "Restaurant";

    const img = document.getElementById("sidebarImg");
    if (img) {
      const url = currentUser.profile?.image
        ? (currentUser.profile.image.startsWith("http")
            ? currentUser.profile.image
            : "http://localhost:3000" + currentUser.profile.image)
        : "/assets/default.png";
      img.src = url + "?t=" + Date.now();
    }

    const toggle = document.getElementById("statusToggle");
    if (toggle) toggle.checked = currentUser.profile?.is_online || false;

    updateToggleText(toggle.checked);


  } catch (err) {
    console.error(err);
  }
}

// 🔹 TOGGLE
function setupToggle() {
  const toggle = document.getElementById("statusToggle");

  toggle.addEventListener("change", async () => {
    const isOnline = toggle.checked;
    updateToggleText(isOnline);


    try {
      await apiPost("/restaurant-control/toggle", {
        is_online: isOnline
      });
    } catch (err) {
      console.error(err);
    }
  });
}

// 🔹 TEXT
function updateToggleText(isOnline) {
  const el = document.getElementById("statusText");
  if (!el) return;
  el.style.color = isOnline ? "#4caf50" : "#aaa";
  el.innerText = isOnline ? "ONLINE" : "OFFLINE";
}

// 🔹 PAGE
async function loadPage(page) {
  document.querySelectorAll(".menu-item").forEach(el => {
    el.classList.remove("active");
    if (el.dataset.page === page) el.classList.add("active");
  });

  document.getElementById("pageTitle").innerText = page.toUpperCase();
  document.getElementById("content").innerHTML = "Loading...";

  try {
    const module = await import(`./pages/${page}.js`);
    module.render();
  } catch (err) {
    console.error(err);
    document.getElementById("content").innerHTML = "Page not found";
  }

  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

// 🔹 START
init();

// 🔥 GLOBAL
window.toggleSidebar = toggleSidebar;
window.loadPage = loadPage;
window.logout = logout;
