export function initWalletModal() {
  const modal = document.getElementById("walletModal");

  if (!modal) return;

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeWalletDetail();
    }
  });
}

export function showWalletDetail(html) {
  const modal = document.getElementById("walletModal");

  if (!modal) return;

  modal.innerHTML = html;
  modal.classList.remove("hidden");
}

export function closeWalletDetail() {
  const modal = document.getElementById("walletModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.innerHTML = "";
}

export function getWalletDetailContainer() {
  return document.getElementById("walletModal");
}
