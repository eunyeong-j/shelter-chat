const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const port = 5050;

// CORS configuration
const corsOptions = {
  origin: ["http://localhost:5000", "http://192.168.0.126:5000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const db = new sqlite3.Database("./mydb.sqlite");

db.serialize(() => {
  // TODO: 개발 완료시 테이블 삭제 후 다시 생성 로직 제거
  db.run("DROP TABLE IF EXISTS USERS");
  db.run("DROP TABLE IF EXISTS MESSAGES");

  db.run(
    "CREATE TABLE IF NOT EXISTS USERS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, IP TEXT, bgColor TEXT, isOnline BOOLEAN DEFAULT FALSE, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS MESSAGES (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, message TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES USERS(id))"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS LOGS (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, action TEXT, details TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES USERS(id))"
  );

  // DELETE ALL DATA
  db.run("DELETE FROM USERS");
  db.run("DELETE FROM MESSAGES");
  db.run("DELETE FROM LOGS");

  // SAMPLE_DATA.js 데이터 삽입
  const DEFAULT_USERS = [
    {
      name: "Admin",
      image: "/image-admin.png",
      IP: "192.168.0.126",
      bgColor: "#fff4ff",
    },
    {
      name: "MK",
      image: "/image-1.png",
      IP: "192.168.0.73",
      bgColor: "#ffe9e6",
    },
    {
      name: "DS",
      image: "/image-2.png",
      IP: "192.168.0.34",
      bgColor: "#ffe888",
    },
    {
      name: "JH",
      image: "/image-3.png",
      IP: "192.168.0.48",
      bgColor: "#ffaa88",
    },
  ];

  DEFAULT_USERS.forEach((user) => {
    db.run("INSERT INTO USERS (name, image, IP, bgColor) VALUES (?, ?, ?, ?)", [
      user.name,
      user.image,
      user.IP,
      user.bgColor,
    ]);
  });
});

app.get("/check-user", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  console.log("접속 IP:", ip);

  // IPv6 ::ffff:123.123.123.123 형태 처리
  const cleanedIP = ip.replace(/^::ffff:/, "");

  // Check IP against USERS table instead of allowedIPs array
  db.get(
    "SELECT id, name, image FROM USERS WHERE IP = ?",
    [cleanedIP],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ allowed: !!row, user: row });
    }
  );
});

app.get("/users", (req, res) => {
  db.all(
    "SELECT id, name, image, isOnline, bgColor FROM USERS",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.put("/user/:id/name", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.run("UPDATE USERS SET name = ? WHERE id = ?", [name, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true });
  });
});

app.put("/user/:id/bgColor", (req, res) => {
  const { id } = req.params;
  const { bgColor } = req.body;

  db.run(
    "UPDATE USERS SET bgColor = ? WHERE id = ?",
    [bgColor, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    }
  );
});

app.get("/messages", (req, res) => {
  db.all(
    `SELECT MESSAGES.id as messageId, MESSAGES.userId as userId, MESSAGES.message, strftime('%H:%M', datetime(MESSAGES.createdAt, '+9 hours')) as createdAt, USERS.name, USERS.image, USERS.bgColor
     FROM MESSAGES INNER JOIN USERS ON MESSAGES.userId = USERS.id 
     ORDER BY MESSAGES.createdAt ASC`,
    [],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.post("/message", (req, res) => {
  const { userId, message } = req.body;
  console.log("userId", userId);
  console.log("message", message);
  db.run(
    "INSERT INTO MESSAGES (userId, message) VALUES (?, ?)",
    [userId, message],
    function (err) {
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/message/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM MESSAGES WHERE id = ?", [id], function (err) {
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://192.168.0.126:${port}`);
});
