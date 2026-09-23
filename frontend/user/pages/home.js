let allFoods = [];
let allRestaurants = [];
let pageHistory = [];


export async function render() {
  const container = document.getElementById("content");
const guestButtons = !localStorage.getItem("user") ? `
<button style="padding:6px 12px;border:none;border-radius:20px;background:#e53935;color:#fff;cursor:pointer;" onclick='location.href="/auth/login.html"'>Login</button>
<button style="padding:6px 12px;border:1px solid #e53935;border-radius:20px;background:#fff;color:#e53935;cursor:pointer;" onclick='location.href="/auth/register.html"'>Register</button>
` : "";


  container.innerHTML = `
    <div class="categories">
      <div class="category active" onclick="filter(event, 'food')">Food</div>
      <div class="category" onclick="filter(event, 'restaurant')">Restaurants</div>
      <div class="category" onclick="filter(event, 'veg')">Veg</div>
      <div class="category" onclick="filter(event, 'nonveg')">Non-Veg</div>
      <div class="category" onclick="filter(event, 'drinks')">Drinks</div>
      <div class="category" onclick="filter(event, 'desserts')">Desserts</div>
      <div class="category" onclick="filter(event, 'breakfast')">Breakfast</div>
      <div class="category" onclick="filter(event, 'lunch')">Lunch</div>
      <div class="category" onclick="filter(event, 'dinner')">Dinner</div>
    </div>

    <div style="position:relative;margin:10px 0;">
      <span style="position:absolute;left:12px;top:11px;font-size:18px;">🔍</span>
      <input id="search" placeholder="Search foods & restaurants..."
        style="width:100%;padding:10px 10px 10px 40px;border-radius:25px;border:1px solid #ddd;box-sizing:border-box;">
      <div id="searchSuggestions" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid #ddd;border-radius:12px;max-height:250px;overflow:auto;z-index:999;"></div>
    </div>

    <div class="food-grid" id="grid"></div>
  `;
  document.getElementById("guestActions").innerHTML = guestButtons;


  await loadData();
  renderFoods(allFoods);

  document.getElementById("search").addEventListener("input", handleSearch);
}

async function loadData() {
  const headers = {
    "x-user-id": localStorage.getItem("user_id"),
    "x-role": "user"
  };

  const foodRes = await fetch("http://localhost:3000/user/food", { headers });
  const restroRes = await fetch("http://localhost:3000/user/restaurants", { headers });

  const foodData = await foodRes.json();
  const restroData = await restroRes.json();

  allFoods = (foodData.data || []).sort((a,b) => Number(b.is_available) - Number(a.is_available));
  allRestaurants = (restroData.data || []).sort((a,b) => Number(b.is_online) - Number(a.is_online));
}

/* ================= FOOD ================= */
function renderFoods(list) {
  const grid = document.getElementById("grid");
  grid.classList.add("food-grid");
  grid.innerHTML = "";

  list.forEach(f => {
    const price = f.prices?.[0]?.price || 0;
    const mrp = f.prices?.[0]?.mrp || 0;
    const discount = mrp ? Math.round(((mrp - price)/mrp)*100) : 0;

    const images = (f.images && f.images.length)
      ? f.images.map(i => "http://localhost:3000" + i)
      : ["http://localhost:3000/uploads/default.jpg"];

    const card = document.createElement("div");
    card.className = f.is_available ? "food-card" : "food-card disabled";

    card.innerHTML = `
      <div class="slider" id="slider-${f.id}">
        ${images.map((img, i) => `
          <img src="${img}" class="slide ${i===0 ? 'active' : ''}">
        `).join("")}
        <div class="dots">
          ${images.map((_, i) => `
            <span class="dot ${i===0 ? 'active' : ''}" onclick="goSlide(${f.id}, ${i})"></span>
          `).join("")}
        </div>
      </div>

      <div class="food-body">
        <div class="food-name">${f.name}</div>
        <div class="food-price">
          <del>₹${mrp}</del> ₹${price} (${discount}%)
        </div>
        <div class="food-desc">${f.description || ''}</div>
        <div><small>${f.restaurant_name || ''}</small></div>
        ${!f.is_available ? '<div class="status-badge">Unavailable</div>' : ""}

        <div class="food-actions">
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();addToCart(${f.id})">Add</button>
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();orderNow(${f.id})">Order</button>
        </div>
      </div>
    `;

    card.onclick = () => viewFood(f.id);


    grid.appendChild(card);
    let current = 0;
    enableSwipe("slider-" + f.id,(dir)=>{
      current += dir;
      if(current < 0) current = images.length - 1;
      if(current >= images.length) current = 0;
      goSlide(f.id,current);
    });

  });
}

/* ================= RESTAURANTS ================= */
function renderRestaurants() {
  const grid = document.getElementById("grid");
  grid.classList.add("food-grid");
  grid.innerHTML = "";

  allRestaurants.forEach(r => {
    const img = r.image
      ? "http://localhost:3000" + (r.image.startsWith("/") ? r.image : "/uploads/" + r.image)
      : "http://localhost:3000/uploads/default.jpg";

    const card = document.createElement("div");
    card.className = r.is_online ? "restaurant-card" : "restaurant-card disabled";

    card.innerHTML = `
      <img src="${img}" />
      <div class="food-body">
        <div class="food-name">${r.name}</div>
        ${!r.is_online ? '<div class="status-badge">Offline</div>' : ""}
      </div>
    `;

    card.onclick = () => viewRestaurant(r.name);
    grid.appendChild(card);
  });
}

/* ================= VIEW FOOD ================= */
window.viewFood = function(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food) return;

  const restaurant = allRestaurants.find(r => r.name === food.restaurant_name);

  const images = (food.images && food.images.length)
    ? food.images.map(i => "http://localhost:3000" + i)
    : ["http://localhost:3000/uploads/default.jpg"];

  const price = food.prices?.[0]?.price || 0;
  const mrp = food.prices?.[0]?.mrp || 0;
  const discount = mrp ? Math.round(((mrp-price)/mrp)*100) : 0;

  const related = allFoods
    .filter(f => f.restaurant_name === food.restaurant_name && f.id !== food.id)
    .sort((a,b) => Number(b.is_available)-Number(a.is_available));

  const grid = document.getElementById("grid");
  grid.classList.remove("food-grid");
  pageHistory.push(() => viewRestaurant(food.restaurant_name));

  grid.innerHTML = `
      <button class="back-btn" onclick="goBackPage()">← Back</button>


    <div class="food-card food-detail-horizontal ${!food.is_available ? 'disabled' : ''}">
      <div class="slider" id="slider-main">
        ${images.map((img,i)=>`<img src="${img}" class="slide ${i===0 ? 'active' : ''}">`).join("")}
        <div class="dots">
          ${images.map((_,i)=>`<span class="dot ${i===0 ? 'active' : ''}" onclick="goSlideMain(${i})"></span>`).join("")}
        </div>
      </div>

      <div class="food-body">
        <div><small>${food.restaurant_name}</small></div>
        <div class="food-name">${food.name}</div>
        <div class="food-price"><del>₹${mrp}</del> ₹${price} (${discount}%)</div>
        <div class="food-desc">${food.description || ""}</div>
        ${!food.is_available ? '<div class="status-badge">Unavailable</div>' : ""}

        <div class="food-actions">
          <button ${!food.is_available ? 'disabled' : ''} onclick="addToCart(${food.id})">Add</button>
          <button ${!food.is_available ? 'disabled' : ''} onclick="orderNow(${food.id})">Order</button>
        </div>
      </div>
    </div>

    <h3 style="margin-top:15px;">More Items</h3>
    <div class="food-grid" id="related"></div>
  `;

  const rel = document.getElementById("related");
  let currentMain = 0;
  enableSwipe("slider-main",(dir)=>{
    currentMain += dir;
    if(currentMain < 0) currentMain = images.length - 1;
    if(currentMain >= images.length) currentMain = 0;
    goSlideMain(currentMain);
  });


  related.forEach(f => {
    const price = f.prices?.[0]?.price || 0;
    const mrp = f.prices?.[0]?.mrp || 0;
    const discount = mrp ? Math.round(((mrp-price)/mrp)*100) : 0;

    const images = (f.images && f.images.length)
      ? f.images.map(i => "http://localhost:3000" + i)
      : ["http://localhost:3000/uploads/default.jpg"];

    const div = document.createElement("div");
    div.className = f.is_available ? "food-card" : "food-card disabled";

    div.innerHTML = `
      <div class="slider" id="slider-related-${f.id}">
        ${images.map((img,i)=>`<img src="${img}" class="slide ${i===0 ? "active" : ""}">`).join("")}
        <div class="dots">
          ${images.map((_,i)=>`<span class="dot ${i===0 ? "active" : ""}" onclick="goRelatedSlide(${f.id},${i})"></span>`).join("")}
        </div>
      </div>

      <div class="food-body">
        <div class="food-name">${f.name}</div>
        <div class="food-price"><del>₹${mrp}</del> ₹${price} (${discount}%)</div>
        ${!f.is_available ? '<div class="status-badge">Unavailable</div>' : ""}
        <div class="food-actions">
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();addToCart(${f.id})">Add</button>
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();orderNow(${f.id})">Order</button>
        </div>

      </div>
    `;

    div.onclick = () => viewFood(f.id);

    rel.appendChild(div);
    let currentRelated = 0;
    enableSwipe("slider-related-" + f.id,(dir)=>{
      currentRelated += dir;
      if(currentRelated < 0) currentRelated = images.length - 1;
      if(currentRelated >= images.length) currentRelated = 0;
      goRelatedSlide(f.id,currentRelated);
    });

  });
};

/* ================= SLIDER ================= */
function enableSwipe(sliderId, callback){
  const slider = document.getElementById(sliderId);
  if(!slider) return;


  let startX = 0;

  slider.addEventListener("touchstart", e => {
    startX = e.changedTouches[0].clientX;
  }, {passive:true});

  slider.addEventListener("touchend", e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if(Math.abs(diff) < 40) return;

    console.log("SWIPE", sliderId, diff);
    callback(diff > 0 ? 1 : -1);
  }, {passive:true});
}

window.goSlide = function(id, index) {
  const slider = document.getElementById("slider-" + id);
  const slides = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
};

window.goSlideMain = function(index) {
  const slider = document.getElementById("slider-main");
  const slides = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
};

/* ================= FILTER ================= */
window.goRelatedSlide = function(id,index){
  const slider = document.getElementById("slider-related-" + id);
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
};

window.goBackPage = function(){
  const last = pageHistory.pop();
  if(last) last();
};

window.goRestaurantSlide = function(id,index){
  const slider = document.getElementById("slider-rest-" + id);
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  const dots = slider.querySelectorAll(".dot");

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
};

window.viewRestaurant = function(name) {
  const foods = allFoods.filter(f => f.restaurant_name === name).sort((a,b) => Number(b.is_available) - Number(a.is_available));
  if (!foods.length) return;

  const restaurant = allRestaurants.find(r => r.name === name);

  const grid = document.getElementById("grid");
  grid.classList.remove("food-grid");
  pageHistory.push(() => renderFoods(allFoods));


  grid.innerHTML = `
    <button class="back-btn" onclick="goBackPage()">← Back</button>

      <div class="restaurant-header">
        <img src="${restaurant?.image ? 'http://localhost:3000' + restaurant.image : 'http://localhost:3000/uploads/default.jpg'}">
        <div class="food-body">
          <h2>${name}</h2>
          ${restaurant && !restaurant.is_online ? '<div class="status-badge">Offline</div>' : ""}
        </div>
      </div>

    <h3>Available Items</h3>
    <div class="food-grid" id="available"></div>

    <h3 style="margin-top:15px;">Unavailable Items</h3>
    <div class="food-grid" id="unavailable"></div>
  `;

  const available = document.getElementById("available");
  const unavailable = document.getElementById("unavailable");

  foods.forEach(f => {
    const price = f.prices?.[0]?.price || 0;
    const mrp = f.prices?.[0]?.mrp || 0;
    const discount = mrp ? Math.round(((mrp-price)/mrp)*100) : 0;

    const images = (f.images && f.images.length)
      ? f.images.map(i => "http://localhost:3000" + i)
      : ["http://localhost:3000/uploads/default.jpg"];

    const div = document.createElement("div");
    div.className = f.is_available ? "food-card" : "food-card disabled";

    div.innerHTML = `
      <div class="slider" id="slider-rest-${f.id}">
        ${images.map((img,i)=>`<img src="${img}" class="slide ${i===0 ? "active" : ""}">`).join("")}
        <div class="dots">
          ${images.map((_,i)=>`<span class="dot ${i===0 ? "active" : ""}" onclick="goRestaurantSlide(${f.id},${i})"></span>`).join("")}
        </div>
      </div>

      <div class="food-body">
        <div class="food-name">${f.name}</div>
        <div class="food-price"><del>₹${mrp}</del> ₹${price} (${discount}%)</div>
        <div class="food-desc">${f.description || ""}</div>
        ${!f.is_available ? '<div class="status-badge">Unavailable</div>' : ""}

        <div class="food-actions">
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();addToCart(${f.id})">Add</button>
          <button ${!f.is_available ? "disabled" : ""} onclick="event.stopPropagation();orderNow(${f.id})">Order</button>
        </div>
      </div>
    `;


    div.onclick = () => viewFood(f.id);

    if (f.is_available) available.appendChild(div); else unavailable.appendChild(div);
    let currentRest = 0;
    enableSwipe("slider-rest-" + f.id,(dir)=>{
      currentRest += dir;
      if(currentRest < 0) currentRest = images.length - 1;
      if(currentRest >= images.length) currentRest = 0;
      goRestaurantSlide(f.id,currentRest);
    });

  });
};

window.filter = function(e, type) {
  document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
  e.target.classList.add("active");
  if (type === "restaurant") return renderRestaurants();
  if (type === "food") return renderFoods(allFoods);
  if (type === "veg") return renderFoods(allFoods.filter(f => f.type === "veg"));
  if (type === "nonveg") return renderFoods(allFoods.filter(f => f.type === "nonveg"));


  if (type === "drinks") {
    return renderFoods(allFoods.filter(f => (f.categories || []).includes("drinks")));
  }

  if (type === "desserts") {
    return renderFoods(allFoods.filter(f =>
      (f.categories || []).includes("dessert") || (f.categories || []).includes("sweets")
    ));
  }

  if (["breakfast","lunch","dinner"].includes(type)) {
    return renderFoods(allFoods.filter(f =>
      (f.categories || []).includes(type)
    ));
  }
};

/* ================= SEARCH ================= */
function handleSearch(e){
const value=e.target.value.trim().toLowerCase();
const box=document.getElementById("searchSuggestions");
if(!value){box.style.display="none";box.innerHTML="";return;}
const foods=[...new Set(allFoods.map(f=>f.name))]
.filter(name=>name.toLowerCase().includes(value))
.sort((a,b)=>{
const aa=a.toLowerCase();
const bb=b.toLowerCase();
const aStarts=aa.startsWith(value);
const bStarts=bb.startsWith(value);
if(aStarts&&!bStarts)return -1;
if(!aStarts&&bStarts)return 1;
return aa.localeCompare(bb);
});
const restaurants=[...new Set(allRestaurants.map(r=>r.name))]
.filter(name=>name.toLowerCase().includes(value))
.sort((a,b)=>{
const aa=a.toLowerCase();
const bb=b.toLowerCase();
const aStarts=aa.startsWith(value);
const bStarts=bb.startsWith(value);
if(aStarts&&!bStarts)return -1;
if(!aStarts&&bStarts)return 1;
return aa.localeCompare(bb);
});
let html="";
foods.slice(0,10).forEach(name=>{
html+=`<div class="search-item" onclick="selectSearch('${name}')" style="padding:10px;border-bottom:1px solid #eee;cursor:pointer;">🍔 ${name}</div>`;
});
restaurants.slice(0,10).forEach(name=>{
html+=`<div class="search-item" onclick="selectRestaurant('${name}')" style="padding:10px;border-bottom:1px solid #eee;cursor:pointer;">🏪 ${name}</div>`;
});
box.innerHTML=html;
box.style.display=html?"block":"none";
}
window.selectSearch=function(name){
const search=document.getElementById("search");
const box=document.getElementById("searchSuggestions");
search.value=name;
box.style.display="none";
document.addEventListener("click",(e)=>{
const search=document.getElementById("search");
const box=document.getElementById("searchSuggestions");
if(!search || !box) return;
if(!search.contains(e.target) && !box.contains(e.target)){
box.style.display="none";
}
});
box.innerHTML="";
search.blur();
renderFoods(allFoods.filter(f=>f.name.toLowerCase()===name.toLowerCase()));
};
window.selectRestaurant=function(name){
const search=document.getElementById("search");
const box=document.getElementById("searchSuggestions");
search.value=name;
box.style.display="none";
box.innerHTML="";
search.blur();
viewRestaurant(name);
};

/* ================= CART ================= */
window.addToCart = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const item = cart.find(i => i.food_id === id);
  if (item) item.quantity++;
  else cart.push({ food_id: id, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
};

window.orderNow = function(id) {
  addToCart(id);
  loadPage("cart");
};
