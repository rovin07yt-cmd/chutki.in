export async function render(targetId = "content") {
  const response = await apiGet("/admin/users");

  if (!response.success) {
    showError(targetId, response.message || "Unable to load users");
    return;
  }

  const users = response.data || [];

  const online = users.filter(u => u.status === "online");
  const offline = users.filter(u => u.status !== "online");

  document.getElementById(targetId).innerHTML = `
    <div class="management-header">
      <div>
        <h2>Users</h2>
        <p>Total: ${users.length} · Online: ${online.length}</p>
      </div>
    </div>

    <div class="management-list">
      ${online.map(userCard).join("")}
      ${offline.map(u => userCard(u, true)).join("")}
    </div>
  `;
}

function userCard(u, offline = false) {
  return `
    <div class="management-row ${offline ? "offline-row" : ""}">
      <div class="row-main">
        <strong>${escapeHtml(u.name || "Unnamed")}</strong>
        <small>${escapeHtml(u.mobile || "")}</small>
        <small>${escapeHtml(u.gmail || "")}</small>
      </div>

      <div class="row-status">

        <span class="${offline ? "offline-status" : "online-status"}">
          ${offline ? "OFFLINE" : "ONLINE"}
        </span>

        <button onclick="toggleAdminUser(${u.id}, ${!!u.is_blocked})">
          ${u.is_blocked ? "UNBLOCK" : "BLOCK"}
        </button>

        <button
          class="danger-btn"
          onclick="deleteAdminUser(${u.id})">
          DELETE
        </button>

      </div>
    </div>
  `;
}

window.toggleAdminUser = async function(id, blocked) {
  const endpoint = blocked
    ? "/admin/users/unblock"
    : "/admin/users/block";

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
    await loadPage("users");
  }
};

window.deleteAdminUser = async function(id) {
  if (!confirm("Delete this user?\n\nThis action cannot be undone.")) {
    return;
  }

  const result = await apiDelete(`/admin/users/${id}`);

  if (!result.success) {
    alert(result.message || "Delete failed");
    return;
  }

  alert("User deleted successfully.");

  if (window.adminHomeMode && window.refreshHomeSection) {
    await window.refreshHomeSection();
  } else {
    await loadPage("users");
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
