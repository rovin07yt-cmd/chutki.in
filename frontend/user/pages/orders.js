function isCancelledOrder(o) {
  return (
    o.status === "cancelled" ||
    o.status === "returned" ||
    o.dispatch_status === "on_the_way_return" ||
    o.dispatch_status === "returned" ||
    o.has_rejection === true ||
    o.has_rejection === "t"
  );
}

function isDeliveredOrder(o) {
  return o.status === "delivered" ||
         o.dispatch_status === "delivered";
}

function orderSection(title, orders, type) {
  if (!orders.length) return "";

  return `
    <section class="orders-section ${type}-section">
      <h3 class="orders-section-title">
        ${title} <span>(${orders.length})</span>
      </h3>

      <div class="orders-list">
        ${orders.map(o => {
          const cancelled = type === "cancelled";
          const delivered = type === "delivered";

          const label = cancelled
            ? "Cancelled"
            : delivered
              ? "Delivered"
              : (o.status || "Pending").replaceAll("_", " ");

          return `
            <div class="order-card ${cancelled ? "cancelled-order-card" : ""}">
              <div class="order-top">
                <div>
                  <div class="order-id">Order #${o.id}</div>
                  <div class="order-date">
                    ${new Date(o.created_at).toLocaleString()}
                  </div>
                </div>

                <div class="order-status ${cancelled ? "cancelled-status" : delivered ? "delivered-status" : "active-status"}">
                  ${label}
                </div>
              </div>

              <div class="order-total">₹${o.final_total}</div>

              <button
                class="order-view-btn"
                onclick="viewOrder(${o.id})">
                View Details
              </button>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

export async function render() {
  const content = document.getElementById("content");

  content.innerHTML = `<div class="orders-loading">Loading orders...</div>`;

  try {
    const res = await apiGet("/user/order/my");

    if (!res.success) {
      content.innerHTML = `<div class="order-empty">${res.message}</div>`;
      return;
    }

    const orders = res.data || [];

    if (!orders.length) {
      content.innerHTML = `<div class="order-empty">No orders yet</div>`;
      return;
    }

    const cancelled = orders.filter(isCancelledOrder);
    const delivered = orders.filter(o =>
      !isCancelledOrder(o) && isDeliveredOrder(o)
    );
    const active = orders.filter(o =>
      !isCancelledOrder(o) && !isDeliveredOrder(o)
    );

    content.innerHTML = `
      <div class="orders-page">
        ${orderSection("Active Orders", active, "active")}
        ${orderSection("Delivered Orders", delivered, "delivered")}
        ${orderSection("Cancelled Orders", cancelled, "cancelled")}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<div class="order-empty">${err.message}</div>`;
  }
}

window.viewOrder = async function(orderId) {
  const content = document.getElementById("content");

  content.innerHTML = `<div class="orders-loading">Loading order...</div>`;

  try {
    const detailRes = await apiGet("/user/order/" + orderId);
    const timelineRes = await apiGet("/user/order/" + orderId + "/timeline");

    if (!detailRes.success) {
      content.innerHTML = detailRes.message;
      return;
    }

    const order = detailRes.data;
    const timeline = timelineRes.data || [];

    const cancelled =
      order.status === "cancelled" ||
      order.status === "returned" ||
      order.dispatch_status === "on_the_way_return" ||
      order.dispatch_status === "returned" ||
      order.restaurants.some(r => r.status === "rejected");

    const delivered =
      order.status === "delivered" ||
      order.dispatch_status === "delivered";

    const outcome = cancelled
      ? "Cancelled"
      : delivered
        ? "Delivered"
        : (order.status || "Pending").replaceAll("_", " ");

    content.innerHTML = `
      <button class="back-btn" onclick="loadPage('orders')">
        ← Back
      </button>

      <div class="order-detail-card">
        <h2>Order #${order.id}</h2>

        <div class="order-detail-outcome ${cancelled ? "cancelled-status" : delivered ? "delivered-status" : "active-status"}">
          ${outcome}
        </div>

        ${cancelled ? `
          <div class="cancelled-message">
            This order has been cancelled.
          </div>
        ` : `
          <div class="timeline">
            ${timeline.map(t => `
              <div class="timeline-item ${t.done ? "done" : ""}">
                ${t.done ? "✓" : "○"} ${t.status}
              </div>
            `).join("")}
          </div>
        `}

        <h3>Items</h3>

        ${order.items.map(i => `
          <div class="detail-row">
            <span>${i.name} × ${i.quantity}</span>
            <span>₹${i.price}</span>
          </div>
        `).join("")}

        <h3>Restaurants</h3>

        ${order.restaurants.map(r => `
          <div class="detail-row">
            <span>${r.name}</span>
            <span>${cancelled ? "Cancelled" : r.status}</span>
          </div>
        `).join("")}

        <div class="order-final">
          Total ₹${order.pricing.final_total}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = err.message;
  }
};
