export async function getAreas() {
  return apiGet("/admin/serviceable-areas");
}

export async function getArea(id) {
  return apiGet(`/admin/serviceable-areas/${id}`);
}

export async function createArea(name) {
  return apiPost(
    "/admin/serviceable-areas",
    { name }
  );
}

export async function updateArea(id, name) {
  return apiPut(
    `/admin/serviceable-areas/${id}`,
    { name }
  );
}

export async function deleteArea(id) {
  return apiDelete(
    `/admin/serviceable-areas/${id}`
  );
}

export async function createCircle(
  areaId,
  data
) {
  return apiPost(
    `/admin/serviceable-areas/${areaId}/circles`,
    data
  );
}

export async function updateCircle(
  circleId,
  data
) {
  return apiPut(
    `/admin/serviceable-areas/circles/${circleId}`,
    data
  );
}

export async function deleteCircle(
  circleId
) {
  return apiDelete(
    `/admin/serviceable-areas/circles/${circleId}`
  );
}

async function apiPut(url, data) {
  const response = await fetch(`${BASE_URL}${url}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      "x-user-id": session.getUserId(),
      "x-role": session.getRole()
    },

    body: JSON.stringify(data)
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: "Invalid server response"
    };
  }
}
