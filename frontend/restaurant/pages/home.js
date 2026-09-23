let currentStatus = "pending";
let currentSubStatus = "cancelled";

// 🔹 MAIN RENDER
export async function render() {
  document.getElementById("content").innerHTML = `
    <div class="home">
      <div class="status-bar-wrapper">
        <div class="scroll-hint">Swipe →</div>
        <div class="status-bar" id="statusBar"></div>
      </div>

      <div id="subStatusBar"></div>

      <div class="order-list" id="orderList"></div>
    </div>
  `;

  loadCounts();

  // ✅ always start from NEW
  currentStatus = "pending";
  currentSubStatus = "cancelled";

  loadOrders(currentStatus);
}

// 🔹 LOAD COUNTS
async function loadCounts() {
  const res = await apiGet("/restaurant-order/counts");
  const data = res.data || {};

  const map = [
    { key: "pending", label: "NEW" },
    { key: "accepted", label: "ACCEPTED" },
    { key: "preparing", label: "PREPARING" },
    { key: "ready", label: "READY" },
    { key: "picked", label: "PICKED" },
    { key: "delivered", label: "DELIVERED" },
    { key: "cancelled", label: "CANCELLED" },
    { key: "history", label: "HISTORY" }
  ];

  document.getElementById("statusBar").innerHTML = map.map(s => `
    <div class="status-pill ${currentStatus === s.key ? 'active' : ''}" 
         onclick="loadOrders('${s.key}')">
      ${s.label} (${data[s.key] || 0})
    </div>
  `).join("");
}

// 🔹 LOAD ORDERS
window.loadOrders = async function (status) {

  if (['cancelled','returned','rejected'].includes(status)) {
    currentStatus = 'cancelled';
    currentSubStatus = status;
  } else {
    currentStatus = status;
  }

  loadCounts();

  const subBar = document.getElementById("subStatusBar");

  if (currentStatus === "cancelled") {
    subBar.innerHTML = `
      <div class="sub-bar">
        <button class="${currentSubStatus==='cancelled'?'active':''}" onclick="loadOrders('cancelled')">On Way</button>
        <button class="${currentSubStatus==='returned'?'active':''}" onclick="loadOrders('returned')">Returned</button>
        <button class="${currentSubStatus==='rejected'?'active':''}" onclick="loadOrders('rejected')">Rejected</button>
      </div>
    `;
  } else {
    subBar.innerHTML = "";
  }

  document.getElementById("orderList").innerHTML = "Loading...";

  let apiStatus = status;

  if (currentStatus === "history") {
    apiStatus = "delivered";
  }

  if (currentStatus === "cancelled") {
    apiStatus = currentSubStatus;
  }

  const res = await apiGet(`/restaurant-order/status/${apiStatus}`);
  const orders = res.data || [];

  if (currentStatus === "history") {
    renderHistory(orders);
  } else {
    renderOrders(orders);
  }
};

// 🔹 NORMAL RENDER
function renderOrders(orders) {
  if (!orders.length) {
    document.getElementById("orderList").innerHTML = `<div class="empty">No orders</div>`;
    return;
  }

  document.getElementById("orderList").innerHTML =
    orders.map(o => cardHTML(o)).join("");
}

// 🔹 ACTIONS (FIXED)
function reloadSameTab() {
  loadOrders(
    currentStatus === "cancelled" ? currentSubStatus : currentStatus
  );
}

window.acceptOrder = async (id) => {
  await apiPost("/restaurant-order/accept", { order_id: id });
  loadCounts();
  reloadSameTab();
};

window.markPreparing = async (id) => {
  const time = prompt("Enter preparation time (minutes):");
  if (!time) return;

  await apiPost("/restaurant-order/preparing", {
    order_id: id,
    prep_time: Number(time)
  });

  loadCounts();
  reloadSameTab();
};

window.markReady = async (id) => {
  await apiPost("/restaurant-order/ready", { order_id: id });
  loadCounts();
  reloadSameTab();
};

window.rejectOrder = async (id) => {
  await apiPost("/restaurant-order/reject", { order_id: id });
  loadCounts();
  reloadSameTab();
};

// 🔹 CARD
function cardHTML(o) {
  const items = (o.items || [])
    .map(i => `${i.name} x${i.quantity}`)
    .join(", ");

  return `
    <div class="order-card">

      <div class="order-header">
        <div><b>Order #${o.order_id}</b></div>
        <div class="status-badge">
          ${
            o.dispatch_status === 'delivered'
              ? 'delivered'
              : o.dispatch_status === 'picked'
              ? 'picked'
              : o.dispatch_status === 'assigned'
              ? 'assigned'
              : o.restaurant_status
          }
        </div>
      </div>

      <div class="order-body">
        <div><b>Items:</b> ${items}</div>
        <div><b>Amount:</b> ₹${o.total_price}</div>
      </div>

      ${
        o.assigned_rider_id ? `
        <div style="margin-top:10px;">
          <b>Assigned Rider:</b><br>
          ${o.rider ? `#${o.rider.id} ${o.rider.name} ${o.rider.mobile}` : 'N/A'}
        </div>
      ` : `
          <div class="order-actions">

            ${o.restaurant_status === "pending" ? `
              <button class="btn accept" onclick="acceptOrder(${o.order_id})">Accept</button>
              <button class="btn prep" onclick="rejectOrder(${o.order_id})">Reject</button>
            ` : ""}

            ${o.restaurant_status === "accepted" ? `
              <button class="btn prep" onclick="markPreparing(${o.order_id})">Start Preparing</button>
            ` : ""}

            ${o.restaurant_status === "preparing" ? `
              <button class="btn ready" onclick="markReady(${o.order_id})">Mark Ready</button>
            ` : ""}

          </div>
        `}
    </div>
  `;
}

// 🔹 HISTORY (SORTED + FIXED DATE)
function renderHistory(orders) {

  if (!orders.length) {
    document.getElementById("orderList").innerHTML = `<div class="empty">No history</div>`;
    return;
  }

  const grouped = {};

  orders.forEach(o => {
    const d = new Date(o.created_at);

    const date = d.getDate().toString().padStart(2,'0') + "/" +
                 (d.getMonth()+1).toString().padStart(2,'0') + "/" +
                 d.getFullYear();

    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(o);
  });

  let html = "";

  Object.keys(grouped)
    .sort((a, b) => {
      const [d1,m1,y1] = a.split('/');
      const [d2,m2,y2] = b.split('/');
      return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
    })
    .forEach(date => {
      html += `<h4 style="margin:10px 5px;">📅 ${date}</h4>`;
      html += grouped[date].map(o => cardHTML(o)).join("");
    });

  document.getElementById("orderList").innerHTML = html;
}
