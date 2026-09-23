
window.loadOrderDetail = async function(id) {
  document.getElementById("content").innerHTML = "Loading order...";

  try {
    const res = await apiGet(`/restaurant-order/status/pending`); // TEMP (we improve later)
    const order = res.data.find(o => (o.order_id || o.id) == id);

    if (!order) {
      document.getElementById("content").innerHTML = "Order not found";
      return;
    }

    document.getElementById("content").innerHTML = `
      <div class="order-detail">
        <h2>Order #${order.order_id || order.id}</h2>

        <div>Status: ${order.status}</div>
        <div>Total: ₹${order.total_amount || "-"}</div>

        <hr>

        <h3>Items</h3>
        <div>No items data yet</div>

        <hr>

        <h3>User</h3>
        <div>Coming soon</div>

        <hr>

        <button onclick="loadPage('home')">← Back</button>
      </div>
    `;

  } catch (err) {
    document.getElementById("content").innerHTML = "Error loading order";
  }
};

export function render() {
  document.getElementById("content").innerHTML = "Loading...";
}
