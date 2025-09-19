const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const app = express();
const port = 4000;

// Simple in-memory storage for products (for testing)
let products = [];
let productIdCounter = 1;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001', // Admin panel
    'http://localhost:3002', // Frontend
    'http://localhost:3000'  // Default React port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', status: 'success' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', port: port });
});

// Test page for image display
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../image-test.html'));
});

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `product_${Date.now()}.${file.originalname.split('.').pop()}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Simple upload endpoint for testing
app.post('/upload', upload.single('product'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const baseFilename = path.parse(req.file.filename).name;
    const webpPath = `upload/images/${baseFilename}.webp`;

    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Remove original file if it's not already WebP
    if (path.extname(req.file.filename).toLowerCase() !== '.webp') {
      fs.unlinkSync(imagePath);
    }

    const imageUrl = `http://localhost:${port}/images/${baseFilename}.webp`;

    console.log('✅ Upload successful:', imageUrl);

    res.json({
      success: true,
      image_url: imageUrl,
      message: 'Upload successful'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product endpoint
app.post('/addproduct', (req, res) => {
  try {
    const product = {
      id: productIdCounter++,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      date: new Date(),
      available: true
    };
    
    products.push(product);
    console.log('✅ Product added:', product.name);
    
    res.json({
      success: true,
      product: product,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all products endpoint
app.get('/allproducts', (req, res) => {
  try {
    res.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product endpoint
app.post('/removeproduct', (req, res) => {
  try {
    const productId = parseInt(req.body.id);
    const initialLength = products.length;
    products = products.filter(product => product.id !== productId);
    
    if (products.length < initialLength) {
      console.log('✅ Product removed:', productId);
      res.json({ success: true, message: 'Product removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('❌ Error removing product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Static file serving for images
app.use('/images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static('upload/images', {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
  }
}));

// Start server
app.listen(port, () => {
  console.log('🚀 Simple Upload Server running on port', port);
  console.log('🌐 Access at: http://localhost:' + port);
  console.log('📤 Upload endpoint: http://localhost:' + port + '/upload');
  console.log('🖼️ Images served at: http://localhost:' + port + '/images/');
});

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});