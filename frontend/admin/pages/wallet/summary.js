import { walletState } from "./state.js";
import { getAdminWalletSummary } from "./api.js";

export async function loadSummary() {
  const response = await getAdminWalletSummary();

  if (!response?.success) {
    throw new Error(response?.message || "Failed to load wallet summary");
  }

  walletState.summary = response.data || {
    total_cod_received: 0,
    total_commission: 0
  };

  renderSummary();
}

export function renderSummary() {
  const container = document.getElementById("walletSummary");

  if (!container) return;

  const {
    total_cod_received = 0,
    total_commission = 0
  } = walletState.summary;

  container.innerHTML = `
    <div class="wallet-summary-card">
      <div class="wallet-summary-label">TOTAL COD RECEIVED</div>
      <div class="wallet-summary-value">
        ₹${Number(total_cod_received).toFixed(2)}
      </div>
    </div>

    <div class="wallet-summary-card">
      <div class="wallet-summary-label">TOTAL COMMISSION</div>
      <div class="wallet-summary-value">
        ₹${Number(total_commission).toFixed(2)}
      </div>
    </div>
  `;
}
