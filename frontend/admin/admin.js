import { renderSidebar } from "./pages/sidebar.js";

const pageStyles = {
  dashboard: "styles/dashboard.css",
  orders: "styles/orders.css",
  riders: "styles/riders.css",
  users: "styles/users.css",
  restaurants: "styles/restaurants.css",
  food: "styles/food.css",
  wallet: "styles/wallet.css",
  area: "styles/area.css",
  profile: "styles/profile.css",
  requests: "styles/requests.css"
};

function loadPageStyle(page) {
  const id = "admin-page-style";

  document.getElementById(id)?.remove();

  const href = pageStyles[page];

  if (!href) return;

  const link = document.createElement("link");

  link.id = id;
  link.rel = "stylesheet";
  link.href = href;

  document.head.appendChild(link);
}

function toggleSidebar() {
  document
    .getElementById("sidebar")
    .classList.toggle("active");

  document
    .getElementById("overlay")
    .classList.toggle("active");
}

function logout() {
  session.logout();
}

async function loadPage(page) {

  /*
   * Any sidebar page is a full page.
   * Therefore Home embedded mode must be disabled.
   */
  window.adminHomeMode = page === "dashboard";

  document
    .querySelectorAll(".menu-item")
    .forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.page === page
      );
    });

  document
    .getElementById("sidebar")
    .classList.remove("active");

  document
    .getElementById("overlay")
    .classList.remove("active");

  loadPageStyle(page);

  document.getElementById("pageTitle").innerText =
    page === "dashboard"
      ? "ADMIN HOME"
      : page.toUpperCase();

  try {

    const module =
      await import(`./pages/${page}.js`);

    if (typeof module.render !== "function") {
      throw new Error(
        `${page}.js does not export render()`
      );
    }

    await module.render();

  } catch (err) {

    console.error("Admin page error:", err);

    document.getElementById("content").innerHTML = `
      <div class="admin-error">
        <h3>Unable to load page</h3>
        <p>${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {

  session.requireRole("admin");

  document.getElementById(
    "sidebar-container"
  ).innerHTML = renderSidebar();

  window.toggleSidebar = toggleSidebar;
  window.logout = logout;
  window.loadPage = loadPage;

  loadPage("dashboard");
});
