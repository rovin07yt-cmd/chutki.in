let orders = [];
let currentOrderFilter = "active";
let currentDateFilter = "all";
let customOrderDate = "";
let customOrderMonth = "";

export async function render(targetId = "content") {
  const content = document.getElementById(targetId);
  const embedded = targetId === "homeSection";

  content.innerHTML = `
    <section class="management-page">
      <div class="${embedded ? "home-list-heading" : "management-toolbar"}">
        <div>
          <h2>Orders</h2>
          <p id="ordersSummary">Loading orders...</p>
        </div>
      </div>

      <div class="orders-filter-bar">
        <select id="adminOrderCategory"
                class="admin-order-select"
                onchange="changeAdminOrderFilter(this.value)">
          <option value="active">Active Orders (0)</option>
          <option value="cancelled">Cancelled (0)</option>
          <option value="delivered">Delivered (0)</option>
          <option value="all">All (0)</option>
        </select>

        <select id="adminOrderDateFilter"
                class="admin-order-select"
                onchange="changeAdminOrderDateFilter(this.value)"
                hidden>
          <option value="all">All Dates</option>
          <option value="all">All Dates</option>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="custom">Select Date</option>
          <option value="month">Select Month</option>
        </select>

        <input id="adminOrderCustomDate"
               class="admin-order-date"
               type="date"
               aria-label="Choose order date"
               onchange="changeAdminOrderCustomDate(this.value)"
               hidden>
      </div>


        <input id="adminOrderCustomMonth"
               class="admin-order-date"
               type="month"
               aria-label="Choose order month"
               onchange="changeAdminOrderCustomMonth(this.value)"
               hidden>

      <div id="ordersContainer">
        <div class="management-loading">Loading orders...</div>
      </div>
    </section>
  `;

  await loadOrders();
}

async function loadOrders() {
  const response = await apiGet("/admin/orders");

  if (!response.success) {
    throw new Error(response.message || "Unable to load orders");
  }

  orders = response.data || [];
  renderOrders();
}

function isCancelledOrder(order) {
  return [
    "cancelled",
    "cancelled_returned",
    "returned"
  ].includes(String(order.status || "").toLowerCase()) ||
  [
    "on_the_way_return",
    "returned"
  ].includes(String(order.dispatch_status || "").toLowerCase());
}

function isDeliveredOrder(order) {
  return !isCancelledOrder(order) &&
    (
      String(order.status || "").toLowerCase() === "delivered" ||
      String(order.dispatch_status || "").toLowerCase() === "delivered"
    );
}

function isActiveOrder(order) {
  return !isCancelledOrder(order) && !isDeliveredOrder(order);
}

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function matchesSelectedDate(order) {
  const created = new Date(order.created_at);
  if (Number.isNaN(created.getTime())) return false;

  if (currentDateFilter === "today") {
    return localDateString(created) === localDateString(new Date());
  }

  if (currentDateFilter === "custom") {
    return Boolean(customOrderDate) &&
      localDateString(created) === customOrderDate;
  }

  if (currentDateFilter === "month") {
    if (!customOrderMonth) return false;
    const [year, month] = customOrderMonth.split("-").map(Number);
    return created.getFullYear() === year &&
      created.getMonth() === month - 1;
  }

  return true;
}

function getCategoryOrders(category) {
  if (category === "active") return orders.filter(isActiveOrder);
  if (category === "cancelled") return orders.filter(isCancelledOrder);
  if (category === "delivered") return orders.filter(isDeliveredOrder);
  return orders;
}

function getDateScopedOrders(category) {
  const categoryOrders = getCategoryOrders(category);

  return category === "active"
    ? categoryOrders
    : categoryOrders.filter(matchesSelectedDate);
}

function getFilteredOrders() {
  return getDateScopedOrders(currentOrderFilter);
}

window.changeAdminOrderFilter = function(filter) {
  currentOrderFilter = filter;

  const dateSelect = document.getElementById("adminOrderDateFilter");
  const dateInput = document.getElementById("adminOrderCustomDate");
  const monthInput = document.getElementById("adminOrderCustomMonth");

  if (dateSelect) dateSelect.hidden = filter === "active";
  if (dateInput) {
    dateInput.hidden =
      filter === "active" || currentDateFilter !== "custom";
  }
  if (monthInput) {
    monthInput.hidden =
      filter === "active" || currentDateFilter !== "month";
  }

  renderOrders();
};

window.changeAdminOrderDateFilter = function(filter) {
  currentDateFilter = filter;

  const dateInput = document.getElementById("adminOrderCustomDate");
  const monthInput = document.getElementById("adminOrderCustomMonth");

  if (dateInput) {
    dateInput.hidden =
      currentOrderFilter === "active" || filter !== "custom";
  }
  if (monthInput) {
    monthInput.hidden =
      currentOrderFilter === "active" || filter !== "month";
  }

  renderOrders();
};

window.changeAdminOrderCustomDate = function(date) {
  customOrderDate = date;
  renderOrders();
};

window.changeAdminOrderCustomMonth = function(month) {
  customOrderMonth = month;
  renderOrders();
};

function renderOrders() {
  const container = document.getElementById("ordersContainer");
  const summary = document.getElementById("ordersSummary");
  if (!container || !summary) return;

  const counts = {
    active: getCategoryOrders("active").length,
    cancelled: getDateScopedOrders("cancelled").length,
    delivered: getDateScopedOrders("delivered").length,
    all: getDateScopedOrders("all").length
  };

  const categorySelect = document.getElementById("adminOrderCategory");
  if (categorySelect) {
    categorySelect.options[0].text = `Active Orders (${counts.active})`;
    categorySelect.options[1].text = `Cancelled (${counts.cancelled})`;
    categorySelect.options[2].text = `Delivered (${counts.delivered})`;
    categorySelect.options[3].text = `All (${counts.all})`;
    categorySelect.value = currentOrderFilter;
  }

  const dateSelect = document.getElementById("adminOrderDateFilter");
  if (dateSelect) dateSelect.value = currentDateFilter;

  const monthInput = document.getElementById("adminOrderCustomMonth");
  if (monthInput && customOrderMonth) monthInput.value = customOrderMonth;

  const filteredOrders = getFilteredOrders();
  const names = {
    active: "Active Orders",
    cancelled: "Cancelled",
    delivered: "Delivered",
    all: "All Orders"
  };
  const dateNames = {
    all: "All",
    today: "Today",
    custom: customOrderDate || "Select Date",
    month: customOrderMonth || "Select Month"
  };

  summary.textContent =
    `${filteredOrders.length} ${names[currentOrderFilter]}` +
    (currentOrderFilter === "active"
      ? ""
      : ` · ${dateNames[currentDateFilter]}`);

  if (!filteredOrders.length) {
    container.innerHTML = `
      <div class="empty-management">
        No ${names[currentOrderFilter]} found for the selected date.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="admin-orders-cards">
      ${filteredOrders.map(order => {
        const canCancel =
          !isDeliveredOrder(order) &&
          !isCancelledOrder(order) &&
          order.dispatch_status !== "returned";

        const orderStatus = escapeHtml(order.status || "-");
        const dispatchStatus = escapeHtml(order.dispatch_status || "-");
        const riderStatus = order.rider_name
          ? `Assigned · ${escapeHtml(order.rider_name)}`
          : "Not assigned";

        return `
          <article class="admin-order-card"
                   role="button"
                   tabindex="0"
                   aria-label="View order ${order.id}"
                   onclick="viewAdminOrder(${order.id})"
                   onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewAdminOrder(${order.id})}">

            <div class="admin-order-grid">
              <div class="admin-order-id">
                <span class="admin-order-label">Order ID</span>
                <strong>#${escapeHtml(order.id)}</strong>
                <small>${escapeHtml(new Date(order.created_at).toLocaleTimeString([], {
                  hour: "numeric", minute: "2-digit", hour12: true
                }))}</small>
                <span class="admin-order-label">Amount</span>
                <strong>₹${escapeHtml(order.final_total || 0)}</strong>
              </div>

              <div class="admin-order-customer">
                <span class="admin-order-label">Customer</span>
                <strong>${escapeHtml(order.customer_name || "Customer")}</strong>
              </div>

              <div class="admin-order-status-stack">
                <span class="admin-order-label admin-status-heading">Status</span>
                <div><span>O:</span> <strong>${orderStatus}</strong></div>
                <div><span>D:</span> <strong>${dispatchStatus}</strong></div>
                <div><span>R:</span> <strong>${riderStatus}</strong></div>
              </div>
            </div>

            <div class="admin-order-actions">
              <button class="small-btn"
                onclick="event.stopPropagation();deleteAdminOrder(${order.id})">DELETE</button>

              ${canCancel ? `<button class="small-btn"
                onclick="event.stopPropagation();cancelAdminOrder(${order.id})">CANCEL</button>` : ""}

              <button class="small-btn assign-btn"
                onclick="event.stopPropagation();openRiderAssignment(${order.id})">ASSIGN</button>

              <button class="small-btn"
                onclick="event.stopPropagation();viewAdminOrder(${order.id})">VIEW</button>
            </div>
          </article>
        `;
      }).join("")}
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

  const restaurants =
    Array.isArray(order.restaurants)
      ? order.restaurants
      : [];

  const modal =
    document.createElement("div");

  modal.id = "order-detail-modal";
  modal.className =
    "management-modal admin-order-detail-modal";

  modal.innerHTML = `
    <div class="modal-box admin-order-modal-box">

      <div class="modal-header">

        <h3>
          Order #${order.id}
        </h3>

        <button
          class="modal-close"
          onclick="closeOrderModal()">
          ×
        </button>

      </div>

      <div class="admin-order-detail-content">

        <!-- CUSTOMER -->

        <section class="admin-order-section">

          <h4>Customer</h4>

          <div class="contact-row">

            <div>
              <strong>
                ${escapeHtml(
                  order.customer_name || "-"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  order.customer_gmail || ""
                )}
              </small>
            </div>

            ${
              order.customer_mobile
                ? `
                  <a
                    class="admin-call-btn"
                    href="tel:${escapeHtml(
                      order.customer_mobile
                    )}">
                    CALL
                  </a>
                `
                : ""
            }

          </div>

        </section>


        <!-- RESTAURANTS -->

        <section class="admin-order-section">

          <h4>Restaurants</h4>

          ${
            restaurants.length
              ? restaurants.map(restaurant => {

                  const items =
                    Array.isArray(restaurant.items)
                      ? restaurant.items
                      : [];

                  return `
                    <div class="admin-restaurant-block">

                      <div class="admin-restaurant-header">

                        <div>
                          <strong>
                            ${escapeHtml(
                              restaurant.name || "Restaurant"
                            )}
                          </strong>

                          <small>
                            Status:
                            ${escapeHtml(
                              restaurant.status || "-"
                            )}
                          </small>
                        </div>

                        ${
                          restaurant.mobile
                            ? `
                              <a
                                class="admin-call-btn"
                                href="tel:${escapeHtml(
                                  restaurant.mobile
                                )}">
                                CALL
                              </a>
                            `
                            : ""
                        }

                      </div>

                      <div class="admin-order-items">

                        ${
                          items.length
                            ? items.map(item => `
                                <div class="admin-order-item">

                                  <div>
                                    <strong>
                                      ${escapeHtml(
                                        item.name || "Item"
                                      )}
                                    </strong>

                                    ${
                                      item.prep_time
                                        ? `
                                          <small>
                                            Prep:
                                            ${escapeHtml(
                                              item.prep_time
                                            )} min
                                          </small>
                                        `
                                        : ""
                                    }
                                  </div>

                                  <div class="admin-item-quantity">
                                    ×${escapeHtml(
                                      item.quantity || 0
                                    )}
                                  </div>

                                  <div class="admin-item-price">
                                    ₹${escapeHtml(
                                      item.price || 0
                                    )}
                                  </div>

                                </div>
                              `).join("")
                            : `
                              <div class="admin-no-items">
                                No items
                              </div>
                            `
                        }

                      </div>

                    </div>
                  `;
                }).join("")
              : `
                <div class="admin-no-items">
                  No restaurant information
                </div>
              `
          }

        </section>


        <!-- RIDER -->

        <section class="admin-order-section">

          <h4>Assigned Rider</h4>

          ${
            order.rider_name
              ? `
                <div class="assigned-rider-card">

                  <div>
                    <strong>
                      ${escapeHtml(order.rider_name)}
                    </strong>

                    <small>
                      ${escapeHtml(
                        order.rider_mobile || ""
                      )}
                    </small>
                  </div>

                  <div class="action-buttons">

                    ${
                      order.rider_mobile
                        ? `
                          <a
                            class="admin-call-btn"
                            href="tel:${escapeHtml(
                              order.rider_mobile
                            )}">
                            CALL
                          </a>
                        `
                        : ""
                    }

                    <button
                      class="small-btn"
                      onclick="changeOrderRider(${order.id})">
                      CHANGE
                    </button>

                  </div>

                </div>
              `
              : `
                <div class="unassigned-rider-box">

                  <span>
                    No rider assigned
                  </span>

                  <button
                    class="small-btn"
                    onclick="changeOrderRider(${order.id})">
                    ASSIGN RIDER
                  </button>

                </div>
              `
          }

        </section>


        <!-- ORDER INFORMATION -->

        <section class="admin-order-section">

          <h4>Order Information</h4>

          <div class="admin-order-info-grid">

            <div>
              <label>Status</label>
              <strong>
                ${escapeHtml(order.status || "-")}
              </strong>
            </div>

            <div>
              <label>Dispatch Status</label>
              <strong>
                ${escapeHtml(
                  order.dispatch_status || "-"
                )}
              </strong>
            </div>

            <div>
              <label>Final Total</label>
              <strong>
                ₹${escapeHtml(order.final_total || 0)}
              </strong>
            </div>

            <div>
              <label>Delivery Charge</label>
              <strong>
                ₹${escapeHtml(order.delivery_charge || 0)}
              </strong>
            </div>

            <div>
              <label>Extra Charge</label>
              <strong>
                ₹${escapeHtml(order.extra_charge || 0)}
              </strong>
            </div>

            <div>
              <label>Created</label>
              <strong>
                ${formatDate(order.created_at)}
              </strong>
            </div>

          </div>

        </section>


        <!-- ACTIONS -->

        <section class="admin-order-modal-actions">

          ${
            order.status !== "delivered" &&
            order.status !== "cancelled" &&
            order.status !== "returned"
            && order.dispatch_status !== "returned"
              ? `
                <button
                  class="admin-cancel-btn"
                  onclick="cancelAdminOrder(${order.id}, true)">
                  CANCEL ORDER
                </button>
              `
              : ""
          }

          <button
            class="admin-delete-btn"
            onclick="deleteAdminOrder(${order.id})">
            DELETE ORDER
          </button>

        </section>

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

window.cancelAdminOrder = async function(
  orderId,
  fromModal = false
) {

  if (!confirm(
    `Cancel Order #${orderId}?`
  )) {
    return;
  }

  const response =
    await apiPost(
      "/admin/orders/cancel",
      {
        order_id: orderId
      }
    );

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to cancel order"
    );
    return;
  }

  if (fromModal) {
    closeOrderModal();
  }

  if (window.adminHomeMode) {
    await window.refreshHomeSection();
  } else {
    await loadOrders();
  }

  alert(`Order #${orderId} cancelled.`);
};

window.deleteAdminOrder = async function(orderId) {

  if (!confirm(
    `DELETE Order #${orderId} permanently?\n\nThis cannot be undone.`
  )) {
    return;
  }

  const response =
    await apiDelete(
      `/admin/orders/${orderId}`
    );

  if (!response?.success) {
    alert(
      response?.message ||
      "Unable to delete order"
    );
    return;
  }

  closeOrderModal();

  if (window.adminHomeMode) {
    await window.refreshHomeSection();
  } else {
    await loadOrders();
  }

  alert(`Order #${orderId} deleted.`);
};

window.changeOrderRider = async function(orderId) {

  closeOrderModal();

  await openRiderAssignment(orderId);
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

  modal.id =
    "rider-assignment-modal";

  modal.className =
    "management-modal";

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
                      ${escapeHtml(
                        rider.active_items || 0
                      )}
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
    )) {
      return;
    }

    const response =
      await apiPost(
        "/admin/orders/assign",
        {
          order_id: orderId,
          rider_id: riderId
        }
      );

    if (!respons?.success) {
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
