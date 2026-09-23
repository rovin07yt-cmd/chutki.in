
export async function render() {

  const id = new URLSearchParams(window.location.search).get("id");
  console.log("EDIT FOOD ID:", id);

  if (!id) {
    document.getElementById("content").innerHTML = "Invalid food ID";
    return;
  }

  const res = await apiGet("/food/" + id);
  const f = res.data;

  document.getElementById("content").innerHTML = `
    <div class="card">

      <h3>Edit Food</h3>

      <input id="name" value="${f.name || ""}"><br><br>
      <input id="description" value="${f.description || ""}"><br><br>

      <select id="type">
        <option value="veg" ${f.type==="veg"?"selected":""}>Veg</option>
        <option value="nonveg" ${f.type==="nonveg"?"selected":""}>Non-Veg</option>
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
      <input id="mrp_half">
      <input id="price_half">

      <h4>Full Plate</h4>
      <input id="mrp_full">
      <input id="price_full">

      <input id="prep">

      <h4>Images</h4>
      <div class="img-grid">
        <div class="img-box" onclick="pick(1)"><input type="file" id="img1"></div>
        <div class="img-box" onclick="pick(2)"><input type="file" id="img2"></div>
        <div class="img-box" onclick="pick(3)"><input type="file" id="img3"></div>
        <div class="img-box" onclick="pick(4)"><input type="file" id="img4"></div>
        <div class="img-box" onclick="pick(5)"><input type="file" id="img5"></div>
      </div>

      <br><br>
      <button onclick="updateFood(${id})">Update</button>

    </div>
  `;

  // PREFILL
  setTimeout(() => {

    (f.categories || []).forEach(cat => {
      const el = document.querySelector(`#categories input[value="${cat}"]`);
      if (el) el.checked = true;
    });

    (f.prices || []).forEach(p => {
      if (p.type === "half") {
        document.getElementById("mrp_half").value = p.mrp || "";
        document.getElementById("price_half").value = p.price || "";
      }
      if (p.type === "full") {
        document.getElementById("mrp_full").value = p.mrp || "";
        document.getElementById("price_full").value = p.price || "";
      }
      document.getElementById("prep").value = p.prep_time || "";
    });

    // ✅ FIXED IMAGE LOAD
    if (f.images && f.images.length) {
      f.images.slice(-5).forEach((img, i) => {
        const box = document.querySelectorAll(".img-box")[i];
        if (box) {
          box.style.backgroundImage = `url(http://localhost:3000${img}?t=${Date.now()})`;
          box.style.backgroundSize = "cover";
          box.style.backgroundPosition = "center";
        }
      });
    }

  }, 50);
}


// PICK
window.pick = (i) => {
  document.getElementById("img"+i).click();
};


// UPDATE
window.updateFood = async (id) => {

  const categories = [...document.querySelectorAll("#categories input:checked")].map(c => c.value);

  const prices = [];

  if (document.getElementById("price_half").value) {
    prices.push({
      type: "half",
      mrp: Number(document.getElementById("mrp_half").value),
      price: Number(document.getElementById("price_half").value),
      prep_time: Number(document.getElementById("prep").value)
    });
  }

  prices.push({
    type: "full",
    mrp: Number(document.getElementById("mrp_full").value),
    price: Number(document.getElementById("price_full").value),
    prep_time: Number(document.getElementById("prep").value)
  });

  await apiPost("/food/update", {
    food_id: id,
    name: document.getElementById("name").value,
    description: document.getElementById("description").value,
    type: document.getElementById("type").value,
    categories,
    prices
  });

  await uploadImages(id);

  alert("Updated");
  loadPage("food");
};


// IMAGE UPLOAD
async function uploadImages(food_id) {

  const inputs = [1,2,3,4,5]
    .map(i => document.getElementById("img"+i)?.files[0])
    .filter(Boolean);

  if (inputs.length === 0) return true;

  const form = new FormData();
  inputs.forEach(f => form.append("images", f));
  form.append("food_id", food_id);

  const res = await fetch("http://localhost:3000/food-images/upload", {
    method: "POST",
    body: form,
    headers: {
      "x-user-id": session.getUserId(),
      "x-role": session.getRole()
    }
  });

  const data = await res.json();

  if (!data.success) {
    alert(data.message || "Upload failed");
    return false;
  }

  return true;
}


// PREVIEW
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

