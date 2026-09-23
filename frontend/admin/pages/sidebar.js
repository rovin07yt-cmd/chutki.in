export function renderSidebar() {
  return `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-header">
          <img class="avatar-small" src="/assets/logo.png" alt="Admin">
          <div class="admin-name">Admin</div>
          <button class="sidebar-close" onclick="toggleSidebar()">←</button>
        </div>
      </div>

      <div class="sidebar-menu">
        <div class="menu-item active"
             data-page="dashboard"
             onclick="loadPage('dashboard')">
          🏠 Home
        </div>

        <div class="menu-item"
             data-page="requests"
             onclick="loadPage('requests')">
          📋 Requests
        </div>

        <div class="menu-item"
             data-page="wallet"
             onclick="loadPage('wallet')">
          💰 Wallet
        </div>

        <div class="menu-item"
             data-page="area"
             onclick="loadPage('area')">
          📍 Serviceable Area
        </div>

        <div class="menu-item"
             data-page="profile"
             onclick="loadPage('profile')">
          👤 Profile
        </div>

        <div class="menu-item logout"
             onclick="logout()">
          🚪 Logout
        </div>
      </div>
    </div>

    <div id="overlay" onclick="toggleSidebar()"></div>
  `;
}
