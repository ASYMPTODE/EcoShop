// Working upload test server for image troubleshooting
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const app = express();
const port = 4003; // Different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));

// Enhanced static file serving for images with proper headers
app.use('/images', express.static(path.join(__dirname, 'upload/images'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'X-Green-Optimized': 'true',
      'Cache-Control': 'public, max-age=604800'
    });
    console.log(`📸 Serving image: ${path.basename(filePath)}`);
  }
}));

// Create upload directory if it doesn't exist
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created upload directory');
}

// Enhanced multer configuration
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}_${timestamp}${ext}`;
    console.log(`📁 Saving file as: ${filename}`);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('🔍 File validation:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  // Accept common image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File accepted');
    cb(null, true);
  } else {
    console.log('❌ File rejected - invalid type');
    cb(new Error(`Only image files are allowed. Got: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Test endpoints
app.get('/', (req, res) => {
  res.json({
    message: '🖼️ Image Upload Test Server',
    status: 'running',
    port: port,
    endpoints: {
      upload: 'POST /upload',
      images: 'GET /images/{filename}',
      test: 'GET /test-image'
    }
  });
});

app.get('/test-image', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const imageFiles = files.filter(file => 
      file.endsWith('.webp') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.png')
    );
    
    res.json({
      status: 'Images directory accessible',
      totalImages: imageFiles.length,
      sampleImages: imageFiles.slice(0, 5),
      testUrls: imageFiles.slice(0, 3).map(file => `/images/${file}`)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced upload endpoint
app.post('/upload', upload.single('product'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('📋 Request details:', {
      headers: req.headers,
      body: Object.keys(req.body),
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      } : 'No file'
    });

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        success: 0, 
        message: 'No file uploaded',
        debug: {
          contentType: req.headers['content-type'],
          body: req.body
        }
      });
    }

    const originalPath = req.file.path;
    const originalSize = req.file.size;
    const fileNameWithoutExt = req.file.filename.split('.').slice(0, -1).join('.');
    
    console.log('🔄 Processing image:', {
      originalPath,
      originalSize,
      fileNameWithoutExt
    });

    // Create WebP versions
    const sizes = { small: 200, medium: 400, large: 800 };
    const imageData = {
      original: `/images/${req.file.filename}`,
      webp: `/images/${fileNameWithoutExt}.webp`,
      sizes: {}
    };

    let totalCompressedSize = 0;

    // Generate responsive images
    for (const [sizeKey, sizeValue] of Object.entries(sizes)) {
      const sizeFilename = `${fileNameWithoutExt}_${sizeValue}.webp`;
      const sizePath = path.join(uploadDir, sizeFilename);

      try {
        await sharp(originalPath)
          .resize(sizeValue, sizeValue, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toFile(sizePath);

        const stats = fs.statSync(sizePath);
        totalCompressedSize += stats.size;
        imageData.sizes[sizeKey] = `/images/${sizeFilename}`;
        
        console.log(`✅ Created ${sizeKey} (${sizeValue}px): ${stats.size} bytes`);
      } catch (sizeError) {
        console.warn(`⚠️ Failed to create ${sizeKey} size:`, sizeError.message);
      }
    }

    // Create main WebP version
    const mainWebpPath = path.join(uploadDir, `${fileNameWithoutExt}.webp`);
    try {
      await sharp(originalPath)
        .webp({ quality: 75, effort: 4 })
        .toFile(mainWebpPath);
      
      const mainStats = fs.statSync(mainWebpPath);
      totalCompressedSize += mainStats.size;
      console.log(`✅ Created main WebP: ${mainStats.size} bytes`);
    } catch (webpError) {
      console.warn('⚠️ Failed to create main WebP:', webpError.message);
      // Use original file as fallback
      imageData.webp = imageData.original;
    }

    // Calculate compression ratio
    const compressionRatio = originalSize > 0 ? Math.round(((originalSize - totalCompressedSize) / originalSize) * 100) : 0;

    console.log('🌱 Green optimization complete:', {
      originalSize,
      totalCompressedSize,
      compressionRatio: `${compressionRatio}%`,
      bandwidthSaved: `${Math.round((originalSize - totalCompressedSize) / 1024)} KB`
    });

    const response = {
      success: 1,
      message: 'Upload and optimization successful',
      image_url: imageData.webp,
      images: {
        ...imageData,
        metadata: {
          originalSize,
          compressedSize: totalCompressedSize,
          compressionRatio,
          format: 'webp',
          quality: 75,
          uploadDate: new Date(),
          greenOptimized: true
        }
      },
      green_stats: {
        compression_ratio: `${compressionRatio}%`,
        bandwidth_saved: `${Math.round((originalSize - totalCompressedSize) / 1024)} KB`,
        original_size: originalSize,
        compressed_size: totalCompressedSize
      }
    };

    console.log('📤 Sending success response');
    res.json(response);

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: 0,
      message: 'Upload failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(port, '0.0.0.0', (error) => {
  if (!error) {
    console.log(`✅ Image Upload Test Server running on port ${port}`);
    console.log(`🌐 Test at: http://localhost:${port}`);
    console.log(`📤 Upload endpoint: http://localhost:${port}/upload`);
    console.log(`📸 Images served at: http://localhost:${port}/images/`);
    console.log(`🔍 Test images: http://localhost:${port}/test-image`);
    console.log('');
    console.log('🎯 To use this server for testing:');
    console.log(`   1. Change admin backend_url to 'http://localhost:${port}'`);
    console.log('   2. Try uploading your image');
    console.log('   3. Check this console for detailed logs');
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});