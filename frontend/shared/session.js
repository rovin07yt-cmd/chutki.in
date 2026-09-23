
const session = {
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getUserId() {
    const user = this.getUser();
    return user ? user.id : null;
  },

  getRole() {
    return localStorage.getItem("role");
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  logout() {
    localStorage.clear();
    window.location.href = "/auth/login.html";
  },

  // 🔥 PROTECT PAGE
  requireRole(role) {
    const currentRole = this.getRole();

    if (!this.isLoggedIn() || currentRole !== role) {
      alert("Unauthorized");
      window.location.href = "/auth/login.html";
    }
  }
};

window.session = session;

