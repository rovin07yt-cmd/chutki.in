const express = require('express');
const router = express.Router();
const response = require('../utils/response.util');
const auth = require('../middleware/auth.middleware');

const riderService = require('../services/rider.service');

// 🔥 PICKED
router.post('/picked', auth('rider'), async (req, res) => {
  try {
    const data = await riderService.markPicked(
      req.body.order_id,
      req.user.id
    );
    return response.success(res, 'Order picked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 DELIVERED
router.post('/delivered', auth('rider'), async (req, res) => {
  try {
    const data = await riderService.markDelivered(
      req.body.order_id,
      req.user.id
    );
    return response.success(res, 'Order delivered', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 RETURN START
router.post("/return-start", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.markReturnStarted(
      req.body.order_id,
      req.user.id
    );

    return response.success(
      res,
      "Return started",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 RETURNED TO RESTAURANT
router.post("/returned", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.markReturned(
      req.body.order_id,
      req.user.id
    );

    return response.success(
      res,
      "Parcel returned",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});



// 🔥 ASSIGNED ORDERS
router.get("/orders", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.getAssignedOrders(req.user.id);
    return response.success(res, "Assigned orders", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/order/:id", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.getOrderDetails(
      req.user.id,
      req.params.id
    );

    return response.success(
      res,
      "Order details",
      data
    );

  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});



// 🔥 DELIVERED HISTORY
router.get("/history", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.getHistory(
      req.user.id,
      req.query.filter || "all"
    );
    return response.success(res, "History", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});


// 🔥 OPTIMIZED ROUTE
router.get("/route", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.getRoute(req.user.id);
    return response.success(res, "Route", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});


// 🔥 ONLINE / OFFLINE
router.post("/online", auth("rider"), async (req, res) => {
  try {
    const data = await riderService.toggleOnline(
      req.user.id,
      req.body.is_online
    );

    return response.success(
      res,
      "Rider status updated",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});


// 🔥 NOTIFICATIONS
router.get("/notifications", auth("rider"), async (req, res) => {
  try {
    const data = await require("../services/notification.service")
      .listNotifications(req.user.id);

    return response.success(
      res,
      "Notifications",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 UNREAD COUNT
router.get("/notifications/unread-count", auth("rider"), async (req, res) => {
  try {
    const data = await require("../services/notification.service")
      .getUnreadCount(req.user.id);

    return response.success(
      res,
      "Unread count",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 MARK ALL READ
router.post("/notifications/read", auth("rider"), async (req, res) => {
  try {
    const data = await require("../services/notification.service")
      .markRead(req.user.id);

    return response.success(
      res,
      "Notifications updated",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});


// 🔥 UNREAD NOTIFICATIONS
router.get("/notifications/unread", auth("rider"), async (req, res) => {
  try {
    const data = await require("../services/notification.service")
      .listUnreadNotifications(req.user.id);

    return response.success(
      res,
      "Unread notifications",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});


// 🔥 MARK SINGLE NOTIFICATION READ
router.post("/notifications/read-one", auth("rider"), async (req, res) => {
  try {
    console.log("READ-ONE DEBUG:", req.body);
    const data = await require("../services/notification.service")
      .markOneRead(
        req.body.notification_id,
        req.user.id
      );

    return response.success(
      res,
      "Notification updated",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
