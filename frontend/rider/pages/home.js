export default async function(content) {

  const json = await apiGet("/rider/orders");
  const wallet = await apiGet("/rider-wallet/summary");

  const orders = json.data || [];
  const codPending = wallet.data?.cod_pending || 0;

  content.innerHTML = `
    <div class="home-page">

      <div class="stats-grid">

        <div class="stat-card">
          <div class="label">Assigned Orders</div>
          <div class="value">${orders.length}</div>
        </div>

        <div class="stat-card">
          <div class="label">COD Pending</div>
          <div class="value">₹${codPending}</div>
        </div>

        <div class="stat-card">
          <div class="label">Distance Today</div>
          <div class="value">0 KM</div>
        </div>

      </div>

      <div class="section-card">

        <h3>Assigned Orders</h3>

        <div id="assignedOrders"></div>

      </div>

    </div>
  `;

  const container =
    document.getElementById(
      "assignedOrders"
    );

  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-state">
        No assigned orders
      </div>
    `;

    return;
  }

  container.innerHTML =
    orders.map(order => `

      <div
        class="order-card"
        data-id="${order.id}"
      >

        <div class="order-top">
          <b>Order #${order.id}</b>

          <span>
            R:${order.restaurants.length}
          </span>
        </div>

        <div class="order-customer">
          ${order.user_name}
        </div>

        <div class="mobile-row">

          <span>
            ${order.user_mobile}
          </span>

          <a
            class="call-btn"
            href="tel:${order.user_mobile}"
            onclick="event.stopPropagation()"
          >
            Call
          </a>

        </div>

        <div class="cod-row">
          COD ₹${order.cod}
        </div>

        <div class="action-row">

            <button
              class="return-btn"
              data-id="${order.id}"
              data-status="${order.dispatch_status}"
              onclick="event.stopPropagation()"
            >
              ${order.dispatch_status === "on_the_way_return" ? "Returned" : "Return"}
            </button>

          <button
            class="deliver-btn"
            data-id="${order.id}"
            data-status="${order.dispatch_status}"
            onclick="event.stopPropagation()"
          >
              ${order.dispatch_status === "assigned" ? "Picked" : (order.dispatch_status === "picked" ? "Delivered" : "")}
          </button>

        </div>

      </div>

    `).join("");

  document.querySelectorAll(".deliver-btn").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();

      const api =
        btn.dataset.status === "assigned"
          ? "/rider/picked"
          : "/rider/delivered";

      const result = await apiPost(
        api,
        { order_id:Number(btn.dataset.id) }
      );

      alert(result.message);
      loadPage("home");
    };
  });

    document.querySelectorAll(".return-btn").forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();

          const result = await apiPost(
            btn.dataset.status === "on_the_way_return"
              ? "/rider/returned"
              : "/rider/return-start",
            { order_id:Number(btn.dataset.id) }
          );

        alert(result.message);
        loadPage("home");
      };
    });

  document.querySelectorAll(".order-card").forEach(card => {

    card.addEventListener("click", async () => {

      const module = await import(`./order-detail.js?v=${Date.now()}`);

      await module.default(content, card.dataset.id);

    });

  });

}
