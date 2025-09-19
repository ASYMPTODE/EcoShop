const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const rateLimit = require("express-rate-limit");
const cache = require("memory-cache");
require("dotenv").config();

// Initialize Stripe only if secret key is properly configured
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key_here')) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  console.log('💳 Stripe initialized successfully');
} else {
  console.log('⚠️ Warning: Stripe not initialized. Please configure STRIPE_SECRET_KEY in .env file for payment processing.');
}
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rate limiting middleware to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

// Apply rate limiting to all routes
app.use("/api/", apiLimiter);

// Enhanced cache middleware with green software principles
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = cache.get(key);

    if (cachedBody) {
      console.log(`🌱 Green Cache Hit: ${key} - Saving server resources`);
      // Set cache headers for client-side caching
      res.set({
        'Cache-Control': `public, max-age=${duration}`,
        'X-Green-Cache': 'HIT'
      });
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        // Only cache if response is not too large (green principle)
        if (body && body.length < 1024 * 1024) { // 1MB limit
          cache.put(key, body, duration * 1000);
          console.log(`🌱 Green Cache Stored: ${key} - Optimizing future requests`);
        }
        res.sendResponse(body);
      };
      next();
    }
  };
};

// Database Connection With MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database connection event listeners
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});


// Import Sharp for image processing
const sharp = require('sharp');
const fs = require('fs');

//Image Storage Engine 
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage: storage })

// Image upload with compression and format conversion
app.post("/upload", upload.single('product'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    const originalPath = req.file.path;
    const fileNameWithoutExt = req.file.filename.split('.').slice(0, -1).join('.');
    const outputFilename = `${fileNameWithoutExt}.webp`;
    const outputPath = `./upload/images/${outputFilename}`;

    // Create different sizes for responsive images
    const sizes = [800, 400, 200];
    const outputPaths = [];

    // Create a temporary copy for processing to avoid same file input/output issue
    const tempPath = `./upload/images/temp_${Date.now()}.tmp`;
    fs.copyFileSync(originalPath, tempPath);

    for (const size of sizes) {
      const sizeFilename = `${fileNameWithoutExt}_${size}.webp`;
      const sizePath = `./upload/images/${sizeFilename}`;

      // Process image with Sharp - resize and convert to WebP (Green optimized)
      await sharp(tempPath)
        .resize({
          width: size,
          height: size,
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .webp({
          quality: 75, // Reduced quality for better compression (green principle)
          effort: 4    // Lower effort for faster processing (green principle)
        })
        .toFile(sizePath);

      console.log(`🌱 Green Optimized: ${sizeFilename} (${size}px) - WebP 75% quality`);

      outputPaths.push({
        size,
        path: `/images/${sizeFilename}`
      });
    }

    // Create a full-size WebP version as well (Green optimized)
    try {
      await sharp(tempPath)
        .webp({
          quality: 75, // Reduced quality for better compression
          effort: 4    // Lower effort for faster processing
        })
        .toFile(outputPath);
      console.log(`🌱 Green Full-size WebP created: ${outputFilename} (75% quality)`);
    } catch (error) {
      console.error('Error creating full-size WebP:', error);
      // If full-size creation fails, use the 800px version as fallback
      const fallbackPath = `./upload/images/${fileNameWithoutExt}_800.webp`;
      if (fs.existsSync(fallbackPath)) {
        fs.copyFileSync(fallbackPath, outputPath);
        console.log('🌱 Green Fallback: Using 800px version for full-size image');
      }
    }

    // Remove the original and temporary files to save space
    try {
      fs.unlinkSync(originalPath);
      console.log('Original file deleted successfully');
    } catch (error) {
      console.warn('Warning: Could not delete original file:', error.message);
    }

    try {
      fs.unlinkSync(tempPath);
      console.log('Temporary file deleted successfully');
    } catch (error) {
      console.warn('Warning: Could not delete temporary file:', error.message);
    }

    res.json({
      success: 1,
      image_url: `/images/${outputFilename}`,
      responsive_images: outputPaths
    });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      success: 0,
      message: 'Error processing image'
    });
  }
})


// Optimized static file serving with green software principles
app.use('/images', express.static('upload/images', {
  maxAge: '7d', // Cache images for 7 days to reduce server load
  etag: true,   // Enable ETags for efficient caching
  lastModified: true, // Enable last-modified headers
  setHeaders: (res, path) => {
    // Add green software headers
    res.set({
      'X-Green-Optimized': 'true',
      'X-Content-Type': path.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    });

    // Add compression hints for better performance
    if (path.endsWith('.webp')) {
      res.set('Content-Encoding', 'identity'); // WebP is already compressed
    }
  }
}));


// MiddleWare to fetch user from token
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


// Schema for creating user model
const Users = mongoose.model("Users", {
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now() },
});


// Schema for creating Product
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});


// ROOT API Route For Testing
app.get("/", (req, res) => {
  res.send("Root");
});

// Green Software Monitoring Endpoint
app.get("/green-status", (req, res) => {
  const cacheStats = {
    size: cache.size(),
    keys: cache.keys().length
  };

  const greenMetrics = {
    timestamp: new Date().toISOString(),
    cache: cacheStats,
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    optimizations: {
      imageCompression: "WebP 75% quality",
      caching: "7-day client cache",
      lazyLoading: "Enabled",
      responsiveImages: "Multiple sizes generated"
    }
  };

  res.json({
    status: "🌱 Green Software Optimized",
    metrics: greenMetrics
  });
});

// Green Software Monitoring Endpoint
app.get("/green-status", (req, res) => {
  const cacheStats = {
    size: cache.size(),
    keys: cache.keys().length
  };

  const greenMetrics = {
    timestamp: new Date().toISOString(),
    cache: cacheStats,
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    optimizations: {
      imageCompression: "WebP 80% quality",
      caching: "7-day client cache",
      lazyLoading: "Enabled",
      responsiveImages: "Multiple sizes generated"
    }
  };

  res.json({
    status: "🌱 Green Software Optimized",
    metrics: greenMetrics
  });
});


// Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    console.log("Login");
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
          const data = {
            user: {
              id: user.id
            }
          }
          success = true;
          console.log(user.id);
          const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1d' });
          res.json({ success, token });
        }
        else {
          return res.status(400).json({ success, errors: "please try with correct email/password" })
        }
      }
      else {
        return res.status(400).json({ success, errors: "please try with correct email/password" })
      }
    } catch (err) {
      next(err);
    }
  }
)


//Create an endpoint at ip/auth for regestring the user & sending auth-token
app.post('/signup',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    console.log("Sign Up");
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let check = await Users.findOne({ email: req.body.email });
      if (check) {
        return res.status(400).json({ success, errors: "existing user found with this email" });
      }
      let cart = {};
      for (let i = 0; i < 300; i++) {
        cart[i] = 0;
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        cartData: cart,
      });
      await user.save();
      const data = {
        user: {
          id: user.id
        }
      }
      const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1d' });
      success = true;
      res.json({ success, token })
    } catch (err) {
      next(err);
    }
  }
)
// Swagger API Documentation setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for E-Commerce backend",
    },
  },
  apis: [__filename],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// endpoint for getting all products data with pagination
app.get("/allproducts", cacheMiddleware(60), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const category = req.query.category || '';
    
    // Build query based on category filter
    const query = category ? { category } : {};
    
    // Use Promise.all to run queries concurrently for better performance
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);
    
    console.log(`Paginated Products - Page: ${page}, Limit: ${limit}, Category: ${category}`);
    
    // Send response with pagination metadata
    res.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});


// endpoint for getting latest products data with pagination
app.get("/newcollections", cacheMiddleware(60), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    
    // Use Promise.all to run queries concurrently for better performance
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments({}),
      Product.find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);
    
    console.log(`Paginated New Collections - Page: ${page}, Limit: ${limit}`);
    
    // Send response with pagination metadata
    res.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ error: "Failed to fetch new collections" });
  }
});


// endpoint for getting womens products data with pagination
app.get("/popularinwomen", cacheMiddleware(60), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;
    
    const query = { category: "women" };
    
    // Use Promise.all to run queries concurrently for better performance
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);
    
    console.log(`Paginated Popular In Women - Page: ${page}, Limit: ${limit}`);
    
    // Send response with pagination metadata
    res.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching women's products:", error);
    res.status(500).json({ error: "Failed to fetch women's products" });
  }
});

// endpoint for getting related products data with pagination
app.post("/relatedproducts", cacheMiddleware(60), async (req, res) => {
  try {
    const { category } = req.body;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 4;
    const skip = (page - 1) * limit;
    
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    
    const query = { category };
    
    // Use Promise.all to run queries concurrently for better performance
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);
    
    console.log(`Paginated Related Products - Category: ${category}, Page: ${page}, Limit: ${limit}`);
    
    // Send response with pagination metadata
    res.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
});


// Create an endpoint for saving the product in cart
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  // Return updated cart
  let cartData = userData.cartData;
  let productIds = Object.keys(cartData).filter(id => cartData[id] > 0);
  let products = await Product.find({ id: { $in: productIds.map(Number) } });
  let cartItems = products.map(product => ({
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.new_price,
    quantity: cartData[product.id],
    total: cartData[product.id] * product.new_price
  }));
  let totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);
  res.json({ items: cartItems, totalPrice });
})


// Create an endpoint for removing the product in cart
app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  const userCartData = await Users.findOne({ _id: req.user.id });

  if (userCartData.cartData[req.body.itemId] && userCartData.cartData[req.body.itemId] > 0) {
    userCartData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userCartData.cartData });

    // Return updated cart
    let cartData = userCartData.cartData;
    let productIds = Object.keys(cartData).filter(id => cartData[id] > 0);
    let products = await Product.find({ id: { $in: productIds.map(Number) } });
    let cartItems = products.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.new_price,
      quantity: cartData[product.id],
      total: cartData[product.id] * product.new_price
    }));
    let totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);
    res.json({ items: cartItems, totalPrice });
  } else {
    res.json({ items: [], totalPrice: 0, message: "Item not in cart or already zero" });
  }
})


// Create an endpoint for getting cartdata of user
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  let cartData = userData.cartData;
  let productIds = Object.keys(cartData).filter(id => cartData[id] > 0);
  let products = await Product.find({ id: { $in: productIds.map(Number) } });
  let cartItems = products.map(product => ({
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.new_price,
    quantity: cartData[product.id],
    total: cartData[product.id] * product.new_price
  }));
  let totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);
  res.json({ items: cartItems, totalPrice });
})


// Create an endpoint for adding products using admin panel
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  }
  else { id = 1; }
  const product = new Product({
    id: id,
    name: req.body.name,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name })
});


// Create an endpoint for removing products using admin panel
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name })
});

// Bulk sample data generator endpoint
app.post("/generate-sample-products", async (req, res) => {
  try {
    console.log("Generating 100 sample products...");
    
    const categories = ['men', 'women', 'kid'];
    const productTypes = {
      men: ['T-Shirt', 'Jeans', 'Shirt', 'Hoodie', 'Jacket', 'Pants', 'Shorts', 'Sneakers', 'Shoes', 'Watch'],
      women: ['Dress', 'Blouse', 'Skirt', 'Jeans', 'Top', 'Jacket', 'Pants', 'Heels', 'Handbag', 'Jewelry'],
      kid: ['T-Shirt', 'Shorts', 'Dress', 'Pants', 'Hoodie', 'Shoes', 'Backpack', 'Cap', 'Sweater', 'Jacket']
    };
    
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Yellow', 'Purple', 'Orange', 'Gray'];
    const brands = ['StyleCo', 'FashionHub', 'TrendWear', 'ModernStyle', 'ChicClothing', 'UrbanFashion', 'ClassicWear', 'SportStyle'];
    
    // Get current highest product ID
    let products = await Product.find({});
    let startId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    const sampleProducts = [];
    
    for (let i = 0; i < 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const productType = productTypes[category][Math.floor(Math.random() * productTypes[category].length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      
      const basePrice = Math.floor(Math.random() * 2000) + 300; // Price between 300-2300
      const discount = Math.floor(Math.random() * 40) + 10; // 10-50% discount
      const newPrice = Math.floor(basePrice * (100 - discount) / 100);
      
      const product = {
        id: startId + i,
        name: `${brand} ${color} ${productType}`,
        description: `Premium quality ${color.toLowerCase()} ${productType.toLowerCase()} from ${brand}. Perfect for ${category === 'kid' ? 'kids' : category === 'men' ? 'men' : 'women'}. Comfortable, stylish, and durable.`,
        image: `https://via.placeholder.com/300x300/000000/ffffff?text=${encodeURIComponent(productType)}`,
        category: category,
        new_price: newPrice,
        old_price: basePrice,
        avilable: true,
        date: new Date()
      };
      
      sampleProducts.push(product);
    }
    
    // Insert all products
    await Product.insertMany(sampleProducts);
    
    console.log("✅ 100 sample products generated successfully!");
    res.json({ 
      success: true, 
      message: "100 sample products generated successfully!",
      productsAdded: 100,
      startingId: startId,
      endingId: startId + 99
    });
    
  } catch (error) {
    console.error("Error generating sample products:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate sample products",
      details: error.message 
    });
  }
});

// ========== STRIPE PAYMENT ENDPOINTS ==========

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment processing unavailable. Stripe not configured.' 
      });
    }
    
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    // Add sustainability metadata
    const sustainabilityMetadata = {
      ...metadata,
      platform: 'green-ecommerce',
      carbon_neutral: 'true',
      eco_friendly: 'true'
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: sustainabilityMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment Intent created:', paymentIntent.id);
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Confirm Payment
app.post('/api/confirm-payment', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment processing unavailable. Stripe not configured.' 
      });
    }
    
    const { paymentIntentId, orderId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Here you would typically:
      // - Update order status in database
      // - Send confirmation email
      // - Update inventory
      // - Clear user's cart
      
      console.log('Payment confirmed successfully:', paymentIntentId);
      res.json({ 
        success: true, 
        message: 'Payment confirmed successfully',
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({type: 'application/json'}), (req, res) => {
  if (!stripe) {
    console.log('Webhook received but Stripe not configured');
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('🌱 Green Payment succeeded:', paymentIntent.id);
      // Handle successful payment
      // - Update order status
      // - Send confirmation email
      // - Update inventory
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      // - Send failure notification
      // - Log the failure reason
      break;
    case 'payment_intent.created':
      console.log('Payment intent created:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Clear user cart after successful payment
app.post('/api/clear-cart', fetchuser, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Verify payment was successful if Stripe is configured
    if (paymentIntentId && stripe) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ success: false, message: 'Payment not successful' });
      }
    } else if (paymentIntentId && !stripe) {
      console.log('Payment verification skipped - Stripe not configured');
    }
    
    // Clear the user's cart
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    
    await Users.findOneAndUpdate(
      { _id: req.user.id }, 
      { cartData: cart }
    );
    
    console.log('Cart cleared for user:', req.user.id);
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Starting Express Server
app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
