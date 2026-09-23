export default async function(
  content,
  orderId
) {

  const json =
    await apiGet(
      `/rider/order/${orderId}`
    );

  const order = json.data;

  if (!order) {

    content.innerHTML =
      "<div>Order not found</div>";

    return;
  }

  content.innerHTML = `

    <div class="detail-card">

      <button
        class="back-btn"
        onclick="loadPage('home')"
      >
        ← Back
      </button>

      <h2>
        Order #${order.id}
      </h2>

      <h3>Customer</h3>

      <p>
        ${order.customer.name}
      </p>

      <a
        href="tel:${order.customer.mobile}"
        class="call-btn"
      >
        Call Customer
      </a>

      <hr>

      <h3>Restaurants</h3>

      ${order.restaurants.map(r => `

        <div class="restaurant-box">

          <b>${r.name}</b>

          <br>

          <a
            href="tel:${r.mobile}"
            class="call-btn"
          >
            Call Restaurant
          </a>

        </div>

      `).join("")}

      <hr>

      <h3>
        COD ₹${order.cod}
      </h3>

      <div class="action-row">

        <button
          id="returnBtn"
          class="cancel-btn"
        >
          ${order.dispatch_status === "on_the_way_return" ? "Returned" : "Return"}
        </button>

        <button
          id="deliverBtn"
          class="deliver-btn"
        >
          ${order.dispatch_status === "assigned" ? "Picked" : (order.dispatch_status === "picked" ? "Delivered" : "")}
        </button>

      </div>

    </div>
  `;

  document.getElementById("deliverBtn")?.addEventListener("click", async () => {

    const api =
      order.dispatch_status === "assigned"
        ? "/rider/picked"
        : "/rider/delivered";

    const result = await apiPost(api, {
      order_id: order.id
    });

    alert(result.message);
    loadPage("home");

  });

  document.getElementById("returnBtn")?.addEventListener("click", async () => {

    const api =
      order.dispatch_status === "on_the_way_return"
        ? "/rider/returned"
        : "/rider/return-start";

    const result = await apiPost(api, {
      order_id: order.id
    });

    alert(result.message);
    loadPage("home");

  });
}
