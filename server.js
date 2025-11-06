require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const subscriptionRoutes = require("./routes/subscription");

const app = express();

// Middleware - Allow all CORS
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

// Listen on 0.0.0.0 so it accepts external connections
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Tuteur AI Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📱 For emulator use: http://10.0.2.2:${PORT}`);
});
