export default async function(content){

  const res =
    await apiGet("/rider-order-history");

  const orders =
    res.data || [];

  const totalCod =
    orders.reduce(
      (sum,o) =>
        sum + Number(o.cod_collected || 0),
      0
    );

  const returnedCount =
    orders.filter(
      o => o.status === "Returned"
    ).length;

  content.innerHTML = `

    <div class="history-page">

      <div class="history-summary">

        <div class="history-stat">
          <div class="history-stat-value">
            ${orders.length}
          </div>
          <div class="history-stat-label">
            Completed
          </div>
        </div>

        <div class="history-stat">
          <div class="history-stat-value">
            ₹${totalCod}
          </div>
          <div class="history-stat-label">
            COD Collected
          </div>
        </div>

        <div class="history-stat">
          <div class="history-stat-value">
            ${returnedCount}
          </div>
          <div class="history-stat-label">
            Returned
          </div>
        </div>

      </div>
      <div class="history-filters">
        <button class="history-filter active" id="allBtn">All</button>
        <button class="history-filter" id="todayBtn">Today</button>
        <button class="history-filter" id="weekBtn">Week</button>
        <button class="history-filter" id="monthBtn">Month</button>
      </div>


      <div class="history-table-wrapper">

        <table class="history-table">

          <thead>
            <tr>
              <th>S.No</th>
              <th>Order ID</th>
              <th>Restaurants</th>
              <th>COD</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody id="historyBody"></tbody>

        </table>

      </div>

    </div>
  `;

  const body =
    document.getElementById(
      "historyBody"
    );

  if(!orders.length){

    body.innerHTML = `
      <tr>
        <td colspan="5">
          No order history found
        </td>
      </tr>
    `;

    return;
  }

  body.innerHTML =
    orders.map(o => `

      <tr>

        <td>${o.serial_no}</td>

        <td>#${o.order_id}</td>

        <td>${o.restaurants}</td>

        <td>₹${o.cod_collected}</td>

        <td>
          <span class="
            ${o.status === "Delivered"
              ? "delivered-badge"
              : "returned-badge"}
          ">
            ${o.status}
          </span>
        </td>

      </tr>

    `).join("");

  const activate = (id) => {
    document.querySelectorAll(".history-filter")
      .forEach(b => b.classList.remove("active"));

    document.getElementById(id)
      .classList.add("active");
  };

  document.getElementById("allBtn").onclick = () => {
    activate("allBtn");
    location.reload();
  };

  document.getElementById("todayBtn").onclick = () => {
    activate("todayBtn");

    const today = new Date();

    body.innerHTML = orders
      .filter(o => true)
      .map(o => `
      <tr>
        <td>${o.serial_no}</td>
        <td>#${o.order_id}</td>
        <td>${o.restaurants}</td>
        <td>₹${o.cod_collected}</td>
        <td><span class="${o.status==="Delivered"?"delivered-badge":"returned-badge"}">${o.status}</span></td>
      </tr>`).join("");
  };

  document.getElementById("weekBtn").onclick = () => {
    activate("weekBtn");
  };

  document.getElementById("monthBtn").onclick = () => {
    activate("monthBtn");
  };


}
