function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
}

function logout() {
  localStorage.clear();
  window.location.href = "/auth/login.html";
}

async function loadPage(page) {
  document.getElementById("pageTitle").innerText = page.toUpperCase();

  const module = await import(`./pages/${page}.js`);
  module.render();

  document.getElementById("sidebar").classList.remove("active");
}

loadPage("home");
