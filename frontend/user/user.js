function toggleSidebar(){
document.getElementById("sidebar").classList.toggle("active");
document.getElementById("overlay").classList.toggle("active");
}

function logout() {
  localStorage.clear();
  window.location.href = "/auth/login.html";
}

async function loadPage(page) {
  document.getElementById("pageTitle").innerText = page.toUpperCase();

  document.querySelectorAll(".sidebar-menu .menu-item")
    .forEach(el => el.classList.remove("active"));

  const active = document.querySelector(`.sidebar-menu .menu-item[onclick="loadPage('${page}')"]`);

  if (active) active.classList.add("active");

  const module = await import(`./pages/${page}.js`);
  module.render();

  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

loadPage("home");
