const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const dotenvFlow = require("dotenv-flow");
const cors = require("cors");
const WebSocket = require("ws");
const app = express();
const multer = require("multer");

const upload = multer();

dotenvFlow.config({
  path: require("path").resolve(__dirname, ".."), // 루트 디렉토리로 경로 지정
});

// CORS configuration
const corsOptions = {
  origin: [
    `http://localhost:${process.env.VITE_HOST_CLIENT_PORT}`,
    `http://${process.env.VITE_HOST_IP}:${process.env.VITE_HOST_CLIENT_PORT}`,
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const db = new sqlite3.Database("./mydb.sqlite");

// Create WebSocket server
const wss = new WebSocket.Server({
  port: process.env.VITE_HOST_WEBSOCKET_PORT,
});

// Store all connected clients
const clients = new Set();

// WebSocket connection handler
wss.on("connection", (ws) => {
  // Add new client to the set
  clients.add(ws);

  // Handle client disconnection
  ws.on("close", () => {
    clients.delete(ws);
  });
});

// Function to broadcast messages to all connected clients
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Execute only once when the server start
/*
db.serialize(() => {
  // DELETE ALL DATA
  db.run("DROP TABLE IF EXISTS USERS");
  db.run("DROP TABLE IF EXISTS MESSAGES");
  db.run("DROP TABLE IF EXISTS LOGS");
  db.run("DROP TABLE IF EXISTS MESSAGE_FILE");

  db.run(
    "CREATE TABLE IF NOT EXISTS USERS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, image TEXT, IP TEXT, bgColor TEXT, isOnline BOOLEAN DEFAULT FALSE, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS MESSAGES (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, message TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, deletedAt DATETIME DEFAULT NULL, FOREIGN KEY (userId) REFERENCES USERS(id))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS LOGS (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, action TEXT, details TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES USERS(id))"
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS MESSAGE_FILE (id INTEGER PRIMARY KEY AUTOINCREMENT, messageId INTEGER NOT NULL, image BLOB, FOREIGN KEY (messageId) REFERENCES MESSAGES(id))`
  );

  // Delete all data
  // db.run("DELETE FROM USERS");
  // db.run("DELETE FROM MESSAGES");
  // db.run("DELETE FROM LOGS");

  // Delete messages where deletedAt is not null
  db.run(`DELETE FROM MESSAGES WHERE deletedAt IS NOT NULL`);

  const DEFAULT_USERS = [
    {
      name: "Admin",
      image: "/images/image-admin.png",
      IP: "192.168.0.126",
      bgColor: "#fff4ff",
    },
    {
      name: "HT",
      image: "/images/image-4.png",
      IP: "192.168.0.35",
      bgColor: "#e6f4ff",
    },
    {
      name: "MK",
      image: "/images/image-1.png",
      IP: "192.168.0.73",
      bgColor: "#e6edff",
    },
    {
      name: "DS",
      image: "/images/image-2.png",
      IP: "192.168.0.34",
      bgColor: "#ffe6e6",
    },
    {
      name: "JH",
      image: "/images/image-3.png",
      IP: "192.168.0.48",
      bgColor: "#ffede6",
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
*/

db.serialize(() => {
  // 서버 재실행 시 삭제된 메세지만 완전 삭제
  db.run(
    `DELETE FROM MESSAGE_FILE WHERE messageId IS NULL OR messageId IN (SELECT id FROM MESSAGES WHERE deletedAt IS NOT NULL)`
  );
  db.run(`DELETE FROM MESSAGES WHERE deletedAt IS NOT NULL`);
  // db.run("DROP TABLE IF EXISTS MESSAGE_FILE");
  // db.run(
  //   `CREATE TABLE IF NOT EXISTS MESSAGE_FILE (id INTEGER PRIMARY KEY AUTOINCREMENT, messageId INTEGER NOT NULL, image BLOB, FOREIGN KEY (messageId) REFERENCES MESSAGES(id))`
  // );
  // Update user image paths to prepend "/image"
  // db.run(`UPDATE USERS SET image = REPLACE(image, '/images-', '/image-')`);
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
  const { oldName, newName } = req.body;

  db.run(
    "UPDATE USERS SET name = ? WHERE id = ?",
    [newName, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const detailLog = `'${oldName}'님이 이름을 '${newName}'으로 변경했습니다.`;

      // Log the name change
      db.run(
        "INSERT INTO LOGS (userId, action, details) VALUES (?, ?, ?)",
        [id, "NAME_CHANGE", detailLog],
        (logErr) => {
          if (logErr) {
            console.error("Failed to create log:", logErr);
          }
          // Broadcast user update
          broadcast({ type: "USER_UPDATE" });
          // Broadcast log update
          broadcast({ type: "LOG_UPDATE" });
        }
      );

      res.json({ success: true });
    }
  );
});

app.put("/user/:id/image", (req, res) => {
  const { id } = req.params;
  const { image } = req.body;

  db.run(
    "UPDATE USERS SET image = ? WHERE id = ?",
    [image, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // Broadcast user update
      broadcast({ type: "USER_UPDATE" });
      broadcast({ type: "MESSAGE_UPDATE" });
      res.json({ success: true });
    }
  );
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
      // Broadcast user update
      broadcast({ type: "USER_UPDATE" });
      res.json({ success: true });
    }
  );
});

app.get("/messages", (req, res) => {
  db.all(
    `SELECT * 
       FROM (
            SELECT "DATE" as type,
                    NULL as messageId,
                    NULL as userId,
                    strftime('%Y년 %m월 %d일', datetime(createdAt, '+9 hours')) as message,
                    NULL as imageFile,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(createdAt, '+9 hours')) as createdAt,
                    NULL as name,
                    NULL as image,
                    NULL as bgColor,
                    NULL as deletedAt
               FROM MESSAGES
               GROUP BY strftime('%Y년 %m월 %d일', datetime(createdAt, '+9 hours'))
               UNION ALL
               SELECT "MSG" as type,
                    MESSAGES.id as messageId, 
                    MESSAGES.userId as userId, 
                    MESSAGES.message, 
                    MESSAGE_FILE.image as imageFile,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(MESSAGES.createdAt, '+9 hours')) as createdAt, 
                    USERS.name, 
                    USERS.image, 
                    USERS.bgColor,
                    MESSAGES.deletedAt
              FROM MESSAGES 
              LEFT JOIN MESSAGE_FILE ON MESSAGES.id = MESSAGE_FILE.messageId
              INNER JOIN USERS ON MESSAGES.userId = USERS.id 
              UNION ALL
              SELECT "LOG" as type,
                    NULL as messageId,
                    LOGS.userId,
                    LOGS.details as message,
                    NULL as imageFile,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(LOGS.createdAt, '+9 hours')) as createdAt,
                    NULL as name,
                    NULL as image,
                    NULL as bgColor,
                    NULL as deletedAt
               FROM LOGS)
      ORDER BY createdAt ASC
     `,
    [],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.post("/message", upload.single("file"), (req, res) => {
  const { body, file } = req;
  const userId = body.userId;
  const message = body.message;

  const blob = file ? Buffer.from(file.buffer).toString("base64") : null;

  db.run(
    "INSERT INTO MESSAGES (userId, message) VALUES (?, ?)",
    [userId, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (blob) {
        db.run(
          "INSERT INTO MESSAGE_FILE (messageId, image) VALUES (?, ?)",
          [this.lastID, blob],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            // Broadcast message update
            broadcast({ type: "MESSAGE_UPDATE" });
            res.json({ id: this.lastID });
          }
        );
      } else {
        // Broadcast message update
        broadcast({ type: "MESSAGE_UPDATE" });
        res.json({ id: this.lastID });
      }
    }
  );
});

app.delete("/message/:id", (req, res) => {
  const { id } = req.params;
  db.run(
    "UPDATE MESSAGES SET deletedAt = CURRENT_TIMESTAMP, message = '' WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Broadcast message update
      broadcast({ type: "MESSAGE_UPDATE" });
      res.json({ success: true });
    }
  );
});

// Start HTTP server
app.listen(process.env.VITE_HOST_SERVER_PORT, () => {
  console.log(
    `HTTP Server running on http://${process.env.VITE_HOST_IP}:${process.env.VITE_HOST_SERVER_PORT}`
  );
  console.log(
    `WebSocket Server running on ws://${process.env.VITE_HOST_IP}:${process.env.VITE_HOST_WEBSOCKET_PORT}`
  );
});
