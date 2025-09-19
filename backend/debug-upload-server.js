// Debug server to test upload functionality
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

const app = express();
const port = 4002; // Use different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true
}));

// Static file serving
app.use('/images', express.static(path.join(__dirname, 'upload/images'), {
  maxAge: '7d',
  etag: true,
  setHeaders: (res, filePath) => {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'X-Green-Optimized': 'true'
    });
  }
}));

// Multer configuration
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});
const upload = multer({ storage: storage });

// Basic test endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 EcoShop Backend Debug Server',
    status: 'running',
    port: port,
    endpoints: {
      upload: 'POST /upload',
      images: 'GET /images/{filename}',
      test: 'GET /test'
    }
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple upload endpoint for testing
app.post('/upload', upload.single('product'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    console.log('📁 File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    const originalPath = req.file.path;
    const originalSize = req.file.size;
    const fileNameWithoutExt = req.file.filename.split('.').slice(0, -1).join('.');
    const outputFilename = `${fileNameWithoutExt}.webp`;
    const outputPath = `./upload/images/${outputFilename}`;

    console.log('🔄 Starting image processing...');

    try {
      // Create WebP version
      await sharp(originalPath)
        .webp({ quality: 75, effort: 4 })
        .toFile(outputPath);
      
      console.log('✅ WebP conversion successful');

      // Create different sizes
      const sizes = { small: 200, medium: 400, large: 800 };
      const imagePaths = {
        original: `/images/${req.file.filename}`,
        webp: `/images/${outputFilename}`,
        sizes: {}
      };

      for (const [sizeKey, sizeValue] of Object.entries(sizes)) {
        const sizeFilename = `${fileNameWithoutExt}_${sizeValue}.webp`;
        const sizePath = `./upload/images/${sizeFilename}`;

        await sharp(originalPath)
          .resize(sizeValue, sizeValue, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75, effort: 4 })
          .toFile(sizePath);

        imagePaths.sizes[sizeKey] = `/images/${sizeFilename}`;
        console.log(`✅ Created ${sizeKey} size: ${sizeValue}px`);
      }

      // Calculate compression
      const compressedStats = fs.statSync(outputPath);
      const compressionRatio = Math.round(((originalSize - compressedStats.size) / originalSize) * 100);

      console.log('🌱 Green optimization complete:', {
        originalSize: originalSize,
        compressedSize: compressedStats.size,
        compressionRatio: `${compressionRatio}%`
      });

      // Clean up original file
      try {
        fs.unlinkSync(originalPath);
        console.log('🗑️ Original file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup warning:', cleanupError.message);
      }

      const response = {
        success: 1,
        message: 'Upload successful',
        image_url: imagePaths.webp,
        images: {
          ...imagePaths,
          metadata: {
            originalSize: originalSize,
            compressedSize: compressedStats.size,
            compressionRatio: compressionRatio,
            format: 'webp',
            quality: 75,
            uploadDate: new Date(),
            greenOptimized: true
          }
        },
        green_stats: {
          compression_ratio: `${compressionRatio}%`,
          bandwidth_saved: `${Math.round((originalSize - compressedStats.size) / 1024)} KB`,
          original_size: originalSize,
          compressed_size: compressedStats.size
        }
      };

      console.log('📤 Sending response:', JSON.stringify(response, null, 2));
      res.json(response);

    } catch (imageError) {
      console.error('❌ Image processing error:', imageError);
      res.status(500).json({
        success: 0,
        message: 'Image processing failed',
        error: imageError.message
      });
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: 0,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, (error) => {
  if (!error) {
    console.log(`✅ Debug server running on port ${port}`);
    console.log(`🌐 Test at: http://localhost:${port}`);
    console.log(`📤 Upload at: http://localhost:${port}/upload`);
    console.log(`📸 Images at: http://localhost:${port}/images/`);
    console.log('🎯 Ready for upload testing!');
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});