export default async function(content){

  const json =
    await apiGet("/rider/route");

  const route =
    json.data;

  if(
    !route ||
    !route.stops ||
    !route.stops.length
  ){
    content.innerHTML = `
      <div class="empty-state">
        No active route
      </div>
    `;
    return;
  }

  content.innerHTML = `

    <div class="route-page">

      <div class="route-summary">

        <div class="route-stat">
          <div>Distance</div>
          <b>
            ${(route.distance_meters/1000).toFixed(2)} KM
          </b>
        </div>

        <div class="route-stat">
          <div>ETA</div>
          <b>
            ${Math.ceil(route.duration_seconds/60)}
            Min
          </b>
        </div>

        <div class="route-stat">
          <div>Stops</div>
          <b>
            ${route.stops.length}
          </b>
        </div>

      </div>

        <div id="routeMap"></div>

        <div class="route-orders">
          <h3>Route Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Seq</th>
                <th>Order</th>
                <th>Type</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              ${route.stops.map(stop => `
                <tr>
                  <td>${stop.sequence_number}</td>
                  <td>#${stop.order_id}</td>
                  <td>${stop.point_type}</td>
                  <td>${stop.customer_name || "-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="route-help">
          <h3>Navigation Guide</h3>
          <div>🏍️ You (Current Location)</div>
          <div>🏢 Restaurant Pickup</div>
          <div>🏠 Delivery Point</div>
          <div>Numbers show visit sequence (1,2,3...)</div>
          <div>Always follow lowest number first.</div>
        </div>

    </div>
  `;

  const first =
    route.geometry.coordinates[0];

  const map =
    L.map("routeMap")
      .setView(
        [first[1],first[0]],
        14
      );

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom:19
    }
  ).addTo(map);

  const polyline =
    route.geometry.coordinates.map(
      c => [c[1],c[0]]
    );

  L.polyline(polyline)
    .addTo(map);

  route.stops.forEach(stop => {

    const icon = L.divIcon({
      html: stop.point_type === "pickup"
      ? `<div class="route-marker">🏢<span>${stop.sequence_number}</span></div>`
      : `<div class="route-marker">🏠<span>${stop.sequence_number}</span></div>`,
      className:"",
      iconSize:[40,40]
    });

    const text = stop.point_type === "pickup"
      ? `${stop.sequence_number}. Pickup - ${stop.restaurant_name}`
      : `${stop.sequence_number}. Delivery - ${stop.customer_name}`;

    L.marker([
      stop.lat,
      stop.lng
    ],{icon})
    .addTo(map)
    .bindPopup(text);

  });

  map.fitBounds(
    L.polyline(polyline)
      .getBounds()
  );

  if(navigator.geolocation){

    navigator.geolocation.getCurrentPosition(pos=>{

      const riderIcon=L.divIcon({
        html:`<div class="route-marker">🏍️</div>`,
        className:"",
        iconSize:[40,40]
      });

      L.marker([
        pos.coords.latitude,
        pos.coords.longitude
      ],{icon:riderIcon})
      .addTo(map)
      .bindPopup("You are here");

    });

  }


}
