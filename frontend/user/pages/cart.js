export async function render() {

  const content = document.getElementById("content");

  const cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
  );

  if (!cart.length) {
    content.innerHTML = `
      <div class="cart-box">
        <h3>Cart Empty</h3>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div id="cartContainer">
      Loading...
    </div>
  `;

  try {

    const res = await fetch(
      "http://localhost:3000/user/cart/summary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cart
        })
      }
    );

    const data = await res.json();

    if (!data.success) {
      content.innerHTML = `
        <div class="cart-box">
          ${data.message}
        </div>
      `;
      return;
    }

    const s = data.data;

    document.getElementById("cartContainer").innerHTML = `
      <div class="cart-box">

        <h3>My Cart</h3>

        ${s.items.map(i => `
            <div class="cart-item">
              <div>
                ${i.name}<br>
                <button onclick="changeQty(${i.food_id},-1)">-</button>
                ${i.quantity}
                <button onclick="changeQty(${i.food_id},1)">+</button>
              </div>
            <div>
              ₹${i.price * i.quantity}
            </div>
          </div>

          <button
            onclick="removeCartItem(${i.food_id})"
            style="
              margin-bottom:10px;
              border:none;
              padding:6px 10px;
              border-radius:6px;
              cursor:pointer;
            ">
            Remove
          </button>
        `).join("")}

        <div class="cart-total">

          <div class="cart-item">
            <span>Items Total</span>
            <span>₹${s.total_price}</span>
          </div>

          <div class="cart-item">
            <span>Discount</span>
            <span>-₹${s.discount}</span>
          </div>

          <div class="cart-item">
            <span>Delivery Charge</span>
            <span>₹${s.delivery_charge}</span>
          </div>

          ${s.extra_charge > 0 ? `
          <div class="cart-item">
            <span>Extra Restaurant Charge</span>
            <span>₹${s.extra_charge}</span>
          </div>
          ` : ""}

          ${s.gst > 0 ? `
          <div class="cart-item">
            <span>GST</span>
            <span>₹${s.gst}</span>
          </div>
          ` : ""}

          <div class="cart-item">
            <strong>Final Total</strong>
            <strong>₹${s.final_total}</strong>
          </div>

          <div id="selectedAddressBox" style="margin-top:15px;"></div>


        </div>

        <button
          class="order-btn"
          onclick="placeOrder()">
          Place Order
        </button>

      </div>
    `;

      const selectedAddressId = localStorage.getItem("selected_address_id");
      const selectedAddressLabel = localStorage.getItem("selected_address_label");

      document.getElementById("selectedAddressBox").innerHTML = selectedAddressId
      ? `<div onclick="loadPage('address')" style="padding:12px;border:1px solid #ddd;border-radius:10px;background:#fff;cursor:pointer;font-weight:600;">📍 ${selectedAddressLabel || "Address"} <span style="float:right;color:#e53935;">Change →</span></div>`
      : `<div onclick="loadPage('address')" style="padding:12px;border:1px solid #f44336;border-radius:10px;background:#fff3f3;color:#f44336;cursor:pointer;font-weight:600;">📍 Select Delivery Address →</div>`;


  } catch (err) {

    content.innerHTML = `
      <div class="cart-box">
        ${err.message}
      </div>
    `;
  }
}

window.removeCartItem = function(food_id) {

  let cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
  );

  cart = cart.filter(
    i => i.food_id !== food_id
  );

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  render();
};

window.changeQty = function(food_id, delta) {

  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const item = cart.find(i => i.food_id === food_id);

  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.food_id !== food_id);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  render();
};
window.placeOrder = async function() {

  const user = localStorage.getItem("user");

  if (!user) {
    location.href = "/auth/login.html";
    return;
  }

  const addressId = localStorage.getItem("selected_address_id");

  if (!addressId) {
    loadPage("address");
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const res = await apiPost("/user/order/place", {
    address_id: Number(addressId),
    items: cart
  });

  if (!res.success) {
    alert(res.message);
    return;
  }

  localStorage.removeItem("cart");
  localStorage.removeItem("selected_address_id");
  localStorage.removeItem("selected_address_label");

  alert("Order #" + res.data.order_id + " placed successfully");

  loadPage("orders");
};
