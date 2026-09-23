let currentRequestType = "restaurants";

export async function render() {
  document.getElementById("pageTitle").textContent = "REQUESTS";

  document.getElementById("content").innerHTML = `
    <section class="requests-page">

      <div class="requests-header">
        <div>
          <h2>Requests</h2>
          <p>Review pending restaurant and rider registrations.</p>
        </div>
      </div>

      <div class="requests-tabs">
        <button
          id="restaurantRequestsTab"
          class="request-tab active"
          onclick="switchRequestType('restaurants')"
        >
          RESTAURANTS
        </button>

        <button
          id="riderRequestsTab"
          class="request-tab"
          onclick="switchRequestType('riders')"
        >
          RIDERS
        </button>
      </div>

      <div id="requestsList" class="requests-list">
        <div class="request-loading">Loading...</div>
      </div>

    </section>
  `;

  await loadRequests();
}

window.switchRequestType = async function(type) {
  currentRequestType = type;

  document
    .getElementById("restaurantRequestsTab")
    ?.classList.toggle("active", type === "restaurants");

  document
    .getElementById("riderRequestsTab")
    ?.classList.toggle("active", type === "riders");

  await loadRequests();
};

async function loadRequests() {
  const container = document.getElementById("requestsList");

  if (!container) return;

  container.innerHTML = `
    <div class="request-loading">Loading...</div>
  `;

  const endpoint =
    currentRequestType === "restaurants"
      ? "/admin/requests/restaurants"
      : "/admin/requests/riders";

  try {
    const response = await apiGet(endpoint);

    if (!response.success) {
      throw new Error(response.message || "Unable to load requests");
    }

    const requests = response.data || [];

    if (!requests.length) {
      container.innerHTML = `
        <div class="requests-empty">
          <div class="empty-icon">✓</div>
          <h3>No pending ${currentRequestType}</h3>
          <p>There are currently no requests waiting for approval.</p>
        </div>
      `;
      return;
    }

    container.innerHTML =
      currentRequestType === "restaurants"
        ? requests.map(renderRestaurantRequest).join("")
        : requests.map(renderRiderRequest).join("");

  } catch (error) {
    console.error("Requests error:", error);

    container.innerHTML = `
      <div class="requests-error">
        <h3>Unable to load requests</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function renderRestaurantRequest(request) {
  const image = request.image
    ? request.image
    : "/assets/logo.png";

  return `
    <article class="request-card">

      <div class="request-image-wrap">
        <img
          class="request-image"
          src="${escapeHtml(image)}"
          alt="Restaurant"
          onerror="this.src='/assets/logo.png'"
        >
      </div>

      <div class="request-info">

        <div class="request-title-row">
          <h3>${escapeHtml(request.restaurant_name)}</h3>
          <span class="request-status">PENDING</span>
        </div>

        <div class="request-details">
          <div>
            <span>Owner</span>
            <strong>${escapeHtml(request.owner_name)}</strong>
          </div>

          <div>
            <span>Owner Mobile</span>
            <strong>${escapeHtml(request.owner_mobile)}</strong>
          </div>

          <div>
            <span>Restaurant Mobile</span>
            <strong>${escapeHtml(request.restaurant_mobile)}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>${escapeHtml(request.gmail)}</strong>
          </div>
        </div>

        <div class="request-actions">
          <button
            class="approve-btn"
            onclick="approveRestaurantRequest(${Number(request.user_id)})"
          >
            ✓ APPROVE
          </button>
        </div>

      </div>
    </article>
  `;
}

function renderRiderRequest(request) {
  const image = request.image
    ? request.image
    : "/assets/logo.png";

  return `
    <article class="request-card">

      <div class="request-image-wrap">
        <img
          class="request-image"
          src="${escapeHtml(image)}"
          alt="Rider"
          onerror="this.src='/assets/logo.png'"
        >
      </div>

      <div class="request-info">

        <div class="request-title-row">
          <h3>${escapeHtml(request.name)}</h3>
          <span class="request-status">PENDING</span>
        </div>

        <div class="request-details">
          <div>
            <span>Mobile</span>
            <strong>${escapeHtml(request.mobile)}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>${escapeHtml(request.gmail)}</strong>
          </div>

          <div>
            <span>Age</span>
            <strong>${request.age ?? "—"}</strong>
          </div>

          <div>
            <span>Driving License</span>
            <strong>${escapeHtml(request.driving_license || "—")}</strong>
          </div>
        </div>

        <div class="request-actions">
          <button
            class="approve-btn"
            onclick="approveRiderRequest(${Number(request.id)})"
          >
            ✓ APPROVE
          </button>
        </div>

      </div>
    </article>
  `;
}

window.approveRestaurantRequest = async function(userId) {
  if (!confirm("Approve this restaurant request?")) return;

  const button = event?.target;

  if (button) {
    button.disabled = true;
    button.textContent = "APPROVING...";
  }

  try {
    const response = await apiPost(
      "/admin/requests/restaurants/approve",
      { user_id: userId }
    );

    if (!response.success) {
      alert(response.message || "Restaurant approval failed");
      return;
    }

    alert("Restaurant approved successfully.");
    await loadRequests();

  } catch (error) {
    console.error(error);
    alert(error.message || "Restaurant approval failed");
  }
};

window.approveRiderRequest = async function(userId) {
  if (!confirm("Approve this rider request?")) return;

  const button = event?.target;

  if (button) {
    button.disabled = true;
    button.textContent = "APPROVING...";
  }

  try {
    const response = await apiPost(
      "/admin/requests/riders/approve",
      { user_id: userId }
    );

    if (!response.success) {
      alert(response.message || "Rider approval failed");
      return;
    }

    alert("Rider approved successfully.");
    await loadRequests();

  } catch (error) {
    console.error(error);
    alert(error.message || "Rider approval failed");
  }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
