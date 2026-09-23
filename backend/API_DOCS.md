# 🚀 CHUTKI API DOCUMENTATION

## AUTH
POST /auth/register  
POST /auth/login  

---

## ADDRESS
POST /address/add  
GET /address/:user_id  
POST /address/delete  

---

## ORDER
POST /order/place  

---

## ORDER ITEMS
POST /order-items/add  

---

## RESTAURANT
POST /restaurant-order/update-status  

---

## RIDER
POST /rider/picked  
POST /rider/delivered  

---

## CANCEL
POST /cancel/user  
POST /cancel/restaurant  
POST /cancel/rider  

---

## WALLET

### Rider
POST /rider-wallet/submit-cod  

### Admin
GET /admin-wallet/summary  

### Restaurant
GET /restaurant-wallet/:restaurant_id  

---

## REPORT
GET /report  

---

## RESPONSE FORMAT

SUCCESS:
{
  "success": true,
  "message": "...",
  "data": {}
}

ERROR:
{
  "success": false,
  "message": "Error message"
}
