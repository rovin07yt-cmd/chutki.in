let orders = [];

export async function render(targetId = "content") {

  const content =
    document.getElementById(targetId);

  const embedded =
    targetId === "homeSection";

  if (!embedded) {
    content.innerHTML = `
      <section class="management-page">

        <div class="management-toolbar">
          <div>
            <h2>Orders</h2>
            <p id="ordersSummary">
              Loading orders...
            </p>
          </div>
        </div>

        <div id="ordersContainer">
          <div class="management-loading">
            Loading orders...
          </div>
        </div>

      </section>
    `;
  } else {
    content.innerHTML = `
      <section class="management-page">

        <div class="home-list-heading">
          <div>
            <h2>Orders</h2>
            <p id="ordersSummary">
              Loading orders...
            </p>
          </div>
        </div>

        <div id="ordersContainer">
          <div class="management-loading">
            Loading orders...
          </div>
        </div>

      </section>
    `;
  }

  await loadOrders();
}

async function loadOrders() {

  const response =
    await apiGet("/admin/orders");

  if (!response.success) {
    throw new Error(
      response.message ||
      "Unable to load orders"
    );
  }

  orders = response.data || [];

  renderOrders();
}

function renderOrders() {

  const container =
    document.getElementById("ordersContainer");

  const summary =
    document.getElementById("ordersSummary");

  if (!container || !summary) return;

  summary.textContent =
    `Total active orders: ${orders.length}`;

  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-management">
        No active orders
      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="orders-table-wrap">

      <table class="management-table">

        <thead>
          <tr>
            <th>ORDER</th>
            <th>CUSTOMER</th>
            <th>STATUS</th>
            <th>DISPATCH</th>
            <th>RIDER</th>
            <th>AMOUNT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>

          ${orders.map(order => `
            <tr>

              <td>
                <strong>#${order.id}</strong>
                <small>
                  ${formatDate(order.created_at)}
                </small>
              </td>

              <td>
                ${escapeHtml(
                  order.customer_name ||
                  "Customer"
                )}
              </td>

              <td>
                <span class="status-badge">
                  ${escapeHtml(
                    order.status || "-"
                  )}
                </span>
              </td>

              <td>
                <span class="dispatch-badge">
                  ${escapeHtml(
                    order.dispatch_status || "-"
                  )}
                </span>
              </td>

              <td>
                ${
                  order.rider_name
                    ? escapeHtml(order.rider_name)
                    : `<span class="no-rider">
                         Not assigned
                       </span>`
                }
              </td>

              <td>
                <strong>
                  ₹${escapeHtml(
                    order.final_total || 0
                  )}
                </strong>
              </td>

              <td>
                <div class="action-buttons">

                  <button
                    class="small-btn"
                    onclick="viewAdminOrder(${order.id})">
                    VIEW
                  </button>

                  <button
                    class="small-btn assign-btn"
                    onclick="openRiderAssignment(${order.id})">
                    ASSIGN
                  </button>

                </div>
              </td>

            </tr>
          `).join("")}

        </tbody>

      </table>

    </div>
  `;
}

window.refreshOrders = async function() {
  try {
    await loadOrders();
  } catch (err) {
    alert(err.message);
  }
};

window.viewAdminOrder = async function(orderId) {

  const response =
    await apiGet(`/admin/orders/${orderId}`);

  if (!response.success) {
    alert(
      response.message ||
      "Unable to load order"
    );
    return;
  }

  renderOrderDetails(response.data);
};

function renderOrderDetails(order) {

  document.getElementById(
    "order-detail-modal"
  )?.remove();

  const modal =
    document.createElement("div");

  modal.id = "order-detail-modal";
  modal.className = "management-modal";

  modal.innerHTML = `
    <div class="modal-box">

      <div class="modal-header">
        <h3>Order #${order.id}</h3>

        <button
          class="modal-close"
          onclick="closeOrderModal()">
          ×
        </button>
      </div>

      <div class="order-detail-grid">

        <div>
          <label>Customer</label>
          <strong>
            ${escapeHtml(order.customer_name || "-")}
          </strong>
        </div>

        <div>
          <label>Mobile</label>
          <strong>
            ${escapeHtml(order.mobile || "-")}
          </strong>
        </div>

        <div>
          <label>Status</label>
          <strong>
            ${escapeHtml(order.status || "-")}
          </strong>
        </div>

        <div>
          <label>Dispatch Status</label>
          <strong>
            ${escapeHtml(order.dispatch_status || "-")}
          </strong>
        </div>

        <div>
          <label>Final Total</label>
          <strong>
            ₹${escapeHtml(order.final_total || 0)}
          </strong>
        </div>

        <div>
          <label>Created</label>
          <strong>
            ${formatDate(order.created_at)}
          </strong>
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);
}

window.closeOrderModal = function() {
  document.getElementById(
    "order-detail-modal"
  )?.remove();
};

window.openRiderAssignment =
  async function(orderId) {

    const response =
      await apiGet(
        `/admin/orders/${orderId}/riders`
      );

    if (!response.success) {
      alert(
        response.message ||
        "Unable to load riders"
      );
      return;
    }

    renderRiderAssignment(
      orderId,
      response.data || []
    );
  };

function renderRiderAssignment(
  orderId,
  riders
) {

  document.getElementById(
    "rider-assignment-modal"
  )?.remove();

  const modal =
    document.createElement("div");

  modal.id = "rider-assignment-modal";
  modal.className = "management-modal";

  modal.innerHTML = `
    <div class="modal-box">

      <div class="modal-header">
        <h3>
          Assign Rider — Order #${orderId}
        </h3>

        <button
          class="modal-close"
          onclick="closeRiderAssignment()">
          ×
        </button>
      </div>

      ${
        riders.length
          ? `
            <div class="rider-selection-list">

              ${riders.map(rider => `
                <button
                  class="rider-option"
                  onclick="confirmRiderAssignment(
                    ${orderId},
                    ${rider.id}
                  )">

                  <span>
                    <strong>
                      ${escapeHtml(
                        rider.name || "Rider"
                      )}
                    </strong>

                    <small>
                      Active items:
                      ${rider.active_items || 0}
                    </small>
                  </span>

                  <b>ASSIGN</b>

                </button>
              `).join("")}

            </div>
          `
          : `
            <div class="empty-management">
              No online riders available.
            </div>
          `
      }

    </div>
  `;

  document.body.appendChild(modal);
}

window.closeRiderAssignment =
  function() {
    document.getElementById(
      "rider-assignment-modal"
    )?.remove();
  };

window.confirmRiderAssignment =
  async function(orderId, riderId) {

    if (!confirm(
      `Assign rider to Order #${orderId}?`
    )) return;

    const response =
      await apiPost(
        "/admin/orders/assign",
        {
          order_id: orderId,
          rider_id: riderId
        }
      );

    if (!response?.success) {
      alert(
        response?.message ||
        "Unable to assign rider"
      );
      return;
    }

    closeRiderAssignment();

    if (window.adminHomeMode) {
      await window.refreshHomeSection();
    } else {
      await loadOrders();
    }
  };

function formatDate(value) {

  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
