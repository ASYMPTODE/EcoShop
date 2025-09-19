// Simple test server to verify backend functionality
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 4001; // Use different port to avoid conflicts

app.use(express.json());
app.use(cors());

// Static file serving for images
app.use('/images', express.static(path.join(__dirname, 'upload/images'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.set({
      'X-Green-Optimized': 'true',
      'Access-Control-Allow-Origin': '*'
    });
  }
}));

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🌱 EcoShop Backend - Green Software Optimized',
    status: 'running',
    imageEndpoint: '/images/',
    port: port
  });
});

// Green status endpoint
app.get('/green-status', (req, res) => {
  res.json({
    status: '🌱 Green Software Optimized',
    timestamp: new Date().toISOString(),
    features: {
      imageCompression: 'WebP 75% quality',
      staticFileOptimization: 'ETags and 7-day cache',
      responsiveImages: 'Multiple sizes (200px, 400px, 800px)'
    }
  });
});

// Test image listing
app.get('/list-images', (req, res) => {
  const fs = require('fs');
  try {
    const uploadDir = path.join(__dirname, 'upload/images');
    const files = fs.readdirSync(uploadDir);
    const imageFiles = files.filter(file => 
      file.endsWith('.webp') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.png')
    );
    
    res.json({
      total: imageFiles.length,
      images: imageFiles.slice(0, 10), // Show first 10
      sampleUrls: imageFiles.slice(0, 3).map(file => `/images/${file}`)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log(`✅ Simple backend running on port ${port}`);
    console.log(`🌐 Test at: http://localhost:${port}`);
    console.log(`📸 Images at: http://localhost:${port}/images/`);
    console.log(`🌱 Green status: http://localhost:${port}/green-status`);
  } else {
    console.error("❌ Server error:", error);
  }
});