function requireUserLogin(action) {
  if (window.session && window.session.isLoggedIn()) {
    return true;
  }

  const message = action
    ? `Please log in first to ${action}, or register if you don't have an account.`
    : "Please log in first, or register if you don't have an account.";

  alert(message);
  window.location.href = "/auth/login.html";
  return false;
}

function toggleSidebar(){
document.getElementById("sidebar").classList.toggle("active");
document.getElementById("overlay").classList.toggle("active");
}

function logout() {
  localStorage.clear();
  window.location.href = "/auth/login.html";
}

async function loadPage(page) {
  document.getElementById("pageTitle").innerText = page.toUpperCase();

  document.querySelectorAll(".sidebar-menu .menu-item")
    .forEach(el => el.classList.remove("active"));

  const active = document.querySelector(`.sidebar-menu .menu-item[onclick="loadPage('${page}')"]`);

  if (active) active.classList.add("active");

  const module = await import(`./pages/${page}.js`);
  module.render();

  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

async function userPresenceHeartbeat() {
  try {
    await apiGet("/user/profile");
  } catch (err) {
    console.error("USER PRESENCE ERROR:", err.message);
  }
}

userPresenceHeartbeat();
setInterval(userPresenceHeartbeat, 30000);

loadPage("home");
