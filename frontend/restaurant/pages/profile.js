
export async function render() {

  const res = await apiGet("/restaurant-profile");
  const data = res.data;

  const user = data.user || {};
  const profile = data.profile || {};

  const imageUrl = profile.image
    ? `http://localhost:3000${profile.image}?t=${Date.now()}`
    : "/assets/default.png";

  document.getElementById("content").innerHTML = `
    <div class="profile-page">

      <div class="profile-card">

        <div class="profile-image">
          <img id="profileImg" src="${imageUrl}">
          <button class="profile-edit-btn" onclick="pickProfile()">✎</button>
          <input type="file" id="imgInput" hidden>
        </div>

        <div class="profile-form">

          <div class="form-group">
            <label>Restaurant Name</label>
            <input id="restaurant_name" value="${profile.restaurant_name || ""}">
          </div>

          <div class="form-group">
            <label>Owner Name</label>
            <input id="name" value="${user.name || ""}">
          </div>

          <div class="form-group">
            <label>Owner Mobile</label>
            <input id="owner_mobile" value="${profile.owner_mobile || ""}">
          </div>

          <div class="form-group">
            <label>Restaurant Mobile</label>
            <input id="mobile" value="${user.mobile || ""}">
          </div>

          <div class="form-group">
            <label>Email</label>
            <input id="gmail" value="${user.gmail || ""}">
          </div>

          <div class="profile-actions">
            <button class="btn-save">Save</button>
          </div>

        </div>

      </div>

    </div>
  `;

  const btn = document.querySelector(".btn-save");
  if (btn) btn.onclick = window.saveProfile;

  const input = document.getElementById("imgInput");

  if (input) {
    input.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const form = new FormData();
      form.append("image", file);

      const res = await fetch("http://localhost:3000/restaurant-profile/image", {
        method: "POST",
        body: form,
        headers: {
          "x-user-id": session.getUserId(),
          "x-role": session.getRole()
        }
      });

      const data = await res.json();

      if (data.success && data.data.image) {
        document.getElementById("profileImg").src =
          "http://localhost:3000/" + data.data.image + "?t=" + Date.now();
      } else {
        alert("Upload failed");
      }
    });
  }

}


// 📸 PICK IMAGE
window.pickProfile = () => {
  document.getElementById("imgInput").click();
};


// 💾 SAVE PROFILE
window.saveProfile = async function () {
  try {
    const res = await apiPost("/restaurant-profile/update", {
      name: document.getElementById("name").value,
      mobile: document.getElementById("mobile").value,
      restaurant_name: document.getElementById("restaurant_name").value,
      owner_mobile: document.getElementById("owner_mobile").value,
      gmail: document.getElementById("gmail").value
    });

    if (res.success) {
      alert("Profile updated ✅");
      location.reload();
    } else {
      alert(res.message || "Update failed");
    }

  } catch (err) {
    console.error(err);
    alert("Save failed");
  }
};

