export default async function(content){

  showHome();

  async function showHome(){

    const res =
      await apiGet(
        "/rider-wallet/summary"
      );

    const data =
      res.data || {};

    content.innerHTML = `

      <div class="wallet-page">

        <div class="wallet-cards">

          <div class="wallet-card">
            <div class="wallet-label">
              Pending Salary
            </div>
            <div class="wallet-value">
              ₹${data.pending_salary || 0}
            </div>
          </div>

          <div class="wallet-card">
            <div class="wallet-label">
              Today's Earnings
            </div>
            <div class="wallet-value">
              ₹${data.today_earning || 0}
            </div>
          </div>

          <div class="wallet-card">
            <div class="wallet-label">
              COD Pending
            </div>
            <div class="wallet-value">
              ₹${data.cod_pending || 0}
            </div>
          </div>

        </div>

        <div class="wallet-actions">

          <button
            id="bankBtn"
            class="wallet-nav-btn">
            Banking Details
          </button>

          <button
            id="historyBtn"
            class="wallet-nav-btn">
            Earnings History
          </button>

        </div>

      </div>
    `;

    document
      .getElementById("bankBtn")
      .onclick = showBank;

    document
      .getElementById("historyBtn")
      .onclick = showHistory;
  }

  async function showBank(){

    const res =
      await apiGet(
        "/rider-wallet/bank-details"
      );

    const bank =
      res.data || {};

    content.innerHTML = `

      <div class="detail-card">

        <button
          class="back-btn"
          id="backBtn">
          ← Back
        </button>

        <h3>Bank Details</h3>

        <input
          id="holder"
          class="wallet-input"
          placeholder="Account Holder"
          value="${bank.holder_name || ""}"
        >

        <input
          id="account"
          class="wallet-input"
          placeholder="Account Number"
          value="${bank.account_no || ""}"
        >

        <input
          id="ifsc"
          class="wallet-input"
          placeholder="IFSC"
          value="${bank.ifsc || ""}"
        >

        <input
          id="upi"
          class="wallet-input"
          placeholder="UPI ID"
          value="${bank.upi_id || ""}"
        >

        <button
          id="saveBank"
          class="deliver-btn">
          Save
        </button>

      </div>
    `;

    document
      .getElementById("backBtn")
      .onclick = showHome;

    document
      .getElementById("saveBank")
      .onclick = async () => {

        await apiPost(
          "/rider-wallet/bank-details",
          {
            holder_name:
              document.getElementById("holder").value,

            account_no:
              document.getElementById("account").value,

            ifsc:
              document.getElementById("ifsc").value,

            upi_id:
              document.getElementById("upi").value
          }
        );

        alert("Bank details saved");
      };
  }

  async function showHistory(){

    const res =
      await apiGet(
        "/rider-wallet/earnings"
      );

    const rows =
      res.data || [];

    content.innerHTML = `

      <div class="detail-card">

        <button
          class="back-btn"
          id="backBtn">
          ← Back
        </button>

        <h3>Earnings History</h3>

        <div id="historyList"></div>

      </div>
    `;

    document
      .getElementById("backBtn")
      .onclick = showHome;

    document
      .getElementById("historyList")
      .innerHTML =
      rows.map(r => `

        <div class="wallet-history-card">

          <div>
            Order #${r.order_id}
          </div>

          <div>
            ₹${r.rider_earning}
          </div>

          <div>
            ${new Date(
              r.delivered_at
            ).toLocaleDateString()}
          </div>

        </div>

      `).join("");
  }

}
