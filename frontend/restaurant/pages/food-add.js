export function render() {

  document.getElementById("content").innerHTML = `
    <div class="card">

      <h3>Add Food</h3>

      <input id="name" placeholder="FOOD NAME"><br><br>
      <input id="description" placeholder="Description"><br><br>

      <select id="type">
        <option value="veg">Veg</option>
        <option value="nonveg">Non-Veg</option>
      </select><br><br>

      <div id="categories">
        <label><input type="checkbox" value="breakfast"> Breakfast</label>
        <label><input type="checkbox" value="lunch"> Lunch</label>
        <label><input type="checkbox" value="dinner"> Dinner</label>
        <label><input type="checkbox" value="snacks"> Snacks</label>
        <label><input type="checkbox" value="sweets"> Sweets</label>
        <label><input type="checkbox" value="dessert"> Dessert</label>
        <label><input type="checkbox" value="drinks"> Drinks</label>
      </div>

      <h4>Half Plate</h4>
      <input id="mrp_half" placeholder="MRP">
      <input id="price_half" placeholder="Price">

      <h4>Full Plate</h4>
      <input id="mrp_full" placeholder="MRP">
      <input id="price_full" placeholder="Price">

      <input id="prep" placeholder="Prep Time">

      <h4>Images (Min 3 required)</h4>
      <div class="img-grid">
        <div class="img-box" onclick="pick(1)">MAIN<input type="file" id="img1"></div>
        <div class="img-box" onclick="pick(2)"><input type="file" id="img2"></div>
        <div class="img-box" onclick="pick(3)"><input type="file" id="img3"></div>
        <div class="img-box" onclick="pick(4)"><input type="file" id="img4"></div>
        <div class="img-box" onclick="pick(5)"><input type="file" id="img5"></div>
      </div>

      <br><br>
      <button onclick="submitFood()">Add</button>

    </div>
  `;

  // AUTO UPPERCASE
  setTimeout(() => {
    const nameInput = document.getElementById("name");
    if (nameInput) {
      nameInput.addEventListener("input", () => {
        nameInput.value = nameInput.value.toUpperCase();
      });
    }
  }, 50);
}


// 📸 PICK IMAGE
window.pick = (i) => {
  document.getElementById("img" + i).click();
};


// 🖼 PREVIEW
document.addEventListener("change", (e) => {
  if (e.target.type === "file") {
    const parent = e.target.closest(".img-box");
    const file = e.target.files[0];

    if (file && parent) {
      parent.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
      parent.style.backgroundSize = "cover";
      parent.style.backgroundPosition = "center";
    }
  }
});


// 🚀 SUBMIT FOOD
window.submitFood = async () => {

  const name = document.getElementById("name").value.trim();
  if (!name) return alert("Name required");

  const categories = [...document.querySelectorAll("#categories input:checked")].map(c => c.value);

  if (!categories.length) return alert("Select at least one category");

  const prep = Number(document.getElementById("prep").value);

  const prices = [];

  if (document.getElementById("price_half").value) {
    prices.push({
      type: "half",
      mrp: Number(document.getElementById("mrp_half").value),
      price: Number(document.getElementById("price_half").value),
      prep_time: prep
    });
  }

  prices.push({
    type: "full",
    mrp: Number(document.getElementById("mrp_full").value),
    price: Number(document.getElementById("price_full").value),
    prep_time: prep
  });

  const res = await apiPost("/food/add", {
    name: name.toUpperCase(),
    description: document.getElementById("description").value,
    type: document.getElementById("type").value,
    categories,
    prices
  });

  if (!res || res.success === false) {
    alert(res?.message || "Error adding food");
    return;
  }

  const food_id = res.data.food_id || res.data.id;

  const ok = await uploadImages(food_id);

  if (ok !== false) {
    alert("Food Added");
    loadPage("food");
  }
};


// 📤 UPLOAD IMAGES
async function uploadImages(food_id) {

  const files = [1,2,3,4,5]
    .map(i => document.getElementById("img"+i).files[0])
    .filter(Boolean);

  if (files.length < 3) {
    alert("Minimum 3 images required");
    return false;
  }

  const form = new FormData();
  files.forEach(f => form.append("images", f));
  form.append("food_id", food_id);

  try {
    const res = await fetch("http://localhost:3000/food-images/upload", {
      method: "POST",
      body: form,
      headers: {
        "x-user-id": session.getUserId(),
        "x-role": session.getRole()
      }
    });

    const data = await res.json();
    console.log("UPLOAD RESPONSE:", data);

    if (!data.success) { alert(data.message || "Upload failed"); return false; }

    return true;

  } catch (err) {
    console.error("Upload failed:", err);
    alert("Image upload failed");
    return false;
  }
}
