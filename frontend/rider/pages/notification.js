export default async function(content){

  const res =
    await apiGet(
      "/rider/notifications"
    );

  const list =
    res.data || [];

  content.innerHTML = `

    <div class="notification-page">

        <div class="notification-header">
          <div class="notification-title">🔔 Notifications</div>
          <div class="notification-count">
            ${list.filter(n => !n.is_read).length} Unread
          </div>
        </div>


      <button
        id="markAllRead"
        class="notification-btn">
        Mark All Read
      </button>

      <div id="notificationList"></div>

    </div>

  `;

  const box =
    document.getElementById(
      "notificationList"
    );

  if(!list.length){

      box.innerHTML =
        `<div class="notification-empty">No notifications</div>`;

    return;
  }

  box.innerHTML =
    list.map(n => `

        <div class="notification-card ${n.is_read ? "read" : ""}" data-id="${n.id}">

        <div class="notification-message">
          ${n.message}
        </div>

        <div class="notification-date">
          ${new Date(
            n.created_at
          ).toLocaleString()}
        </div>


      </div>

    `).join("");


  document.querySelectorAll(".notification-card").forEach(card=>{

    card.onclick = async ()=>{

      await apiPost(
        "/rider/notifications/read-one",
        {
          notification_id:Number(card.dataset.id)
        }
      );

      loadPage("home");

    };

  });

  document
    .getElementById(
      "markAllRead"
    )
    .onclick = async () => {

      await apiPost(
        "/rider/notifications/read",
        {}
      );

      loadPage(
        "notification"
      );

    };
}
