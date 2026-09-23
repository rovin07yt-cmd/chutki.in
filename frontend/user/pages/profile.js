export async function render() {

  const content =
    document.getElementById("content");

  content.innerHTML = `
    <div class="profile-card">
      Loading profile...
    </div>
  `;

  const res =
    await apiGet("/user/profile");

  if (!res.success) {
    content.innerHTML = `
      <div class="profile-card">
        ${res.message}
      </div>
    `;
    return;
  }

  const user = res.data;

  const name =
    user.name || "User";

  const mobile =
    user.mobile || "Not Available";

  const gmail =
    user.gmail || "Not Available";

  document.getElementById("content").innerHTML = `
    <div class="profile-card">

      <div class="profile-header">

        <div class="profile-avatar">
          ${name.charAt(0).toUpperCase()}
        </div>

        <div class="profile-name">
          ${name}
        </div>

        <div class="profile-role">
          Customer Account
        </div>

      </div>

    </div>

    <div class="profile-card">

      <div class="profile-row">
        <span class="profile-label">Name</span>
        <span class="profile-value">${name}</span>
      </div>

      <div class="profile-row">
        <span class="profile-label">Mobile</span>
        <span class="profile-value">${mobile}</span>
      </div>

      <div class="profile-row">
        <span class="profile-label">Gmail</span>
        <span class="profile-value">${gmail}</span>
      </div>

    </div>

    <div class="profile-card">

      <button
        class="profile-btn"
        onclick="showEditProfile()">
        Edit Profile
      </button>

      <button
        class="profile-btn secondary"
        onclick="showPasswordForm()">
        Change Password
      </button>

    </div>
  `;
}

window.showEditProfile = function() {

  const user =
    JSON.parse(localStorage.getItem("user") || "{}");

  document.getElementById("content").innerHTML = `
    <div class="profile-card">

      <h3>Edit Profile</h3>

      <input
        id="editName"
        class="profile-input"
        value="${user.name || ""}"
        placeholder="Name">

      <input
        id="editMobile"
        class="profile-input"
        value="${user.mobile || ""}"
        placeholder="Mobile">

      <div class="profile-actions">

        <button
          class="profile-btn"
          onclick="saveProfile()">
          Save Changes
        </button>

        <button
          class="profile-btn secondary"
          onclick="loadPage('profile')">
          Cancel
        </button>

      </div>

    </div>
  `;
};

window.saveProfile = async function() {

  const name =
    document.getElementById("editName").value.trim();

  const mobile =
    document.getElementById("editMobile").value.trim();

  const res = await apiPost(
    "/user/profile/update",
    {
      name,
      mobile
    }
  );

  if (!res.success) {
    alert(res.message);
    return;
  }

  const user =
    JSON.parse(localStorage.getItem("user") || "{}");

  user.name = name;
  user.mobile = mobile;

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

  alert("Profile updated");

  loadPage("profile");
};

window.showPasswordForm = function() {

  document.getElementById("content").innerHTML = `
    <div class="profile-card">

      <h3>Change Password</h3>

      <input
        type="password"
        id="oldPassword"
        class="profile-input"
        placeholder="Current Password">

      <input
        type="password"
        id="newPassword"
        class="profile-input"
        placeholder="New Password">

      <div class="profile-actions">

        <button
          class="profile-btn"
          onclick="updatePassword()">
          Update Password
        </button>

        <button
          class="profile-btn secondary"
          onclick="loadPage('profile')">
          Cancel
        </button>

      </div>

    </div>
  `;
};

window.updatePassword = async function() {

  const old_password =
    document.getElementById("oldPassword").value;

  const new_password =
    document.getElementById("newPassword").value;

  if (!old_password || !new_password) {
    alert("Fill all fields");
    return;
  }

  const res = await apiPost(
    "/user/profile/password",
    {
      old_password,
      new_password
    }
  );

  if (!res.success) {
    alert(res.message);
    return;
  }

  alert("Password updated successfully");

  loadPage("profile");
};

