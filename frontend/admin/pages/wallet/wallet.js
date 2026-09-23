import { walletState, resetWalletState } from "./state.js";
import { loadWalletSettings } from "./settings.js";
import { loadRestaurants } from "./restaurants.js";
import { loadRiders } from "./riders.js";

export async function render() {
  document.getElementById("pageTitle").textContent = "WALLET";

  document.getElementById("content").innerHTML = `
    <div id="walletPageRoot"></div>
  `;

  if (!window.__walletBackListener) {
    document.addEventListener("wallet:show-main", event => {
      loadWallet(event.detail?.tab || "riders");
    });

    window.__walletBackListener = true;
  }

  await loadWallet("settings");
}

async function loadWallet(defaultTab = "settings") {
  const root = document.getElementById("walletPageRoot");

  if (!root) return;

  try {
    walletState.loading = true;
    resetWalletState();

    renderMainView(defaultTab);

    await Promise.all([
      loadWalletSettings(),
      loadRestaurants(),
      loadRiders()
    ]);

    updateCounts();

  } catch (error) {
    console.error("Wallet load error:", error);

    root.insertAdjacentHTML(
      "beforeend",
      `
        <div class="wallet-error">
          ${escapeHtml(
            error.message || "Failed to load wallet"
          )}
        </div>
      `
    );

  } finally {
    walletState.loading = false;
  }
}

function renderMainView(activeTab = "settings") {
  const root = document.getElementById("walletPageRoot");

  if (!root) return;

  root.innerHTML = `
    <div class="wallet-page">

      <div class="wallet-topbar">
        <h2>Wallet</h2>

        <button
          id="walletRefresh"
          class="wallet-refresh-btn"
          type="button"
        >
          Refresh
        </button>
      </div>

      <div class="wallet-tabs">

        <button
          class="wallet-tab"
          data-wallet-tab="settings"
        >
          Settings
        </button>

        <button
          class="wallet-tab"
          data-wallet-tab="riders"
        >
          Rider
        </button>

        <button
          class="wallet-tab"
          data-wallet-tab="restaurants"
        >
          Restaurant
        </button>

      </div>

      <section
        id="walletSettingsSection"
        class="wallet-tab-section"
      >
        <div id="walletSettings"></div>
      </section>

      <section
        id="riderWalletSection"
        class="wallet-tab-section"
      >
        <div class="wallet-section-header">

          <div>
            <h3>Riders</h3>
            <p>Manage rider salary and COD</p>
          </div>

          <span
            id="riderWalletCount"
            class="wallet-count"
          >
            0
          </span>

        </div>

        <div id="riderWalletList"></div>

      </section>

      <section
        id="restaurantWalletSection"
        class="wallet-tab-section"
      >
        <div class="wallet-section-header">

          <div>
            <h3>Restaurants</h3>
            <p>Manage restaurant earnings and payments</p>
          </div>

          <span
            id="restaurantWalletCount"
            class="wallet-count"
          >
            0
          </span>

        </div>

        <div id="restaurantWalletList"></div>

      </section>

    </div>
  `;

  bindTabs();
  bindRefresh();
  setActiveTab(activeTab);
}

function bindTabs() {
  document
    .querySelectorAll("[data-wallet-tab]")
    .forEach(button => {
      button.addEventListener("click", () => {
        setActiveTab(button.dataset.walletTab);
      });
    });
}

function setActiveTab(tab) {
  walletState.activeType = tab;

  document
    .querySelectorAll("[data-wallet-tab]")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.walletTab === tab
      );
    });

  document
    .querySelectorAll(".wallet-tab-section")
    .forEach(section => {
      section.classList.remove("active");
    });

  const section =
    document.getElementById(
      tab === "settings"
        ? "walletSettingsSection"
        : tab === "riders"
          ? "riderWalletSection"
          : "restaurantWalletSection"
    );

  section?.classList.add("active");
}

function bindRefresh() {
  document
    .getElementById("walletRefresh")
    ?.addEventListener("click", () => {
      loadWallet(walletState.activeType || "settings");
    });
}

function updateCounts() {
  const restaurantCount =
    document.getElementById("restaurantWalletCount");

  const riderCount =
    document.getElementById("riderWalletCount");

  if (restaurantCount) {
    restaurantCount.textContent =
      walletState.restaurants.length;
  }

  if (riderCount) {
    riderCount.textContent =
      walletState.riders.length;
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
