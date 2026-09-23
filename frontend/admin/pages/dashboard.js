let dashboardState = {
  orders: [],
  riders: [],
  users: [],
  restaurants: [],
  foods: []
};

let currentSection = "orders";

export async function render() {
  window.adminHomeMode = true;

  document.getElementById("pageTitle").textContent = "ADMIN HOME";

  document.getElementById("content").innerHTML = `
    <section class="admin-home">

      <div class="home-heading">
        <strong>ADMIN HOME</strong>

        <button
          class="home-refresh-btn"
          onclick="refreshHome()">
          ↻ REFRESH
        </button>
      </div>

      <div class="home-nav">

        <button class="home-card active"
                data-section="orders"
                onclick="openHomeSection('orders')">
          <span>ORDERS</span>
          <b id="ordersCount">0</b>
        </button>

        <button class="home-card"
                data-section="riders"
                onclick="openHomeSection('riders')">
          <span>RIDERS</span>
          <b id="ridersCount">0</b>
        </button>

        <button class="home-card"
                data-section="users"
                onclick="openHomeSection('users')">
          <span>USERS</span>
          <b id="usersCount">0</b>
        </button>

        <button class="home-card"
                data-section="restaurants"
                onclick="openHomeSection('restaurants')">
          <span>RESTAURANTS</span>
          <b id="restaurantsCount">0</b>
        </button>

        <button class="home-card"
                data-section="food"
                onclick="openHomeSection('food')">
          <span>FOOD</span>
          <b id="foodsCount">0</b>
        </button>

      </div>

      <div id="homeSection" class="home-section">
        Loading orders...
      </div>

    </section>
  `;

  await loadDashboardData();
  updateCounts();
  await openHomeSection("orders");
}

async function loadDashboardData() {
  const [
    ordersJson,
    ridersJson,
    usersJson,
    restaurantsJson,
    foodsJson
  ] = await Promise.all([
    apiGet("/admin/orders"),
    apiGet("/admin/riders"),
    apiGet("/admin/users"),
    apiGet("/admin/restaurants"),
    apiGet("/admin/foods")
  ]);

  dashboardState.orders =
    ordersJson.success ? (ordersJson.data || []) : [];

  dashboardState.riders =
    ridersJson.success ? (ridersJson.data || []) : [];

  dashboardState.users =
    usersJson.success ? (usersJson.data || []) : [];

  dashboardState.restaurants =
    restaurantsJson.success ? (restaurantsJson.data || []) : [];

  dashboardState.foods =
    foodsJson.success ? (foodsJson.data || []) : [];
}

function updateCounts() {
  document.getElementById("ordersCount").textContent =
    dashboardState.orders.length;

  document.getElementById("ridersCount").textContent =
    dashboardState.riders.length;

  document.getElementById("usersCount").textContent =
    dashboardState.users.length;

  document.getElementById("restaurantsCount").textContent =
    dashboardState.restaurants.length;

  document.getElementById("foodsCount").textContent =
    dashboardState.foods.length;
}

window.openHomeSection = async function(type) {
  currentSection = type;

  document.querySelectorAll(".home-card").forEach(card => {
    card.classList.toggle(
      "active",
      card.dataset.section === type
    );
  });

  const homeSection =
    document.getElementById("homeSection");

  if (!homeSection) return;

  homeSection.innerHTML = `
    <div class="home-loading">
      Loading...
    </div>
  `;

  try {
    const pageMap = {
      orders: "orders",
      riders: "riders",
      users: "users",
      restaurants: "restaurants",
      food: "food"
    };

    const page = pageMap[type];

    if (!page) return;

    const module =
      await import(`./${page}.js`);

    if (typeof module.render !== "function") {
      throw new Error(
        `${page}.js does not export render()`
      );
    }

    await module.render("homeSection");

  } catch (err) {
    console.error(err);

    homeSection.innerHTML = `
      <div class="management-error">
        Unable to load ${escapeHtml(type)}.
        <br>
        <small>${escapeHtml(err.message)}</small>
      </div>
    `;
  }
};

window.refreshHome = async function() {
  const button =
    document.querySelector(".home-refresh-btn");

  if (button) {
    button.disabled = true;
    button.textContent = "↻ LOADING...";
  }

  try {
    await loadDashboardData();
    updateCounts();
    await openHomeSection(currentSection);
  } catch (err) {
    alert(err.message || "Refresh failed");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "↻ REFRESH";
    }
  }
};

window.refreshHomeSection = async function() {
  await openHomeSection(currentSection);
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
