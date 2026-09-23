export async function render() {

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="orders-loading">
      Loading orders...
    </div>
  `;

  try {

    const res = await apiGet("/user/order/my");

    if (!res.success) {
      content.innerHTML = `
        <div class="order-empty">
          ${res.message}
        </div>
      `;
      return;
    }

    const orders = res.data || [];

    if (!orders.length) {
      content.innerHTML = `
        <div class="order-empty">
          No orders yet
        </div>
      `;
      return;
    }

    content.innerHTML = `
      <div class="orders-list">
        ${orders.map(o => `
          <div class="order-card">

            <div class="order-top">
              <div>
                <div class="order-id">
                  Order #${o.id}
                </div>

                <div class="order-date">
                  ${new Date(o.created_at).toLocaleString()}
                </div>
              </div>

              <div class="order-status ${o.status}">
                ${o.status}
              </div>
            </div>

            <div class="order-total">
              ₹${o.final_total}
            </div>

            <button
              class="order-view-btn"
              onclick="viewOrder(${o.id})">
              View Details
            </button>

          </div>
        `).join("")}
      </div>
    `;

  } catch (err) {

    content.innerHTML = `
      <div class="order-empty">
        ${err.message}
      </div>
    `;
  }
}

window.viewOrder = async function(orderId) {

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="orders-loading">
      Loading order...
    </div>
  `;

  try {

    const detailRes =
      await apiGet("/user/order/" + orderId);

    const timelineRes =
      await apiGet("/user/order/" + orderId + "/timeline");

    if (!detailRes.success) {
      content.innerHTML = detailRes.message;
      return;
    }

    const order = detailRes.data;
    const timeline = timelineRes.data || [];

    content.innerHTML = `
      <button
        class="back-btn"
        onclick="loadPage('orders')">
        ← Back
      </button>

      <div class="order-detail-card">

        <h2>Order #${order.id}</h2>

        <div class="timeline">

          ${timeline.map(t => `
            <div class="timeline-item ${t.done ? 'done' : ''}">
              ${t.done ? '✓' : '○'} ${t.status}
            </div>
          `).join("")}

        </div>

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
            <span>${r.status}</span>
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
