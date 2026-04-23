import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import pdf from "pdf-parse-fork";
import mammoth from "mammoth";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("syllabisync.db");
db.pragma("foreign_keys = ON");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    goal_grade REAL
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    class_id TEXT,
    name TEXT NOT NULL,
    due_date TEXT,
    weight REAL,
    category TEXT,
    status TEXT DEFAULT 'not started',
    priority TEXT DEFAULT 'Medium',
    estimated_time REAL,
    difficulty INTEGER,
    grade REAL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id TEXT PRIMARY KEY,
    class_id TEXT,
    day_of_week TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  });

  // API Routes
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
  });

  app.get("/api/classes", (req, res) => {
    try {
      const classes = db.prepare("SELECT * FROM classes").all();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", (req, res) => {
    try {
      const { name, color, goal_grade } = req.body;
      const id = uuidv4();
      db.prepare("INSERT INTO classes (id, name, color, goal_grade) VALUES (?, ?, ?, ?)")
        .run(id, name, color || "#1e3a8a", goal_grade || 0);
      res.json({ id, name, color, goal_grade });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  });

  app.delete("/api/classes/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Deleting class: ${id}`);
    try {
      const result = db.prepare("DELETE FROM classes WHERE id = ?").run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: "Class not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ error: "Failed to delete class" });
    }
  });

  app.get("/api/assignments", (req, res) => {
    try {
      const assignments = db.prepare("SELECT * FROM assignments").all();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", (req, res) => {
    try {
      const { class_id, name, due_date, weight, category, status, priority, estimated_time, difficulty, grade } = req.body;
      const id = uuidv4();
      db.prepare(`
        INSERT INTO assignments (id, class_id, name, due_date, weight, category, status, priority, estimated_time, difficulty, grade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, class_id, name, due_date, weight, category, status, priority, estimated_time, difficulty, grade);
      res.json({ id, ...req.body });
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  app.put("/api/assignments/:id", (req, res) => {
    try {
      const { name, due_date, weight, category, status, priority, estimated_time, difficulty, grade } = req.body;
      db.prepare(`
        UPDATE assignments 
        SET name = ?, due_date = ?, weight = ?, category = ?, status = ?, priority = ?, estimated_time = ?, difficulty = ?, grade = ?
        WHERE id = ?
      `).run(name, due_date, weight, category, status, priority, estimated_time, difficulty, grade, req.params.id);
      res.json({ id: req.params.id, ...req.body });
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/assignments/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM assignments WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  app.get("/api/lectures", (req, res) => {
    try {
      const lectures = db.prepare("SELECT * FROM lectures").all();
      res.json(lectures);
    } catch (error) {
      console.error("Error fetching lectures:", error);
      res.status(500).json({ error: "Failed to fetch lectures" });
    }
  });

  app.post("/api/lectures", (req, res) => {
    try {
      const { class_id, day_of_week, start_time, end_time, location } = req.body;
      const id = uuidv4();
      db.prepare(`
        INSERT INTO lectures (id, class_id, day_of_week, start_time, end_time, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, class_id, day_of_week, start_time, end_time, location);
      res.json({ id, ...req.body });
    } catch (error) {
      console.error("Error creating lecture:", error);
      res.status(500).json({ error: "Failed to create lecture" });
    }
  });

  app.delete("/api/lectures/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM lectures WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting lecture:", error);
      res.status(500).json({ error: "Failed to delete lecture" });
    }
  });

  // File Parsing Route
  app.post("/api/parse-syllabus", (req, res, next) => {
    console.log("POST /api/parse-syllabus hit");
    next();
  }, upload.single("file"), async (req, res) => {
    console.log("Multer finished processing file:", req.file ? req.file.originalname : "No file");
    try {
      if (!req.file) {
        console.warn("No file in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      let text = "";
      const mimeType = req.file.mimetype;

      if (mimeType === "application/pdf") {
        console.log("Parsing PDF...");
        const data = await pdf(req.file.buffer);
        text = data.text;
        console.log("PDF parsed successfully, text length:", text.length);
      } else if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        console.log("Parsing DOCX...");
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
        console.log("DOCX parsed successfully, text length:", text.length);
      } else if (mimeType === "text/plain") {
        console.log("Parsing TXT...");
        text = req.file.buffer.toString("utf-8");
        console.log("TXT parsed successfully, text length:", text.length);
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      res.json({ text });
    } catch (error) {
      console.error("Parsing error:", error);
      res.status(500).json({ error: "Failed to parse file: " + (error instanceof Error ? error.message : String(error)) });
    }
  });

  // Global Error Handler for API routes
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });

  // 404 Handler for API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();