let profileData = null;

export async function render() {
  document.getElementById("pageTitle").textContent =
    "PROFILE";

  document.getElementById("content").innerHTML = `
    <section class="profile-page">

      <div class="profile-heading">
        <h2>Admin Profile</h2>
        <p>Manage your administrator account.</p>
      </div>

      <div class="profile-grid">

        <div class="profile-card">

          <div class="profile-card-header">
            <h3>Profile Information</h3>
            <p>Update your basic account details.</p>
          </div>

          <div class="profile-card-body">

            <div id="profileMessage"
                 class="profile-message">
            </div>

            <div id="profileAvatar"
                 class="profile-avatar">
              A
            </div>

            <form id="profileForm">

              <div class="profile-field">
                <label>NAME</label>
                <input
                  id="profileName"
                  type="text"
                  required>
              </div>

              <div class="profile-field">
                <label>MOBILE</label>
                <input
                  id="profileMobile"
                  type="text"
                  required>
              </div>

              <div class="profile-field">
                <label>GMAIL</label>
                <input
                  id="profileGmail"
                  type="email"
                  required>
              </div>

              <div class="profile-actions">
                <button
                  type="submit"
                  class="profile-btn primary">
                  SAVE CHANGES
                </button>
              </div>

            </form>

          </div>
        </div>

        <div>

          <div class="profile-card">

            <div class="profile-card-header">
              <h3>Account</h3>
              <p>Current account information.</p>
            </div>

            <div class="profile-card-body">

              <div class="profile-info">

                <div class="profile-info-row">
                  <span>Status</span>
                  <strong id="profileStatus">—</strong>
                </div>

                <div class="profile-info-row">
                  <span>Admin ID</span>
                  <strong id="profileId">—</strong>
                </div>

                <div class="profile-info-row">
                  <span>Created</span>
                  <strong id="profileCreated">—</strong>
                </div>

              </div>

            </div>
          </div>

          <div class="profile-card"
               style="margin-top:20px;">

            <div class="profile-card-header">
              <h3>Change Password</h3>
              <p>Set a new administrator password.</p>
            </div>

            <div class="profile-card-body">

              <div id="passwordMessage"
                   class="profile-message">
              </div>

              <form id="passwordForm">

                <div class="profile-field">
                  <label>NEW PASSWORD</label>
                  <input
                    id="newPassword"
                    type="password"
                    minlength="6"
                    required>
                </div>

                <div class="profile-field">
                  <label>CONFIRM PASSWORD</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    minlength="6"
                    required>
                </div>

                <div class="profile-actions">
                  <button
                    type="submit"
                    class="profile-btn success">
                    UPDATE PASSWORD
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>

    </section>
  `;

  bindProfileEvents();

  await loadProfile();
}

async function loadProfile() {
  const response =
    await apiGet("/admin/profile");

  if (!response?.success) {
    showMessage(
      "profileMessage",
      response?.message ||
        "Unable to load profile.",
      "error"
    );

    return;
  }

  profileData = response.data;

  document.getElementById("profileName").value =
    profileData.name || "";

  document.getElementById("profileMobile").value =
    profileData.mobile || "";

  document.getElementById("profileGmail").value =
    profileData.gmail || "";

  document.getElementById("profileId").textContent =
    profileData.id ?? "—";

  document.getElementById("profileCreated").textContent =
    formatDate(profileData.created_at);

  const status =
    document.getElementById("profileStatus");

  if (profileData.is_blocked) {
    status.textContent = "BLOCKED";
    status.className =
      "profile-status blocked";
  } else {
    status.textContent = "ACTIVE";
    status.className =
      "profile-status";
  }

  const avatar =
    document.getElementById("profileAvatar");

  avatar.textContent =
    (profileData.name || "A")
      .trim()
      .charAt(0)
      .toUpperCase();
}

function bindProfileEvents() {
  document
    .getElementById("profileForm")
    ?.addEventListener(
      "submit",
      saveProfile
    );

  document
    .getElementById("passwordForm")
    ?.addEventListener(
      "submit",
      changePassword
    );
}

async function saveProfile(event) {
  event.preventDefault();

  const data = {
    name:
      document.getElementById("profileName").value.trim(),

    mobile:
      document.getElementById("profileMobile").value.trim(),

    gmail:
      document.getElementById("profileGmail").value.trim()
  };

  if (!data.name || !data.mobile || !data.gmail) {
    showMessage(
      "profileMessage",
      "All profile fields are required.",
      "error"
    );

    return;
  }

  const response =
    await apiPost(
      "/admin/profile/update",
      data
    );

  if (!response?.success) {
    showMessage(
      "profileMessage",
      response?.message ||
        "Unable to update profile.",
      "error"
    );

    return;
  }

  showMessage(
    "profileMessage",
    "Profile updated successfully.",
    "success"
  );

  await loadProfile();
}

async function changePassword(event) {
  event.preventDefault();

  const password =
    document.getElementById("newPassword").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showMessage(
      "passwordMessage",
      "Passwords do not match.",
      "error"
    );

    return;
  }

  if (password.length < 6) {
    showMessage(
      "passwordMessage",
      "Password must be at least 6 characters.",
      "error"
    );

    return;
  }

  const response =
    await apiPost(
      "/admin/profile/password",
      { password }
    );

  if (!response?.success) {
    showMessage(
      "passwordMessage",
      response?.message ||
        "Unable to update password.",
      "error"
    );

    return;
  }

  document.getElementById("passwordForm").reset();

  showMessage(
    "passwordMessage",
    "Password updated successfully.",
    "success"
  );
}

function showMessage(id, message, type) {
  const element =
    document.getElementById(id);

  if (!element) return;

  element.textContent = message;
  element.className =
    `profile-message ${type}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}
