const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "shutdownButtons.json");

// Utility functions to read/write JSON file
const readButtons = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data || "[]");
};

const writeButtons = (buttons) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(buttons, null, 2));
};

// GET all shutdown buttons
app.get("/api/shutdown-buttons", (req, res) => {
  const shutdownButtons = readButtons();
  res.json(shutdownButtons);
});

// GET single shutdown state
app.get("/api/shutdown/:id", (req, res) => {
  const shutdownButtons = readButtons();
  const { id } = req.params;
  const button = shutdownButtons.find((b) => b.id == id);

  if (!button) {
    return res.status(404).json({ success: false, message: "Button not found" });
  }

  res.json({ id: button.id, name: button.name, shutdown: button.shutdown });
});

// Create a new shutdown button
app.post("/api/shutdown-buttons", (req, res) => {
  const shutdownButtons = readButtons();
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: "Name required" });

  const newButton = { id: Date.now(), name, shutdown: false };
  shutdownButtons.push(newButton);
  writeButtons(shutdownButtons);
  res.json({ success: true, button: newButton });
});

// Toggle shutdown for a specific button
app.post("/api/shutdown/:id", (req, res) => {
  const shutdownButtons = readButtons();
  const { id } = req.params;
  const button = shutdownButtons.find((b) => b.id == id);

  if (!button) {
    return res.status(404).json({ success: false, message: "Button not found" });
  }

  button.shutdown = !button.shutdown;
  writeButtons(shutdownButtons);
  res.json({ success: true, button });
});

// DELETE a shutdown button
app.delete("/api/shutdown-buttons/:id", (req, res) => {
  let shutdownButtons = readButtons();
  const { id } = req.params;
  const index = shutdownButtons.findIndex((b) => b.id == id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Button not found" });
  }

  shutdownButtons.splice(index, 1);
  writeButtons(shutdownButtons);
  res.json({ success: true, message: "Button deleted" });
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
