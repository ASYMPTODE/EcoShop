const express = require("express");
const app = express();

// Enable CORS for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Test endpoint
app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Server working", timestamp: new Date().toISOString() });
});

app.get("/green-status", (req, res) => {
  console.log("Green status endpoint hit");
  res.json({ 
    status: "🌱 Green Software Optimized",
    test: true,
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

const port = 4001;

// Add error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, (error) => {
  if (!error) {
    console.log("✅ Test Server Running successfully on port " + port);
    console.log("📊 Endpoints available:");
    console.log("  - http://localhost:4000/test");
    console.log("  - http://localhost:4000/green-status");
  } else {
    console.log("❌ Error starting server:", error);
  }
});