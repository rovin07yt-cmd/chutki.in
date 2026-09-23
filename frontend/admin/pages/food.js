let adminFoods = [];
let adminRestaurants = [];
let selectedRestaurant = "";

export async function render(targetId = "content") {
  const container = document.getElementById(targetId);

  if (!container) return;

  const [foodsResponse, restaurantsResponse] =
    await Promise.all([
      apiGet("/admin/foods"),
      apiGet("/admin/restaurants")
    ]);

  if (!foodsResponse.success) {
    showError(
      targetId,
      foodsResponse.message ||
      "Unable to load food items"
    );
    return;
  }

  adminFoods = foodsResponse.data || [];

  adminRestaurants =
    restaurantsResponse.success
      ? (restaurantsResponse.data || [])
      : [];

  renderFoodPage(targetId);
}

function renderFoodPage(targetId = "content") {
  const container =
    document.getElementById(targetId);

  if (!container) return;

  const filteredFoods =
    selectedRestaurant
      ? adminFoods.filter(
          f =>
            String(f.restaurant_id) ===
            String(selectedRestaurant)
        )
      : adminFoods;

  const available =
    filteredFoods.filter(
      f => f.is_available
    );

  const unavailable =
    filteredFoods.filter(
      f => !f.is_available
    );

  container.innerHTML = `
    <div class="food-management">

      <div class="management-header">

        <div>
          <h2>Food Items</h2>

          <p>
            Total: ${filteredFoods.length}
            · Available: ${available.length}
            · Unavailable: ${unavailable.length}
          </p>
        </div>

        <div class="food-filter-box">

          <label for="foodRestaurantFilter">
            Restaurant
          </label>

          <select
            id="foodRestaurantFilter"
            onchange="filterAdminFoodByRestaurant(this.value)">

            <option value="">
              All Restaurants
            </option>

            ${adminRestaurants.map(r => `
              <option
                value="${r.user_id}"
                ${String(selectedRestaurant) === String(r.user_id)
                  ? "selected"
                  : ""}>
                ${escapeHtml(
                  r.restaurant_name ||
                  r.owner_name ||
                  "Restaurant"
                )}
              </option>
            `).join("")}

          </select>

        </div>

      </div>

      <div class="food-section-title">
        AVAILABLE
      </div>

      <div class="management-list">

        ${
          available.length
            ? available.map(foodCard).join("")
            : `
              <div class="empty-management">
                No available food items
              </div>
            `
        }

      </div>

      <div class="food-section-title unavailable-title">
        UNAVAILABLE
      </div>

      <div class="management-list">

        ${
          unavailable.length
            ? unavailable.map(foodCard).join("")
            : `
              <div class="empty-management">
                No unavailable food items
              </div>
            `
        }

      </div>

    </div>
  `;
}

window.filterAdminFoodByRestaurant =
  function(value) {

    selectedRestaurant = value;

    const target =
      document.getElementById("homeSection")
        ? "homeSection"
        : "content";

    renderFoodPage(target);
  };

function foodCard(f) {
  const unavailable =
    !f.is_available;

  return `
    <div class="management-row ${unavailable ? "offline-row" : ""}">

      <div class="row-main">

        <strong>
          ${escapeHtml(
            f.name || "Unnamed"
          )}
        </strong>

        <small>
          ${escapeHtml(
            f.restaurant_name || ""
          )}
        </small>

        <small>
          ${
            f.type
              ? escapeHtml(
                  f.type.toUpperCase()
                )
              : ""
          }
        </small>

      </div>

      <div class="row-status">

        <span class="${
          unavailable
            ? "offline-status"
            : "online-status"
        }">
          ${
            unavailable
              ? "UNAVAILABLE"
              : "AVAILABLE"
          }
        </span>

        <button
          onclick="openFoodDetails(${f.id})">
          VIEW
        </button>

        <button
          onclick="editAdminFood(${f.id})">
          EDIT
        </button>

        <button
          class="danger-btn"
          onclick="deleteAdminFood(${f.id})">
          DELETE
        </button>

      </div>

    </div>
  `;
}

window.openFoodDetails =
  async function(id) {

    const result =
      await apiGet(
        `/admin/food-details/${id}`
      );

    if (!result.success) {
      alert(
        result.message ||
        "Unable to load food"
      );
      return;
    }

    const f =
      result.data.food || {};

    const prices =
      result.data.prices || [];

    const categories =
      result.data.categories || [];

    const stats =
      result.data.stats || {};

    const priceText =
      prices.map(p =>
        `${p.type}: ₹${p.price} / MRP ₹${p.mrp} / Prep ${p.prep_time} min`
      ).join("\n");

    const categoryText =
      categories
        .map(c => c.category)
        .join(", ");

    alert(
      `Food: ${f.name || ""}\n` +
      `Restaurant: ${f.restaurant_name || ""}\n` +
      `Type: ${f.type || ""}\n` +
      `Categories: ${categoryText || "-"}\n\n` +
      `${priceText}\n\n` +
      `Total ordered: ${stats.total_ordered || 0}\n` +
      `Total quantity: ${stats.total_quantity || 0}`
    );
  };

window.editAdminFood =
  async function(id) {

    const result =
      await apiGet(
        `/admin/food-details/${id}`
      );

    if (!result.success) {
      alert(
        result.message ||
        "Unable to load food"
      );
      return;
    }

    renderFoodEditor(result.data);
  };

function renderFoodEditor(data) {

  document
    .getElementById("admin-food-editor")
    ?.remove();

  const food =
    data.food || {};

  const prices =
    data.prices || [];

  const categories =
    data.categories || [];

  const half =
    prices.find(
      p => p.type === "half"
    ) || {};

  const full =
    prices.find(
      p => p.type === "full"
    ) || {};

  const selectedCategories =
    categories.map(
      c => c.category
    );

  const categoryList = [
    "breakfast",
    "lunch",
    "dinner",
    "snacks",
    "sweets",
    "dessert",
    "drinks"
  ];

  const modal =
    document.createElement("div");

  modal.id =
    "admin-food-editor";

  modal.className =
    "management-modal";

  modal.innerHTML = `
    <div class="modal-box food-editor-box">

      <div class="modal-header">

        <h3>
          Edit Food
        </h3>

        <button
          class="modal-close"
          onclick="closeFoodEditor()">
          ×
        </button>

      </div>

      <div class="food-editor-form">

        <label>
          Food Name
          <input
            id="editFoodName"
            value="${escapeAttribute(food.name || "")}">
        </label>

        <label>
          Description
          <textarea
            id="editFoodDescription"
            rows="3">${escapeHtml(
              food.description || ""
            )}</textarea>
        </label>

        <label>
          Type
          <select id="editFoodType">
            <option
              value="veg"
              ${food.type === "veg" ? "selected" : ""}>
              VEG
            </option>

            <option
              value="nonveg"
              ${food.type === "nonveg" ? "selected" : ""}>
              NON-VEG
            </option>
          </select>
        </label>

        <div class="food-editor-field">

          <strong>
            Categories
          </strong>

          <div class="food-category-grid">

            ${categoryList.map(category => `
              <label class="food-category-option">

                <input
                  type="checkbox"
                  name="editFoodCategory"
                  value="${category}"
                  ${selectedCategories.includes(category)
                    ? "checked"
                    : ""}>

                ${category.toUpperCase()}

              </label>
            `).join("")}

          </div>

        </div>

        <div class="food-price-editor">

          <h4>
            HALF
          </h4>

          <label>
            Price
            <input
              id="editHalfPrice"
              type="number"
              min="0"
              value="${escapeAttribute(
                half.price ?? 0
              )}">
          </label>

          <label>
            MRP
            <input
              id="editHalfMrp"
              type="number"
              min="0"
              value="${escapeAttribute(
                half.mrp ?? 0
              )}">
          </label>

          <label>
            Prep Time (minutes)
            <input
              id="editHalfPrep"
              type="number"
              min="0"
              value="${escapeAttribute(
                half.prep_time ?? 0
              )}">
          </label>

        </div>

        <div class="food-price-editor">

          <h4>
            FULL
          </h4>

          <label>
            Price
            <input
              id="editFullPrice"
              type="number"
              min="0"
              value="${escapeAttribute(
                full.price ?? 0
              )}">
          </label>

          <label>
            MRP
            <input
              id="editFullMrp"
              type="number"
              min="0"
              value="${escapeAttribute(
                full.mrp ?? 0
              )}">
          </label>

          <label>
            Prep Time (minutes)
            <input
              id="editFullPrep"
              type="number"
              min="0"
              value="${escapeAttribute(
                full.prep_time ?? 0
              )}">
          </label>

        </div>

        <div class="food-editor-actions">

          <button
            onclick="saveAdminFood(${food.id})">
            SAVE CHANGES
          </button>

          <button
            class="secondary-btn"
            onclick="closeFoodEditor()">
            CANCEL
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);
}

window.saveAdminFood =
  async function(foodId) {

    const categories =
      Array.from(
        document.querySelectorAll(
          'input[name="editFoodCategory"]:checked'
        )
      ).map(input => input.value);

    if (!categories.length) {
      alert(
        "Select at least one category."
      );
      return;
    }

    const halfPrice =
      Number(
        document.getElementById(
          "editHalfPrice"
        ).value
      );

    const halfMrp =
      Number(
        document.getElementById(
          "editHalfMrp"
        ).value
      );

    const fullPrice =
      Number(
        document.getElementById(
          "editFullPrice"
        ).value
      );

    const fullMrp =
      Number(
        document.getElementById(
          "editFullMrp"
        ).value
      );

    if (
      halfPrice > halfMrp ||
      fullPrice > fullMrp
    ) {
      alert(
        "Price cannot be greater than MRP."
      );
      return;
    }

    const payload = {
      food_id: foodId,

      name:
        document.getElementById(
          "editFoodName"
        ).value.trim(),

      description:
        document.getElementById(
          "editFoodDescription"
        ).value.trim(),

      type:
        document.getElementById(
          "editFoodType"
        ).value,

      categories,

      prices: [
        {
          type: "half",
          price: halfPrice,
          mrp: halfMrp,
          prep_time: Number(
            document.getElementById(
              "editHalfPrep"
            ).value
          )
        },
        {
          type: "full",
          price: fullPrice,
          mrp: fullMrp,
          prep_time: Number(
            document.getElementById(
              "editFullPrep"
            ).value
          )
        }
      ]
    };

    const result =
      await apiPost(
        "/admin/foods/update",
        payload
      );

    if (!result.success) {
      alert(
        result.message ||
        "Unable to update food"
      );
      return;
    }

    closeFoodEditor();

    alert(
      result.message ||
      "Food updated successfully."
    );

    if (
      window.adminHomeMode &&
      window.refreshHomeSection
    ) {
      await window.refreshHomeSection();
    } else {
      await loadPage("food");
    }
  };

window.closeFoodEditor =
  function() {
    document
      .getElementById(
        "admin-food-editor"
      )
      ?.remove();
  };

window.deleteAdminFood =
  async function(id) {

    if (!confirm(
      "Delete this food item?\n\n" +
      "If it has order history, it will become unavailable " +
      "and be scheduled for deletion after 1 hour."
    )) {
      return;
    }

    const result =
      await apiPost(
        "/admin/foods/delete",
        {
          food_id: id
        }
      );

    if (!result.success) {
      alert(
        result.message ||
        "Delete failed"
      );
      return;
    }

    alert(
      result.message ||
      "Food operation completed"
    );

    if (
      window.adminHomeMode &&
      window.refreshHomeSection
    ) {
      await window.refreshHomeSection();
    } else {
      await loadPage("food");
    }
  };

function showError(targetId, message) {
  const element =
    document.getElementById(targetId);

  if (!element) return;

  element.innerHTML = `
    <div class="management-error">
      ${escapeHtml(message)}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value)
    .replace(/'/g, "&#039;");
}
