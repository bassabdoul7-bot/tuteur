require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const subscriptionRoutes = require("./routes/subscription");

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(bodyParser.json());

// Database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tuteur-ai", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected")).catch(err => console.log("❌ DB Error:", err));

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running!", time: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);

// Use Railway PORT or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Tuteur AI Backend running on port ${PORT}`);
  console.log(`📱 MongoDB: ${process.env.MONGODB_URI ? 'Atlas' : 'Local'}`);
});
