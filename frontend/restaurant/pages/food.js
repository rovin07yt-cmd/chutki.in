export async function render() {

  document.getElementById("content").innerHTML = `
    <div class="food-page">

      <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
        <h3>Food Items</h3>
        <button onclick="goAddFood()">+ Add Food</button>
      </div>

      <div id="foodList" class="food-grid">Loading...</div>

    </div>
  `;

  loadFoods();
}

async function loadFoods() {
  const res = await apiGet("/food/list");
  const foods = res.data || [];

  if (!foods.length) {
    document.getElementById("foodList").innerHTML =
      `<div class="empty">No food items</div>`;
    return;
  }

  document.getElementById("foodList").innerHTML =
    foods.map(f => card(f)).join("");
}

function card(f) {
  return `
  <div class="food-card">

    <img src="${f.main_image ? ('http://localhost:3000' + f.main_image) : 'http://localhost:3000/uploads/default.png'}" class="food-img" />

    <div class="food-body">

      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="food-title">${f.name}</div>
        <label class="switch">
          <input type="checkbox" ${f.is_available ? "checked" : ""} onchange="toggleFood(${f.id}, this.checked)">
          <span class="slider"></span>
        </label>
      </div>

      <div class="food-price">
        ${(f.prices || []).map(p => `₹${p.price}`).join(" / ")}
      </div>

      <div class="food-actions">
        <button onclick="editFood(${f.id})">Edit</button>
        <button onclick="deleteFood(${f.id})">Delete</button>
      </div>

    </div>

  </div>
  `;
}

window.deleteFood = async (id) => {
  if (!confirm("Delete this item?")) return;

  await apiPost("/food/delete", { food_id: id });
  loadFoods();
};

window.editFood = (id) => {
  window.history.pushState({}, "", "?id=" + id);
loadPage("food-edit");
};

window.goAddFood = () => {
  loadPage("food-add");
};
