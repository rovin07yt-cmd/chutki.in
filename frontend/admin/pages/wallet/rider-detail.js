import { walletState } from "./state.js";
import {
  getRiderWallet,
  payRiderSalary,
  submitRiderCOD
} from "./api.js";

let historyFilter = "all";

export async function openRiderDetail(id) {
  const response = await getRiderWallet(id);

  if (!response?.success) {
    alert(response?.message || "Failed to load rider wallet");
    return;
  }

  const listRider =
    walletState.riders.find(
      rider => String(rider.user_id) === String(id)
    ) || {};

  walletState.selectedRider = {
    ...(response.data || {}),
    ...listRider,
    user_id: id
  };

  historyFilter = "all";

  renderRiderDetail();
}

function renderRiderDetail() {
  const wallet = walletState.selectedRider;

  if (!wallet) return;

  const root = document.getElementById("walletPageRoot");

  if (!root) return;

  const profile = wallet.profile || {};
  const bank = wallet.bank || {};
  const cod = wallet.wallet || {};
  const earnings = wallet.earnings || {};
  const transactions = wallet.transactions || [];

  const name =
    profile.name ||
    wallet.name ||
    "Rider";

  const image =
    profile.image ||
    wallet.image ||
    "";

  root.innerHTML = `
    <div class="wallet-detail-page">

      <div class="wallet-detail-page-header">

        <button
          id="backToRiders"
          class="wallet-back-btn"
          type="button"
        >
          ← Back to Riders
        </button>

      </div>

      <div class="wallet-detail-card">

        <div class="wallet-modal-header">

          <div class="wallet-modal-title">

            ${
              image
                ? `
                  <img
                    class="wallet-detail-image"
                    src="${escapeHtml(image)}"
                    alt=""
                  >
                `
                : `
                  <div class="wallet-detail-avatar">
                    R
                  </div>
                `
            }

            <div>
              <h3>${escapeHtml(name)}</h3>
              <p>Rider Wallet</p>
            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Profile
          </div>

          <div class="wallet-profile-grid">
            ${buildProfileRows(profile, {
              name,
              mobile: wallet.mobile,
              gmail: wallet.gmail,
              user_id: wallet.user_id
            })}
          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Banking
          </div>

          <div class="wallet-profile-grid">
            ${detailItem("Holder Name", bank.holder_name)}
            ${detailItem("Account No.", bank.account_no)}
            ${detailItem("IFSC", bank.ifsc)}
            ${detailItem("UPI ID", bank.upi_id)}
          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            COD
          </div>

          <div class="wallet-money-card">

            <div>
              <span>Pending COD</span>
              <strong>₹${money(cod.pending_cod)}</strong>
            </div>

            <div>
              <span>COD Collected</span>
              <strong>₹${money(cod.cod_collected)}</strong>
            </div>

            <div>
              <span>COD Submitted</span>
              <strong>₹${money(cod.creditted)}</strong>
            </div>

          </div>

          <div class="wallet-action-box">

            <label for="riderCodAmount">
              COD Submit Amount
            </label>

            <div class="wallet-action-row">

              <input
                id="riderCodAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
              >

              <button
                id="submitRiderCod"
                class="wallet-primary-btn"
                type="button"
              >
                Submit COD
              </button>

            </div>

          </div>

        </div>


        <div class="wallet-detail-section">

          <div class="wallet-detail-section-title">
            Salary
          </div>

          <div class="wallet-money-card">

            <div>
              <span>Total Earned</span>
              <strong>₹${money(earnings.total_earned)}</strong>
            </div>

            <div>
              <span>Paid Salary</span>
              <strong>₹${money(earnings.paid_salary)}</strong>
            </div>

            <div>
              <span>Pending Salary</span>
              <strong>₹${money(earnings.pending_salary)}</strong>
            </div>

          </div>

          <div class="wallet-action-box">

            <label for="riderSalaryAmount">
              Salary Pay Amount
            </label>

            <div class="wallet-action-row">

              <input
                id="riderSalaryAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
              >

              <select id="riderSalaryMethod">
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
              </select>

              <button
                id="payRiderSalary"
                class="wallet-primary-btn"
                type="button"
              >
                Pay Salary
              </button>

            </div>

          </div>

        </div>


        <div class="wallet-detail-section wallet-history-section">

          <div class="wallet-detail-section-title">
            History
          </div>

          <div class="wallet-history-filters">

            <button
              type="button"
              class="wallet-history-filter ${
                historyFilter === "all" ? "active" : ""
              }"
              data-history-filter="all"
            >
              All Transactions
            </button>

            <button
              type="button"
              class="wallet-history-filter ${
                historyFilter === "salary" ? "active" : ""
              }"
              data-history-filter="salary"
            >
              Salary
            </button>

            <button
              type="button"
              class="wallet-history-filter ${
                historyFilter === "cod" ? "active" : ""
              }"
              data-history-filter="cod"
            >
              COD
            </button>

          </div>

          <div class="wallet-history-table-wrap">

            <table class="wallet-history-table">

              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Date</th>
                  <th>Total Distance</th>
                  <th>Orders Delivered</th>
                  <th>COD Submitted</th>
                  <th>Salary Paid</th>
                </tr>
              </thead>

              <tbody id="riderHistoryBody">
                ${buildHistoryRows(transactions)}
              </tbody>

            </table>

          </div>

          <div id="riderHistoryTotals">
            ${buildHistoryTotals(transactions)}
          </div>

        </div>

      </div>

    </div>
  `;

  bindDetailEvents();
}

function bindDetailEvents() {
  document
    .getElementById("backToRiders")
    ?.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("wallet:show-main", {
          detail: { tab: "riders" }
        })
      );
    });

  document
    .getElementById("submitRiderCod")
    ?.addEventListener("click", handleCodSubmit);

  document
    .getElementById("payRiderSalary")
    ?.addEventListener("click", handleSalaryPayment);

  document
    .querySelectorAll("[data-history-filter]")
    .forEach(button => {
      button.addEventListener("click", () => {
        historyFilter =
          button.dataset.historyFilter;

        updateHistory();
      });
    });
}

function updateHistory() {
  const transactions =
    walletState.selectedRider?.transactions || [];

  document
    .querySelectorAll("[data-history-filter]")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.historyFilter === historyFilter
      );
    });

  const body =
    document.getElementById("riderHistoryBody");

  const totals =
    document.getElementById("riderHistoryTotals");

  if (body) {
    body.innerHTML = buildHistoryRows(transactions);
  }

  if (totals) {
    totals.innerHTML =
      buildHistoryTotals(transactions);
  }
}

function getFilteredTransactions(transactions) {
  if (historyFilter === "salary") {
    return transactions.filter(
      transaction =>
        String(transaction.type || "")
          .toLowerCase() === "debit"
    );
  }

  if (historyFilter === "cod") {
    return transactions.filter(
      transaction =>
        String(transaction.type || "")
          .toLowerCase() === "credit"
    );
  }

  return transactions;
}

function buildHistoryRows(transactions) {
  const filtered =
    getFilteredTransactions(transactions);

  if (!filtered.length) {
    return `
      <tr>
        <td colspan="6">
          No transactions found
        </td>
      </tr>
    `;
  }

  return filtered.map((transaction, index) => {
    const type =
      String(transaction.type || "")
        .toLowerCase();

    return `
      <tr>

        <td>${index + 1}</td>

        <td>
          ${formatDate(transaction.created_at)}
        </td>

        <td>—</td>

        <td>—</td>

        <td>
          ${
            type === "credit"
              ? `₹${money(transaction.amount)}`
              : "—"
          }
        </td>

        <td>
          ${
            type === "debit"
              ? `₹${money(transaction.amount)}`
              : "—"
          }
        </td>

      </tr>
    `;
  }).join("");
}

function buildHistoryTotals(transactions) {
  const now = new Date();

  const monthly = transactions.filter(transaction => {
    if (!transaction.created_at) return false;

    const date = new Date(transaction.created_at);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  });

  const salaryTotal =
    monthly
      .filter(
        transaction =>
          String(transaction.type || "")
            .toLowerCase() === "debit"
      )
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

  const codTotal =
    monthly
      .filter(
        transaction =>
          String(transaction.type || "")
            .toLowerCase() === "credit"
      )
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

  if (historyFilter === "salary") {
    return `
      <div class="wallet-history-total">
        <span>Total salary paid this month</span>
        <strong>₹${money(salaryTotal)}</strong>
      </div>
    `;
  }

  if (historyFilter === "cod") {
    return `
      <div class="wallet-history-total">
        <span>Total COD submitted this month</span>
        <strong>₹${money(codTotal)}</strong>
      </div>
    `;
  }

  return `
    <div class="wallet-history-total-grid">

      <div class="wallet-history-total">
        <span>Total salary paid this month</span>
        <strong>₹${money(salaryTotal)}</strong>
      </div>

      <div class="wallet-history-total">
        <span>Total COD submitted this month</span>
        <strong>₹${money(codTotal)}</strong>
      </div>

    </div>
  `;
}

async function handleCodSubmit() {
  const wallet = walletState.selectedRider;

  if (!wallet) return;

  const amount =
    Number(
      document.getElementById("riderCodAmount")?.value
    );

  const pending =
    Number(wallet.wallet?.pending_cod || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid COD amount.");
    return;
  }

  if (amount > pending) {
    alert("Amount cannot exceed pending COD.");
    return;
  }

  if (!window.confirm(
    `Submit ₹${amount.toFixed(2)} COD?`
  )) {
    return;
  }

  try {
    const response =
      await submitRiderCOD({
        user_id: wallet.user_id,
        amount
      });

    if (!response?.success) {
      throw new Error(
        response?.message || "Failed to submit COD"
      );
    }

    await openRiderDetail(wallet.user_id);

  } catch (error) {
    alert(error.message || "Failed to submit COD");
  }
}

async function handleSalaryPayment() {
  const wallet = walletState.selectedRider;

  if (!wallet) return;

  const amount =
    Number(
      document
        .getElementById("riderSalaryAmount")
        ?.value
    );

  const method =
    document
      .getElementById("riderSalaryMethod")
      ?.value;

  const pending =
    Number(
      wallet.earnings?.pending_salary || 0
    );

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid salary amount.");
    return;
  }

  if (amount > pending) {
    alert("Amount cannot exceed pending salary.");
    return;
  }

  if (!window.confirm(
    `Pay ₹${amount.toFixed(2)} salary?`
  )) {
    return;
  }

  try {
    const response =
      await payRiderSalary({
        user_id: wallet.user_id,
        amount,
        method
      });

    if (!response?.success) {
      throw new Error(
        response?.message || "Failed to pay salary"
      );
    }

    await openRiderDetail(wallet.user_id);

  } catch (error) {
    alert(error.message || "Failed to pay salary");
  }
}

function buildProfileRows(profile, fallback) {
  const values = {
    ...fallback,
    ...profile
  };

  const excluded = new Set([
    "password",
    "password_hash",
    "wallet_password",
    "image"
  ]);

  return Object.entries(values)
    .filter(([key, value]) =>
      !excluded.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
    )
    .map(([key, value]) =>
      detailItem(formatLabel(key), value)
    )
    .join("");
}

function detailItem(label, value) {
  return `
    <div class="wallet-profile-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? "-")}</strong>
    </div>
  `;
}

function formatLabel(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(/\b\w/g, character =>
      character.toUpperCase()
    );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN");
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
