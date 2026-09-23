const BASE_URL =
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1")
    ? "http://localhost:3000"
    : "";

// GET
window.apiGet = async function (url) {
  try {
    const res = await fetch(BASE_URL + url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.getUserId(),
        "x-role": session.getRole()
      }
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", text);
      return {
        success: false,
        message: "Invalid response"
      };
    }

  } catch (err) {
    console.error("API GET ERROR:", err.message);

    return {
      success: false,
      message: err.message
    };
  }
};

// POST
window.apiPost = async function (url, data) {
  try {
    const res = await fetch(BASE_URL + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.getUserId(),
        "x-role": session.getRole()
      },
      body: JSON.stringify(data)
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", text);

      return {
        success: false,
        message: "Invalid response"
      };
    }

  } catch (err) {
    console.error("API POST ERROR:", err.message);

    return {
      success: false,
      message: err.message
    };
  }
};

// DELETE
window.apiDelete = async function (url) {
  try {
    const res = await fetch(BASE_URL + url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.getUserId(),
        "x-role": session.getRole()
      }
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", text);

      return {
        success: false,
        message: `Invalid response (HTTP ${res.status})`
      };
    }

  } catch (err) {
    console.error("API DELETE ERROR:", err.message);

    return {
      success: false,
      message: err.message
    };
  }
};
