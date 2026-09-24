console.log("AUTH JS FINAL CLEAN");

const BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? "http://localhost:3000" : "";

/* REGISTER */
async function sendOTP() {
  try {
    const role = document.getElementById("role").value;
    const name = document.getElementById("name").value;
    const mobile = document.getElementById("mobile").value;
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    // 🔥 EXTRA FIELDS
    const restaurant_name = document.getElementById("restaurant_name")?.value;
    const owner_mobile = document.getElementById("owner_mobile")?.value;
    const driving_license = document.getElementById("driving_license")?.value;

    let payload = {
      role,
      name,
      mobile,
      gmail: email,
      password
    };

    // ✅ ROLE BASED DATA
    if (role === "restaurant") {
      payload.restaurant_name = restaurant_name;
      payload.owner_name = name;
      payload.restaurant_mobile = mobile;
      payload.owner_mobile = owner_mobile;
      localStorage.setItem("restaurant_name", restaurant_name);
      localStorage.setItem("owner_mobile", owner_mobile);
    }

    if (role === "rider") {
      payload.driving_license = driving_license;
      localStorage.setItem("driving_license", driving_license);
    }

    console.log("REGISTER PAYLOAD:", payload);

    const res = await fetch(BASE_URL + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("REGISTER RESPONSE:", data);

    if (data.success) {
      // ✅ SHOW OTP
      alert("OTP: " + data.data.otp);

      localStorage.setItem("gmail", email);
      localStorage.setItem("name", name);
      localStorage.setItem("mobile", mobile);
      localStorage.setItem("password", password);
      localStorage.setItem("role", role);

      window.location.href = "verify.html";
    } else {
      alert(data.message || "Register failed");
    }

  } catch (err) {
    console.error(err);
    alert("Register error");
  }
}

/* VERIFY */
async function verify() {
  try {
    const gmail = localStorage.getItem("gmail");
    const otp = document.getElementById("otp").value;

    const res = await fetch(BASE_URL + "/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gmail: localStorage.getItem("gmail"),
        otp: document.getElementById("otp").value,
        name: localStorage.getItem("name"),
        mobile: localStorage.getItem("mobile"),
        password: localStorage.getItem("password"),
        role: localStorage.getItem("role"),
        restaurant_name: localStorage.getItem("restaurant_name"),
        owner_name: localStorage.getItem("name"),
        restaurant_mobile: localStorage.getItem("mobile"),
        owner_mobile: localStorage.getItem("owner_mobile"),
        driving_license: localStorage.getItem("driving_license")
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Verified");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Invalid OTP");
    }

  } catch (err) {
    console.error(err);
    alert("Verify error");
  }
}

/* LOGIN */
async function login() {
  try {
    const role = document.getElementById("role").value;
    const login_id = document.getElementById("login_id").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const res = await fetch(BASE_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        identifier: login_id,
        password
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Login success");

      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("role", role);

      // 🔥 ROLE BASED REDIRECT
      if (role === "user") window.location.href = "/user/index.html";
      else if (role === "restaurant") window.location.href = "/restaurant/index.html";
      else if (role === "rider") window.location.href = "/rider/index.html";
      else if (role === "admin") window.location.href = "/admin/index.html";
      else if (role === "workwithus") window.location.href = "/work/index.html";

    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    console.error(err);
    alert("Login error");
  }
}

window.sendOTP = sendOTP;
window.verify = verify;
window.login = login;
