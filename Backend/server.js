import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import roadmapRoutes from "./routes/roadmapRoute.js";

const app = express();
dotenv.config();
connectDB();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


app.get("/", (req, res) => {
    res.send("hello");
});
