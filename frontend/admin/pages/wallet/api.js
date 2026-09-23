const BASE_URL =
  (window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1")
    ? "http://localhost:3000"
    : "";

async function walletApiPut(url, data) {
  const userId = session.getUserId();
  const role = session.getRole();

  const response = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
      "x-role": role
    },
    body: JSON.stringify(data)
  });

  return await response.json();
}

export async function getAdminWalletSummary() {
  return await apiGet("/admin-wallet/summary");
}

export async function getWalletSettings() {
  return await apiGet("/admin/settings/");
}

export async function updateWalletSettings(data) {
  return await walletApiPut("/admin/settings/", data);
}

export async function getRestaurantWallets() {
  return await apiGet("/admin/restaurant-wallet");
}

export async function getRestaurantWallet(id) {
  return await apiGet(`/admin/restaurant-wallet/${id}`);
}

export async function payRestaurant(data) {
  return await apiPost("/admin/restaurant-wallet/pay", data);
}

export async function getRiderWallets() {
  return await apiGet("/admin/rider-wallet");
}

export async function getRiderWallet(id) {
  return await apiGet(`/admin/rider-wallet/${id}`);
}

export async function payRiderSalary(data) {
  return await apiPost("/admin/rider-wallet/salary-pay", data);
}

export async function submitRiderCOD(data) {
  return await apiPost("/admin/rider-wallet/cod-submit", data);
}

export function getWalletImageUrl(image) {
  if (!image) return "";

  const value = String(image).trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${BASE_URL}${value}`;
  }

  return `${BASE_URL}/${value}`;
}
