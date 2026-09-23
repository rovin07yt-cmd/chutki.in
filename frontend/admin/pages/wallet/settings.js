import { walletState } from "./state.js";
import { getWalletSettings, updateWalletSettings } from "./api.js";

export async function loadWalletSettings() {
  const response = await getWalletSettings();

  if (!response?.success) {
    throw new Error(response?.message || "Failed to load wallet settings");
  }

  walletState.settings = response.data || {};
  renderWalletSettings();
}

export function renderWalletSettings() {
  const container = document.getElementById("walletSettings");

  if (!container) return;

  const settings = walletState.settings || {};

  container.innerHTML = `
    <div class="wallet-settings-card">

      <div class="wallet-settings-header">
        <div>
          <h3>Settings</h3>
          <p>Manage charges, commission and rider limits.</p>
        </div>
      </div>

      <div class="wallet-settings-grid">

        <div class="wallet-field">
          <label for="walletDeliveryCharge">Delivery charge</label>
          <input
            id="walletDeliveryCharge"
            type="number"
            min="0"
            step="0.01"
            value="${inputValue(settings.delivery_charge)}"
          >
        </div>

        <div class="wallet-field">
          <label for="walletAdminCommission">Admin commission (%)</label>
          <input
            id="walletAdminCommission"
            type="number"
            min="0"
            step="0.01"
            value="${inputValue(settings.admin_commission_percent)}"
          >
        </div>

        <div class="wallet-field">
          <label for="walletGST">GST (%)</label>
          <input
            id="walletGST"
            type="number"
            min="0"
            step="0.01"
            value="${inputValue(settings.gst_percent)}"
          >
        </div>

        <div class="wallet-field wallet-other-charge">
          <label>Other charge</label>

          <div class="wallet-inline-fields">
            <input
              id="walletOtherChargeName"
              type="text"
              placeholder="Charge name"
              value="${inputValue(settings.other_charge_name)}"
            >

            <input
              id="walletOtherChargePercent"
              type="number"
              min="0"
              step="0.01"
              placeholder="%"
              value="${inputValue(settings.other_charge_percent)}"
            >
          </div>
        </div>

      </div>

      <div class="wallet-settings-subtitle">
        Rider Settings
      </div>

      <div class="wallet-settings-grid">

        <div class="wallet-field">
          <label for="walletFuelPerKm">Fuel expense / km</label>
          <input
            id="walletFuelPerKm"
            type="number"
            min="0"
            step="0.01"
            value="${inputValue(settings.fuel_per_km)}"
          >
        </div>

        <div class="wallet-field">
          <label for="walletRiderCommission">Rider commission / order</label>
          <input
            id="walletRiderCommission"
            type="number"
            min="0"
            step="0.01"
            value="${inputValue(settings.rider_commission_per_order)}"
          >
        </div>

        <div class="wallet-field">
          <label for="walletMaxOrders">Max orders / rider</label>
          <input
            id="walletMaxOrders"
            type="number"
            min="1"
            step="1"
            value="${inputValue(settings.max_orders_per_rider)}"
          >
        </div>

        <div class="wallet-field">
          <label for="walletMaxItems">Max items / rider</label>
          <input
            id="walletMaxItems"
            type="number"
            min="1"
            step="1"
            value="${inputValue(settings.max_items_per_rider)}"
          >
        </div>

      </div>

      <div class="wallet-settings-footer">
        <span id="walletSettingsMessage" class="wallet-settings-message"></span>

        <button id="walletSaveSettings" class="wallet-save-settings-btn">
          Save Settings
        </button>
      </div>

    </div>
  `;

  document
    .getElementById("walletSaveSettings")
    ?.addEventListener("click", saveWalletSettings);
}

async function saveWalletSettings() {
  const button = document.getElementById("walletSaveSettings");
  const message = document.getElementById("walletSettingsMessage");

  const data = {
    delivery_charge: getNumber("walletDeliveryCharge"),
    admin_commission_percent: getNumber("walletAdminCommission"),
    gst_percent: getNumber("walletGST"),
    other_charge_name:
      document.getElementById("walletOtherChargeName")?.value.trim() || "",
    other_charge_percent: getNumber("walletOtherChargePercent"),
    place_orders_enabled: Boolean(walletState.settings?.place_orders_enabled),
    fuel_per_km: getNumber("walletFuelPerKm"),
    rider_commission_per_order: getNumber("walletRiderCommission"),
    max_orders_per_rider: getNumber("walletMaxOrders"),
    max_items_per_rider: getNumber("walletMaxItems")
  };

  const numericFields = [
    data.delivery_charge,
    data.admin_commission_percent,
    data.gst_percent,
    data.other_charge_percent,
    data.fuel_per_km,
    data.rider_commission_per_order,
    data.max_orders_per_rider,
    data.max_items_per_rider
  ];

  if (numericFields.some(value => !Number.isFinite(value) || value < 0)) {
    showSettingsMessage("Enter valid non-negative values.", true);
    return;
  }

  if (data.max_orders_per_rider < 1 || data.max_items_per_rider < 1) {
    showSettingsMessage("Rider limits must be at least 1.", true);
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "Saving...";
    showSettingsMessage("");

    const response = await updateWalletSettings(data);

    if (!response?.success) {
      throw new Error(response?.message || "Failed to save settings");
    }

    walletState.settings = response.data || data;

    showSettingsMessage("Settings saved successfully.", false);

    renderWalletSettings();

  } catch (error) {
    console.error("Wallet settings save error:", error);
    showSettingsMessage(
      error.message || "Failed to save settings.",
      true
    );
  }
}

function getNumber(id) {
  const value = document.getElementById(id)?.value;
  return Number(value);
}

function inputValue(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showSettingsMessage(message, error = false) {
  const element = document.getElementById("walletSettingsMessage");

  if (!element) return;

  element.textContent = message;
  element.classList.toggle("error", error);
}
