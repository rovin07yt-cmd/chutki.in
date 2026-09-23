const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use("/uploads", require("express").static("uploads"));
app.use(express.urlencoded({ extended: true }));

// ✅ LOGGER
app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// ✅ ROUTES
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const adminSettingsRoutes = require("./routes/admin/settings.routes");
const adminDashboardRoutes = require("./routes/admin/dashboard.routes");
const adminRequestRoutes = require("./routes/admin/request.routes");
const adminRequestRestaurantRoutes = require("./routes/admin/request_restaurant.routes");
const adminUsersRoutes = require("./routes/admin/users.routes");
const adminRestaurantsRoutes = require("./routes/admin/restaurants.routes");
const adminRestaurantOrdersRoutes = require("./routes/admin/restaurant_orders.routes");
const adminRidersRoutes = require("./routes/admin/riders.routes");
const adminRiderOrdersRoutes = require("./routes/admin/rider_orders.routes");
const adminRiderWalletRoutes = require("./routes/admin/rider_wallet.routes");
const adminFoodsRoutes = require("./routes/admin/foods.routes");
const adminFoodsService = require("./services/admin/foods.service");
const adminFoodDetailsRoutes = require("./routes/admin/food_details.routes");
const adminProfileRoutes = require("./routes/admin/profile.routes");
const adminServiceableAreasRoutes = require("./routes/admin/serviceable_areas.routes");
const adminOrdersRoutes = require("./routes/admin/orders.routes");
const adminRestaurantWalletRoutes = require("./routes/admin/restaurant_wallet.routes");
const areaRoutes = require('./routes/area.routes');
const addressRoutes = require('./routes/address.routes');
const orderRoutes = require('./routes/order.routes');
const orderItemsRoutes = require('./routes/order_items.routes');
const dispatchRoutes = require('./routes/dispatch.routes');
const restaurantOrderRoutes = require('./routes/restaurant_order.routes');
const riderRoutes = require('./routes/rider.routes');
const riderLocationRoutes = require('./routes/rider_location.routes');
const cancelRoutes = require('./routes/cancel.routes');
const restaurantProfileRoutes = require('./routes/restaurant_profile.routes');
const restaurantControlRoutes = require('./routes/restaurant_control.routes');
const foodImagesRoutes = require('./routes/food_images.routes');
const adminWalletRoutes = require('./routes/admin_wallet.routes');
const riderWalletRoutes = require('./routes/rider_wallet.routes');
const riderOrderHistoryRoutes = require("./routes/rider_order_history.routes");
const riderProfileRoutes = require("./routes/rider_profile.routes");
const riderStatusRoutes = require("./routes/rider_status.routes");
const reportRoutes = require('./routes/report.routes');
const uploadRoutes = require('./routes/upload.routes');
const foodRoutes = require('./routes/food.routes');
const userFoodRoutes = require("./routes/user/food.routes");
const userRestaurantRoutes = require("./routes/user/restaurant.routes");
const userRestaurantFoodRoutes = require("./routes/user/restaurantFood.routes");
const userSearchRoutes = require("./routes/user/search.routes");
const userCartRoutes = require("./routes/user/cart.routes");
const userOrderRoutes = require("./routes/user/order.routes");
const userProfileRoutes = require("./routes/user_profile.routes");
app.use("/user/cart", userCartRoutes);
app.use("/user/order", userOrderRoutes);
app.use("/user/profile", userProfileRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use("/admin/settings", adminSettingsRoutes);
app.use("/admin/dashboard", adminDashboardRoutes);
app.use("/admin/requests", adminRequestRoutes);
app.use("/admin/requests/restaurants", adminRequestRestaurantRoutes);
app.use("/admin/users", adminUsersRoutes);
app.use("/admin/restaurants", adminRestaurantsRoutes);
app.use("/admin/restaurant-orders", adminRestaurantOrdersRoutes);
app.use("/admin/riders", adminRidersRoutes);
app.use("/admin/rider-orders", adminRiderOrdersRoutes);
app.use("/admin/rider-wallet", adminRiderWalletRoutes);
app.use("/admin/foods", adminFoodsRoutes);
app.use("/admin/food-details", adminFoodDetailsRoutes);
app.use("/admin/profile", adminProfileRoutes);
app.use("/admin/serviceable-areas", adminServiceableAreasRoutes);
app.use("/admin/orders", adminOrdersRoutes);
app.use("/admin/restaurant-wallet", adminRestaurantWalletRoutes);
app.use('/area', areaRoutes);
app.use('/address', addressRoutes);
app.use('/order', orderRoutes);
app.use('/order-items', orderItemsRoutes);
app.use('/dispatch', dispatchRoutes);
app.use('/rider', riderRoutes);
app.use('/rider-location', riderLocationRoutes);
app.use('/admin-wallet', adminWalletRoutes);
app.use('/rider-wallet', riderWalletRoutes);
app.use("/rider-order-history", riderOrderHistoryRoutes);
app.use('/rider-profile', riderProfileRoutes);
app.use("/rider-status", riderStatusRoutes);
app.use('/report', reportRoutes);
app.use('/upload', uploadRoutes);
app.use('/restaurant-order', restaurantOrderRoutes);
app.use('/food', foodRoutes);
app.use('/food-images', foodImagesRoutes);
app.use("/user/food", userFoodRoutes);
app.use("/user/restaurants", userRestaurantRoutes);
app.use("/user/restaurant", userRestaurantFoodRoutes);
app.use("/user/search", userSearchRoutes);
app.use('/cancel', cancelRoutes);
app.use('/restaurant-profile', restaurantProfileRoutes);
app.use('/restaurant-control', restaurantControlRoutes);
app.use('/restaurant-wallet', require('./routes/restaurant_wallet.routes'));

// ✅ STATIC
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROOT
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);

  adminFoodsService.cleanupExpiredFoods().catch(err => {
    console.error('Food cleanup failed:', err.message);
  });

  setInterval(() => {
    adminFoodsService.cleanupExpiredFoods().catch(err => {
      console.error('Food cleanup failed:', err.message);
    });
  }, 60 * 1000);
});
