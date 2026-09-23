export async function render(targetId = "content") {
  const response = await apiGet("/admin/restaurants");

  if (!response.success) {
    showError(
      targetId,
      response.message || "Unable to load restaurants"
    );
    return;
  }

  const restaurants = response.data || [];

  const online = restaurants.filter(
    r => r.is_online && r.is_approved
  );

  const offline = restaurants.filter(
    r => !(r.is_online && r.is_approved)
  );

  document.getElementById(targetId).innerHTML = `
    <div class="management-header">
      <div>
        <h2>Restaurants</h2>
        <p>
          Total: ${restaurants.length}
          · Online: ${online.length}
        </p>
      </div>
    </div>

    <div class="management-list">
      ${online.map(r => restaurantCard(r, false)).join("")}
      ${offline.map(r => restaurantCard(r, true)).join("")}
    </div>
  `;
}

function restaurantCard(r, offline = false) {
  const pendingApproval = !r.is_approved;

  let statusText = "ONLINE";

  if (pendingApproval) {
    statusText = "APPROVAL PENDING";
  } else if (!r.is_online) {
    statusText = "OFFLINE";
  }

  return `
    <div class="management-row ${offline ? "offline-row" : ""}">

      <div class="row-main">
        <strong>
          ${escapeHtml(r.restaurant_name || "Unnamed")}
        </strong>

        <small>
          ${escapeHtml(r.owner_name || "")}
        </small>

        <small>
          ${escapeHtml(r.restaurant_mobile || "")}
        </small>
      </div>

      <div class="row-status">

        <span class="${offline ? "offline-status" : "online-status"}">
          ${statusText}
        </span>

        <button
          onclick="openRestaurantDetails(${r.user_id})">
          VIEW
        </button>

        <button
          onclick="toggleRestaurantBlock(
            ${r.user_id},
            ${!!r.is_blocked}
          )">
          ${r.is_blocked ? "UNBLOCK" : "BLOCK"}
        </button>

        <button
          class="danger-btn"
          onclick="deleteAdminRestaurant(${r.user_id})">
          DELETE
        </button>

      </div>
    </div>
  `;
}

window.openRestaurantDetails = async function(id) {
  const result =
    await apiGet(`/admin/restaurants/${id}`);

  if (!result.success) {
    alert(
      result.message ||
      "Unable to load restaurant"
    );
    return;
  }

  const p = result.data.profile || {};
  const stats = result.data.stats || {};
  const earnings = result.data.earnings || {};

  alert(
    `Restaurant: ${p.restaurant_name || ""}\n` +
    `Owner: ${p.owner_name || ""}\n` +
    `Total orders: ${stats.total_orders || 0}\n` +
    `Active orders: ${stats.active_orders || 0}\n` +
    `Today orders: ${stats.today_orders || 0}\n` +
    `Total earned: ₹${earnings.total_earned || 0}`
  );
};

window.toggleRestaurantBlock = async function(id, blocked) {
  const endpoint = blocked
    ? "/admin/restaurants/unblock"
    : "/admin/restaurants/block";

  const result = await apiPost(endpoint, {
    user_id: id
  });

  if (!result.success) {
    alert(
      result.message ||
      "Operation failed"
    );
    return;
  }

  if (
    window.adminHomeMode &&
    window.refreshHomeSection
  ) {
    await window.refreshHomeSection();
  } else {
    await loadPage("restaurants");
  }
};

window.deleteAdminRestaurant = async function(id) {
  if (!confirm(
    "Delete this restaurant?\n\n" +
    "This uses the common Admin user deletion API.\n" +
    "The restaurant account and linked profile data may be permanently deleted.\n\n" +
    "Continue?"
  )) {
    return;
  }

  const result =
    await apiDelete(`/admin/users/${id}`);

  if (!result.success) {
    alert(
      result.message ||
      "Unable to delete restaurant"
    );
    return;
  }

  alert("Restaurant deleted successfully.");

  if (
    window.adminHomeMode &&
    window.refreshHomeSection
  ) {
    await window.refreshHomeSection();
  } else {
    await loadPage("restaurants");
  }
};

function showError(targetId, message) {
  const element =
    document.getElementById(targetId);

  if (!element) return;

  element.innerHTML = `
    <div class="management-error">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
