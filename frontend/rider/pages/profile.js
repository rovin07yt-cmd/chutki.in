export default async function(content){

  const res =
    await apiGet("/rider-profile");

  const p =
    res.data || {};

  const imageUrl =
    p.image
      ? `http://localhost:3000${p.image}?t=${Date.now()}`
      : "http://localhost:3000/uploads/default.png";

  content.innerHTML = `

    <div class="profile-page">

      <div class="profile-photo-card">

        <div class="profile-avatar">
          <img
            id="profilePreview"
            src="${imageUrl}">
        </div>

        <input
          type="file"
          id="photoInput"
          accept="image/*"
          style="display:none">

        <button
          id="uploadPhotoBtn"
          class="profile-btn">
          Upload Photo
        </button>

      </div>

      <div class="profile-card">

        <div class="profile-label">
          Name
        </div>

        <input
          id="name"
          class="profile-input"
          value="${p.name || ""}">

        <div class="profile-label">
          Mobile Number
        </div>

        <input
          id="mobile"
          class="profile-input"
          value="${p.mobile || ""}">

        <div class="profile-label">
          Gmail
        </div>

        <input
          id="gmail"
          class="profile-input"
          value="${p.gmail || ""}"
          readonly>

        <div class="profile-label">
          Date Of Birth
        </div>

        <input
          id="dob"
          type="date"
          class="profile-input"
          value="${(p.dob || "").substring(0,10)}">

        <div class="profile-label">
          Driving License
        </div>

        <input
          id="dl"
          class="profile-input"
          value="${p.driving_license || ""}"
          readonly>

        <button
          id="saveProfileBtn"
          class="profile-btn profile-save">
          Save Changes
        </button>

      </div>

      <div class="profile-card">

        <div class="section-title">
          Change Password
        </div>

        <input
          type="password"
          id="oldPassword"
          class="profile-input"
          placeholder="Old Password">

        <input
          type="password"
          id="newPassword"
          class="profile-input"
          placeholder="New Password">

        <button
          id="changePasswordBtn"
          class="profile-btn">
          Save Password
        </button>

      </div>

    </div>

  `;

  document
    .getElementById("saveProfileBtn")
    .onclick = async () => {

      const result =
        await apiPost(
          "/rider-profile/update",
          {
            name:
              document.getElementById("name").value,
            mobile:
              document.getElementById("mobile").value,
            dob:
              document.getElementById("dob").value
          }
        );

      alert(result.message);

      loadPage("profile");
    };

  document
    .getElementById("uploadPhotoBtn")
    .onclick = () => {

      document
        .getElementById("photoInput")
        .click();

    };

  document
    .getElementById("photoInput")
    .onchange = async (e) => {

      const file =
        e.target.files[0];

      if(!file) return;

      document
        .getElementById("profilePreview")
        .src =
          URL.createObjectURL(file);

      const form =
        new FormData();

      form.append(
        "image",
        file
      );

      const res =
        await fetch(
          "http://localhost:3000/rider-profile/image",
          {
            method:"POST",
            headers:{
              "x-user-id":
                  session.getUserId(),
              "x-role":"rider"
            },
            body:form
          }
        );

      const data =
        await res.json();

      alert(data.message);

    };

  document
    .getElementById("changePasswordBtn")
    .onclick = async () => {

      const result =
        await apiPost(
          "/rider-profile/password",
          {
            old_password:
              document.getElementById("oldPassword").value,
            new_password:
              document.getElementById("newPassword").value
          }
        );

      alert(
        result.message ||
        "Password updated"
      );

    };

}
