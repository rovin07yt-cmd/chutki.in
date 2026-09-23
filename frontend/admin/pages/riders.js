export async function render(targetId = "content") {
  const response = await apiGet("/admin/riders");

  if (!response.success) {
    showError(targetId, response.message || "Unable to load riders");
    return;
  }

  const riders = response.data || [];

  const online = riders.filter(r => r.is_online);
  const offline = riders.filter(r => !r.is_online);

  document.getElementById(targetId).innerHTML = `
    <div class="management-header">
      <div>
        <h2>Riders</h2>
        <p>Total: ${riders.length} · Online: ${online.length}</p>
      </div>
    </div>

    <div class="management-list">
      ${
        online.length
          ? online.map(riderCard).join("")
          : `<div class="empty-management">No online riders</div>`
      }

      ${
        offline.length
          ? offline.map(r => riderCard(r, true)).join("")
          : ""
      }
    </div>
  `;
}

function riderCard(r, offline = false) {
  return `
    <div class="management-row ${offline ? "offline-row" : ""}">
      <div class="row-main">
        <strong>${escapeHtml(r.name || "Unnamed")}</strong>
        <small>${escapeHtml(r.mobile || "")}</small>
        <small>Active items: ${Number(r.active_items || 0)}</small>
      </div>

      <div class="row-status">

        <span class="${offline ? "offline-status" : "online-status"}">
          ${offline ? "OFFLINE" : "ONLINE"}
        </span>

        <button onclick="openRiderDetails(${r.user_id})">
          VIEW
        </button>

        <button onclick="toggleRiderBlock(${r.user_id}, ${!!r.is_blocked})">
          ${r.is_blocked ? "UNBLOCK" : "BLOCK"}
        </button>

        <button
          class="danger-btn"
          onclick="deleteRider(${r.user_id})">
          DELETE
        </button>

      </div>
    </div>
  `;
}

window.openRiderDetails = async function(id) {
  const result = await apiGet(`/admin/riders/${id}`);

  if (!result.success) {
    alert(result.message || "Unable to load rider");
    return;
  }

  const p = result.data.profile || {};
  const stats = result.data.stats || {};
  const wallet = result.data.cod || {};

  alert(
    `Rider: ${p.name || ""}\n` +
    `Mobile: ${p.mobile || ""}\n` +
    `Total orders: ${stats.total_orders || 0}\n` +
    `Delivered: ${stats.delivered_orders || 0}\n` +
    `COD collected: ₹${wallet.cod_collected || 0}\n` +
    `COD submitted: ₹${wallet.cod_submitted || 0}`
  );
};

window.toggleRiderBlock = async function(id, blocked) {
  const endpoint = blocked
    ? "/admin/riders/unblock"
    : "/admin/riders/block";

  const result = await apiPost(endpoint, {
    user_id: id
  });

  if (!result.success) {
    alert(result.message || "Operation failed");
    return;
  }

  if (window.adminHomeMode && window.refreshHomeSection) {
    await window.refreshHomeSection();
  } else {
    await loadPage("riders");
  }
};

window.deleteRider = async function(id) {

  if (!confirm(
    "Delete this rider?\n\n" +
    "This uses the common Admin user deletion API.\n" +
    "The account and linked profile data may be permanently deleted."
  )) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/admin/users/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session.getUserId(),
          "x-role": session.getRole()
        }
      }
    );

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      console.error("Delete response:", text);
      alert(
        `Delete failed: server returned HTTP ${response.status}`
      );
      return;
    }

    if (!response.ok || !result.success) {
      alert(result.message || "Unable to delete rider");
      return;
    }

    alert("Rider deleted successfully.");

    if (window.adminHomeMode && window.refreshHomeSection) {
      await window.refreshHomeSection();
    } else {
      await loadPage("riders");
    }

  } catch (err) {
    console.error(err);
    alert("Delete failed: " + (err.message || "Network error"));
  }
};

function showError(targetId, message) {
  const element = document.getElementById(targetId);

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
