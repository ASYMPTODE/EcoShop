# Sample Data Generation Guide

## ✅ Issues Resolved
### Frontend Port Issue ✅
- Frontend now runs on port 3002 (http://localhost:3002)
- Admin panel runs on port 3001 (http://localhost:3001)
- Backend runs on port 4000 (http://localhost:4000)

### Stripe Integration Issue ✅
- Fixed React hook conflicts with Stripe Elements
- Stripe now only loads when properly configured
- App works normally without valid Stripe keys
- Ready for production Stripe integration

## 🎲 How to Generate 100 Sample Products

### Method 1: Through Admin Panel (Recommended)
1. Start your backend server: `cd backend && node index.js`
2. Start your admin panel: `cd admin && npm start`
3. Navigate to the "Add Product" section in the admin panel
4. Scroll down to see the "Sample Data Generator" section
5. Click "🎲 Generate 100 Sample Products" button
6. Confirm the action when prompted
7. Wait for the success message

### Method 2: Direct API Call
You can also call the endpoint directly:

```bash
curl -X POST http://localhost:4000/generate-sample-products \
  -H "Content-Type: application/json"
```

Or using a tool like Postman:
- Method: POST
- URL: http://localhost:4000/generate-sample-products
- Headers: Content-Type: application/json

## 📊 What Gets Generated
The sample data generator creates 100 products with:
- **Categories**: Men, Women, Kids (randomly distributed)
- **Product Types**: T-Shirts, Jeans, Dresses, Shoes, etc.
- **Colors**: Red, Blue, Green, Black, White, Pink, etc.
- **Brands**: StyleCo, FashionHub, TrendWear, etc.
- **Prices**: Random prices between ₹300-₹2300 with realistic discounts
- **Images**: Placeholder images with product type text
- **Descriptions**: Auto-generated descriptions

## 🔄 Running Your Apps

### Start Backend (Port 4000)
```bash
cd backend
node index.js
```

### Start Admin Panel (Port 3001)
```bash
cd admin
npm start
```

### Start Frontend (Port 3002)
```bash
cd frontend
npm start
```

## 🌐 Access URLs
- **Frontend (Customer)**: http://localhost:3002
- **Admin Panel**: http://localhost:3001
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs

## 🛠️ Troubleshooting
- If you get port conflicts, check the .env files in each folder
- Make sure MongoDB is running and connection string is correct
- Restart servers after making changes to .env files
- **Stripe Errors**: If you see React hook errors, ensure you have the latest App.js with conditional Stripe loading

## 🔧 Stripe Configuration (Optional)
To enable payment processing:
1. Get your Stripe publishable key from https://stripe.com
2. Update `frontend/.env`:
   ```
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_key_here
   ```
3. Restart the frontend application
4. Payments will now work in the cart/checkout flow

## 🎯 Features Added
- ✅ Port conflict resolution
- ✅ Bulk sample data generation
- ✅ User-friendly admin interface for data generation
- ✅ Error handling and loading states
- ✅ Confirmation dialogs for safety
- ✅ Stripe integration fix (conditional loading)
- ✅ React hook error resolution

## 🚀 Quick Start Guide
1. **Start Backend**: `cd backend && node index.js`
2. **Start Admin**: `cd admin && npm start` 
3. **Start Frontend**: `cd frontend && npm start`
4. **Generate Sample Data**: Use admin panel → Add Product → Generate 100 Sample Products
5. **Test Shopping**: Visit http://localhost:3002 to see your products

Enjoy testing with your 100 sample products! 🎉