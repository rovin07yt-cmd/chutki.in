export async function render() {

  document.getElementById("content").innerHTML = `
    <div class="wallet-page">

      <!-- ACTION BUTTONS -->
      <div class="wallet-actions">
        <button onclick="openBank()">🏦 Banking</button>
        <button onclick="loadHistory()">📜 History</button>
      </div>

      <!-- CARDS -->
      <div class="wallet-cards">
        <div class="wallet-card" id="pendingCard">
          <div class="label">Pending Earnings</div>
          <div class="amount">₹0</div>
        </div>

        <div class="wallet-card" id="yesterdayCard">
          <div class="label">Yesterday Earnings</div>
          <div class="amount">₹0</div>
        </div>
      </div>

      <!-- HISTORY -->
      <div id="history" style="margin-top:15px;"></div>

    </div>
  `;

  loadSummary();
}


// ✅ SUMMARY (temporary same value)
async function loadSummary() {
  const res = await apiGet("/restaurant-wallet/summary");
  const total = res.data.total_earning || 0;

  // For now using same value (later we split properly)
  document.querySelector("#pendingCard .amount").innerText = "₹" + total;
  document.querySelector("#yesterdayCard .amount").innerText = "₹" + total;
}


// ✅ HISTORY (CARD STYLE)
window.loadHistory = async () => {

  const res = await apiGet("/restaurant-wallet/history");
  const list = res.data || [];

  if (!list.length) {
    document.getElementById("history").innerHTML = "No history";
    return;
  }

  document.getElementById("history").innerHTML = list.map(r => `
    <div class="history-card">
      <div class="row">
        <div>₹${r.amount}</div>
        <div>COD</div>
      </div>
      <div class="row small">
        <div>${new Date(r.created_at).toLocaleDateString()}</div>
        <div>${new Date(r.created_at).toLocaleTimeString()}</div>
      </div>
    </div>
  `).join("");
};


// ✅ NAV
window.openBank = () => {
  loadPage("wallet-bank");
};
