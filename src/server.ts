import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import appRoutes from "./routes/index";

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initialize Express app
const app = express();

// ✅ CORS
app.use(cors({ origin: FRONTEND_URL }));

// ✅ Stripe webhook route needs RAW body
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use('/invoices', express.static(path.join(__dirname, '../invoices')));


// ✅ Use body parser for other routes
app.use(bodyParser.json());

// ✅ Register routes
app.use(appRoutes);

// ✅ Default route
app.get("/", (req, res) => {
    res.send("✅ Stripe Backend Running");
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
