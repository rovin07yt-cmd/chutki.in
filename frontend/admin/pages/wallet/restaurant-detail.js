import { walletState } from "./state.js";
import {
  getRestaurantWallet,
  payRestaurant
} from "./api.js";

export async function openRestaurantWallet(id) {
  try {
    const response =
      await getRestaurantWallet(id);

    if (!response?.success) {
      alert(
        response?.message ||
        "Failed to load restaurant wallet"
      );
      return;
    }

    walletState.selectedRestaurant = {
      ...(response.data || {}),
      user_id: id
    };

    renderRestaurantDetail();

  } catch (error) {
    alert(
      error.message ||
      "Failed to load restaurant wallet"
    );
  }
}

function renderRestaurantDetail() {
  const wallet =
    walletState.selectedRestaurant;

  if (!wallet) return;

  const root =
    document.getElementById("walletPageRoot");

  if (!root) return;

  const profile =
    wallet.profile || {};

  const bank =
    wallet.bank_details || {};

  const earnings =
    wallet.earnings || {};

  const transactions =
    Array.isArray(wallet.transactions)
      ? wallet.transactions
      : [];

  const restaurantName =
    profile.restaurant_name ||
    profile.name ||
    "Restaurant";

  const mobile =
    profile.owner_mobile ||
    profile.mobile ||
    "";

  root.innerHTML = `
    <div class="wallet-detail-page">

      <div class="wallet-detail-page-header">

        <button
          id="backToRestaurants"
          class="wallet-back-btn"
          type="button"
        >
          ← Back to Restaurants
        </button>

      </div>

      <div class="wallet-detail-card">

        <div class="wallet-modal-header">

          <div class="wallet-modal-title">

            <div class="wallet-detail-avatar">
              R
            </div>

            <div>
              <h3>
                ${escapeHtml(restaurantName)}
              </h3>

              <p>
                ${escapeHtml(mobile)}
              </p>
            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Earnings
          </div>

          <div class="wallet-detail-stats">

            <div>
              <span>Total Earnings</span>
              <strong>
                ₹${money(earnings.total_earnings)}
              </strong>
            </div>

            <div>
              <span>Paid</span>
              <strong>
                ₹${money(earnings.paid_earnings)}
              </strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>
                ₹${money(earnings.pending_earnings)}
              </strong>
            </div>

            <div>
              <span>Yesterday</span>
              <strong>
                ₹${money(earnings.yesterday_earnings)}
              </strong>
            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Banking Details
          </div>

          <div class="wallet-bank-grid">

            <div>
              <span>UPI ID</span>
              <strong>
                ${escapeHtml(
                  bank.upi_id || "Not available"
                )}
              </strong>
            </div>

            <div>
              <span>Account Holder</span>
              <strong>
                ${escapeHtml(
                  bank.holder_name || "Not available"
                )}
              </strong>
            </div>

            <div>
              <span>Account Number</span>
              <strong>
                ${escapeHtml(
                  bank.account_no || "Not available"
                )}
              </strong>
            </div>

            <div>
              <span>IFSC</span>
              <strong>
                ${escapeHtml(
                  bank.ifsc || "Not available"
                )}
              </strong>
            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Restaurant Payment
          </div>

          <div class="wallet-payment-card">

            <div class="wallet-payment-pending">
              <span>Pending Payment</span>

              <strong>
                ₹${money(
                  earnings.pending_earnings
                )}
              </strong>
            </div>

            <div class="wallet-payment-form">

              <div class="wallet-form-group">

                <label for="restaurantPaymentAmount">
                  Amount
                </label>

                <input
                  id="restaurantPaymentAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                >

              </div>

              <div class="wallet-form-group">

                <label for="restaurantPaymentMethod">
                  Payment Method
                </label>

                <select id="restaurantPaymentMethod">

                  <option value="">
                    Select method
                  </option>

                  <option value="bank">
                    Bank
                  </option>

                  <option value="upi">
                    UPI
                  </option>

                  <option value="cash">
                    Cash
                  </option>

                </select>

              </div>

              <button
                type="button"
                id="restaurantPayBtn"
                class="wallet-primary-btn"
              >
                Pay Restaurant
              </button>

            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Transaction History
          </div>

          <div class="wallet-history-table-wrap">

            <table class="wallet-history-table">

              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                ${
                  transactions.length
                    ? transactions.map(
                        (transaction, index) => `
                          <tr>

                            <td>${index + 1}</td>

                            <td>
                              ${formatDate(
                                transaction.created_at
                              )}
                            </td>

                            <td>
                              ${escapeHtml(
                                transaction.type ||
                                "Transaction"
                              )}
                            </td>

                            <td>
                              ${escapeHtml(
                                transaction.method ||
                                "—"
                              )}
                            </td>

                            <td>
                              ₹${money(
                                transaction.amount
                              )}
                            </td>

                          </tr>
                        `
                      ).join("")
                    : `
                      <tr>
                        <td
                          colspan="5"
                          class="wallet-history-empty"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    `
                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  `;

  bindRestaurantDetailEvents();
}

function bindRestaurantDetailEvents() {
  document
    .getElementById("backToRestaurants")
    ?.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("wallet:show-main", {
          detail: { tab: "restaurants" }
        })
      );
    });

  document
    .getElementById("restaurantPayBtn")
    ?.addEventListener(
      "click",
      handleRestaurantPayment
    );
}

async function handleRestaurantPayment() {
  const wallet =
    walletState.selectedRestaurant;

  if (!wallet) return;

  const amount =
    Number(
      document.getElementById(
        "restaurantPaymentAmount"
      )?.value
    );

  const method =
    String(
      document.getElementById(
        "restaurantPaymentMethod"
      )?.value || ""
    )
      .trim()
      .toLowerCase();

  const pending =
    Number(
      wallet.earnings?.pending_earnings || 0
    );

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid payment amount.");
    return;
  }

  if (amount > pending) {
    alert(
      "Amount cannot exceed pending earnings."
    );
    return;
  }

  if (!["bank", "upi", "cash"].includes(method)) {
    alert("Select a valid payment method.");
    return;
  }

  if (!window.confirm(
    `Pay ₹${amount.toFixed(2)} to ${
      wallet.profile?.restaurant_name ||
      "this restaurant"
    } using ${method.toUpperCase()}?`
  )) {
    return;
  }

  const button =
    document.getElementById(
      "restaurantPayBtn"
    );

  if (button) {
    button.disabled = true;
    button.textContent = "Processing...";
  }

  try {
    const response =
      await payRestaurant({
        user_id: wallet.user_id,
        amount,
        method
      });

    if (!response?.success) {
      throw new Error(
        response?.message ||
        "Restaurant payment failed"
      );
    }

    alert(
      response.message ||
      "Restaurant payment recorded successfully."
    );

    await openRestaurantWallet(
      wallet.user_id
    );

  } catch (error) {
    alert(
      error.message ||
      "Restaurant payment failed"
    );

  } finally {
    const currentButton =
      document.getElementById(
        "restaurantPayBtn"
      );

    if (currentButton) {
      currentButton.disabled = false;
      currentButton.textContent =
        "Pay Restaurant";
    }
  }
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
