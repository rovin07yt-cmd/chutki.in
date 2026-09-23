import { walletState } from "./state.js";
import { getWalletImageUrl } from "./api.js";
import {
  getRestaurantWallets,
  getRestaurantWallet
} from "./api.js";
import { openRestaurantWallet } from "./restaurant-detail.js";

export async function loadRestaurants() {
  const response = await getRestaurantWallets();

  if (!response?.success) {
    throw new Error(
      response?.message || "Failed to load restaurant wallets"
    );
  }

  const restaurants = Array.isArray(response.data)
    ? response.data
    : [];

  walletState.restaurants = await Promise.all(
    restaurants.map(async restaurant => {
      try {
        const detailResponse = await getRestaurantWallet(
          restaurant.user_id
        );

        const earnings = detailResponse?.success
          ? detailResponse.data?.earnings || {}
          : {};

        return {
          ...restaurant,
          pending_earnings:
            earnings.pending_earnings !== undefined
              ? Number(earnings.pending_earnings)
              : null
        };
      } catch (error) {
        console.error(
          `Failed to load wallet details for restaurant ${restaurant.user_id}:`,
          error
        );

        return {
          ...restaurant,
          pending_earnings: null
        };
      }
    })
  );

  renderRestaurants();
}

export function renderRestaurants() {
  const container =
    document.getElementById("restaurantWalletList");

  if (!container) return;

  if (!walletState.restaurants.length) {
    container.innerHTML = `
      <div class="wallet-empty">
        No restaurant wallets found.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="wallet-person-grid">
      ${walletState.restaurants.map(restaurant => {
        const total = Number(
          restaurant.total_earnings || 0
        );

        const pending =
          restaurant.pending_earnings === null ||
          restaurant.pending_earnings === undefined
            ? null
            : Number(restaurant.pending_earnings);

        return `
          <article class="wallet-person-card wallet-restaurant-card">

            <div class="wallet-card-top">

              ${
                restaurant.image
                  ? `
                    <img
                      class="wallet-card-image"
                      src="${escapeHtml(getWalletImageUrl(restaurant.image))}"
                      alt="Restaurant"
                    >
                  `
                  : `
                    <div class="wallet-card-avatar">
                      R
                    </div>
                  `
              }

              <div class="wallet-card-identity">
                <h4>
                  ${escapeHtml(
                    restaurant.restaurant_name ||
                    "Restaurant"
                  )}
                </h4>

                <p>
                  ${escapeHtml(
                    restaurant.owner_mobile || "-"
                  )}
                </p>
              </div>

            </div>

            <div class="wallet-card-balances">

              <div class="wallet-card-balance">
                <span>Total Earnings</span>
                <strong>
                  ₹${total.toFixed(2)}
                </strong>
              </div>

              <div class="wallet-card-balance">
                <span>Pending Payment</span>
                <strong>
                  ${
                    pending === null
                      ? "—"
                      : `₹${pending.toFixed(2)}`
                  }
                </strong>
              </div>

            </div>

            <button
              class="wallet-card-detail-btn"
              type="button"
              data-restaurant-wallet-id="${restaurant.user_id}"
            >
              Details
            </button>

          </article>
        `;
      }).join("")}
    </div>
  `;

  container
    .querySelectorAll("[data-restaurant-wallet-id]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const id = Number(
          button.dataset.restaurantWalletId
        );

        if (id) {
          openRestaurantWallet(id);
        }
      });
    });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
