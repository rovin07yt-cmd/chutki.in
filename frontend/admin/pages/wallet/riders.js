import { walletState } from "./state.js";
import { getRiderWallets, getWalletImageUrl } from "./api.js";
import { openRiderDetail } from "./rider-detail.js";

export async function loadRiders() {
  const response = await getRiderWallets();

  if (!response?.success) {
    throw new Error(
      response?.message || "Failed to load rider wallets"
    );
  }

  walletState.riders = response.data || [];

  renderRiders();
}

export function renderRiders() {
  const container =
    document.getElementById("riderWalletList");

  if (!container) return;

  if (!walletState.riders.length) {
    container.innerHTML = `
      <div class="wallet-empty">
        No rider wallet records found.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="wallet-person-grid">

      ${walletState.riders.map(rider => `

        <article class="wallet-person-card">

          <div class="wallet-card-top">

            ${
              rider.image
                ? `<img
                    class="wallet-card-image"
                    src="${escapeHtml(getWalletImageUrl(rider.image))}"
                    alt=""
                  >`
                : `<div class="wallet-card-avatar">
                    R
                  </div>`
            }

            <div class="wallet-card-identity">

              <h4>
                ${escapeHtml(rider.name || "Rider")}
              </h4>

              <p>
                ${escapeHtml(rider.mobile || "-")}
              </p>

            </div>

          </div>


          <div class="wallet-card-balances">

            <div class="wallet-card-balance">

              <span>
                Pending Salary
              </span>

              <strong>
                ₹${Number(
                  rider.pending_salary || 0
                ).toFixed(2)}
              </strong>

            </div>


            <div class="wallet-card-balance">

              <span>
                Pending COD
              </span>

              <strong>
                ₹${Number(
                  rider.pending_cod || 0
                ).toFixed(2)}
              </strong>

            </div>

          </div>


          <button
            class="wallet-card-detail-btn"
            type="button"
            data-rider-id="${escapeHtml(rider.user_id)}"
          >
            Details
          </button>

        </article>

      `).join("")}

    </div>
  `;

  container
    .querySelectorAll("[data-rider-id]")
    .forEach(button => {
      button.addEventListener("click", () => {
        openRiderDetail(button.dataset.riderId);
      });
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
