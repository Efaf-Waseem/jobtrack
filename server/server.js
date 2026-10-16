require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  date: String,
  status: { type: String, default: "applied" },
});

const Job = mongoose.model("Job", jobSchema);

app.get("/", (req, res) => {
  res.send("JobTrack API is running");
});

app.get("/api/jobs", async (req, res) => {
  const jobs = await Job.find().sort({ _id: -1 });
  res.json(jobs);
});

app.post("/api/jobs", async (req, res) => {
  const job = await Job.create(req.body);
  res.json(job);
});

app.put("/api/jobs/:id", async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(job);
});

app.delete("/api/jobs/:id", async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});