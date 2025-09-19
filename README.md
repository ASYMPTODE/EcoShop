# 🛍️ Full Stack E-Commerce Application

A complete e-commerce solution built with React, Node.js, Express, and MongoDB. Features include product management, shopping cart, user authentication, and Stripe payment integration.

## 🚀 Features

- **Frontend**: React 18 with modern hooks and routing
- **Admin Panel**: Comprehensive product and order management
- **Backend**: RESTful API with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Stripe integration for secure transactions
- **Bulk Data**: Sample data generator for testing
- **Responsive**: Mobile-friendly design

## 🏗️ Project Structure

```
├── frontend/          # Customer-facing React application
├── admin/            # Admin panel React application  
├── backend/          # Express.js API server
├── SAMPLE_DATA_GUIDE.md
├── SETUP_GUIDE.md
└── STRIPE_INTEGRATION_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ASYMPTODE/EcoShop.git
   cd EcoShop
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install

   # Install admin dependencies
   cd ../admin
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` files in each directory
   - Update with your MongoDB and Stripe credentials

4. **Start the applications**
   ```bash
   # Terminal 1: Start backend (Port 4000)
   cd backend
   node index.js

   # Terminal 2: Start admin panel (Port 3001)
   cd admin
   npm start

   # Terminal 3: Start frontend (Port 3002)
   cd frontend
   npm start
   ```

## 🌐 Access URLs

- **Frontend**: http://localhost:3002
- **Admin Panel**: http://localhost:3001  
- **Backend API**: http://localhost:4000

##  Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

**Frontend (.env)**
```env
PORT=3002
REACT_APP_BACKEND_URL=http://localhost:4000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Admin (.env)**
```env
PORT=3001
REACT_APP_BACKEND_URL=http://localhost:4000
```

## 🛠️ API Endpoints

### Products
- `GET /allproducts` - Get all products
- `POST /addproduct` - Add new product
- `POST /removeproduct` - Remove product
- `POST /generate-sample-products` - Generate sample data

### Users
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /addtocart` - Add item to cart
- `POST /removefromcart` - Remove from cart

## 💳 Payment Integration

This project includes Stripe integration for payments:

1. Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Update environment variables
3. Test with Stripe test cards

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  Acknowledgments

- React team for the amazing framework
- Stripe for payment processing
- MongoDB for the database solution
- Express.js for the backend framework

---

**Happy Shopping! 🛒**