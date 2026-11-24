import express from "express";
import cors from "cors";
import { getDashboardData } from "./data.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/dashboard", (req, res) => {
  res.json(getDashboardData());
});

app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
