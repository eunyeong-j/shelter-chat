const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const dotenvFlow = require("dotenv-flow");
const cors = require("cors");
const WebSocket = require("ws");
const app = express();
const multer = require("multer");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const sessionMiddleware = session({
  secret: process.env.VITE_SESSION_SECRET || "your-secret-key-here",
  resave: false,
  saveUninitialized: true,
  store: new FileStore({
    path: "./sessions",
  }),
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  },
});

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
app.use(sessionMiddleware);

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
  db.run("DROP TABLE IF EXISTS ACCESS_REQUEST_USERS");
  db.run("DROP TABLE IF EXISTS USERS");
  db.run("DROP TABLE IF EXISTS MESSAGES");
  db.run("DROP TABLE IF EXISTS LOGS");
  db.run("DROP TABLE IF EXISTS MESSAGE_FILE");
  db.run("DROP TABLE IF EXISTS MESSAGE_REACTION");
  db.run("DROP TABLE IF EXISTS ROLES");
  db.run("DROP TABLE IF EXISTS USER_ROLES");

  db.run(
    "CREATE TABLE IF NOT EXISTS ACCESS_REQUEST_USERS (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, IP TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)"
  );
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
  db.run(
    `CREATE TABLE IF NOT EXISTS MESSAGE_REACTION (id INTEGER PRIMARY KEY AUTOINCREMENT, messageId INTEGER NOT NULL, userId INTEGER NOT NULL, type TEXT, FOREIGN KEY (messageId) REFERENCES MESSAGES(id), FOREIGN KEY (userId) REFERENCES USERS(id))`
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS ROLES (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS USER_ROLES (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, roleId INTEGER NOT NULL, FOREIGN KEY (userId) REFERENCES USERS(id), FOREIGN KEY (roleId) REFERENCES ROLES(id))"
  );

  db.run("INSERT INTO ROLES (name) VALUES ('ADMIN')");
  db.run("INSERT INTO ROLES (name) VALUES ('USER')");

  const DEFAULT_USERS = [
    {
      id: 1,
      name: "장은영",
      image: "/images/image-admin.png",
      IP: "192.168.0.23",
      bgColor: "#fff4ff",
      isAdmin: "Y",
    },
    {
      id: 2,
      name: "권혁태",
      image: "/images/image-1.png",
      IP: "192.168.0.83",
      bgColor: "#e6f4ff",
      isAdmin: "N",
    },
    {
      id: 3,
      name: "박민규",
      image: "/images/image-2.png",
      IP: "192.168.0.92",
      bgColor: "#e6edff",
      isAdmin: "N",
    },
    {
      id: 4,
      name: "박영웅",
      image: "/images/image-3.png",
      IP: "192.168.0.93",
      bgColor: "#ffede6",
      isAdmin: "N",
    },
    {
      id: 5,
      name: "김대섭",
      image: "/images/image-4.png",
      IP: "192.168.0.7",
      bgColor: "#e6ffff",
      isAdmin: "N",
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

  // 관리자 권한 부여
  db.run("INSERT INTO USER_ROLES (userId, roleId) VALUES (1, 1)");

  // 유저 권한 부여
  db.run("INSERT INTO USER_ROLES (userId, roleId) VALUES (2, 2)");
  db.run("INSERT INTO USER_ROLES (userId, roleId) VALUES (3, 2)");
  db.run("INSERT INTO USER_ROLES (userId, roleId) VALUES (4, 2)");
  db.run(`INSERT INTO USER_ROLES (userId, roleId) VALUES (5, 2)`);
});
*/

// 서버 재실행 시 삭제된 메세지만 완전 삭제
db.serialize(() => {
  db.run(
    `DELETE FROM MESSAGE_FILE WHERE messageId IS NULL OR messageId IN (SELECT id FROM MESSAGES WHERE deletedAt IS NOT NULL)`
  );
  db.run(`DELETE FROM MESSAGES WHERE deletedAt IS NOT NULL`);
});

app.get("/check-user", (req, res) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  console.log("접속 IP:", ip);

  // IPv6 ::ffff:123.123.123.123 형태 처리
  const cleanedIP = ip.replace(/^::ffff:/, "");

  // Check IP against USERS table instead of allowedIPs array
  db.get(
    `SELECT u.id, 
        u.name, 
        u.image, 
        (SELECT CASE WHEN EXISTS (SELECT 1 FROM USER_ROLES ur WHERE ur.userId = u.id AND ur.roleId = 1) THEN 'Y' ELSE 'N' END) as isAdmin
      FROM USERS u 
      WHERE u.IP = ?`,
    [cleanedIP],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        req.session.userId = row.id;
        req.session.save();

        res.json({ allowed: !!row, user: row });
      } else {
        // Check if user has pending access request
        db.get(
          "SELECT id, name, createdAt FROM ACCESS_REQUEST_USERS WHERE IP = ?",
          [cleanedIP],
          (err, accessRequest) => {
            if (err) {
              return res.status(400).json({ error: "접근 권한이 없습니다." });
            }
            if (!accessRequest) {
              return res.status(200).json({ allowed: false, user: null });
            }

            req.session.userId = accessRequest.id;
            req.session.save();

            res.json({
              allowed: false,
              accessRequest: accessRequest || null,
              user: accessRequest,
            });
          }
        );
      }
    }
  );
});

app.get("/access-requests", (req, res) => {
  db.all(
    "SELECT id, name, createdAt FROM ACCESS_REQUEST_USERS",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/access-request", (req, res) => {
  const { name } = req.body;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const cleanedIP = ip.replace(/^::ffff:/, "");

  db.get(
    "SELECT id FROM ACCESS_REQUEST_USERS WHERE IP = ?",
    [cleanedIP],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) {
        return res
          .status(400)
          .json({ error: "이미 접근 요청이 완료되었습니다." });
      }

      db.run("INSERT INTO ACCESS_REQUEST_USERS (name, IP) VALUES (?, ?)", [
        name,
        cleanedIP,
      ]);

      broadcast({ type: "ACCESS_REQUEST_UPDATE" });
      res.json({ success: true });
    }
  );
});

app.put("/access-request/:id", (req, res) => {
  const { id } = req.params;

  // Get the IP from the access request
  db.get(
    "SELECT IP, name FROM ACCESS_REQUEST_USERS WHERE id = ?",
    [id],
    (err, row) => {
      if (err) return console.error(err);

      // Add the user to USERS table
      db.run(
        "INSERT INTO USERS (name, IP, image, bgColor) VALUES (?, ?, ?, ?)",
        [row.name, row.IP, "/images/image-default.png", "#e6f4ff"],
        function (err) {
          if (err) console.error("Failed to create user:", err);
          broadcast({ type: "USER_UPDATE" });
        }
      );

      // Delete the access request
      db.run("DELETE FROM ACCESS_REQUEST_USERS WHERE id = ?", [id]);
    }
  );

  broadcast({ type: "ACCESS_REQUEST_UPDATE" });
  res.json({ success: true });
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

app.put("/user/name", (req, res) => {
  const { oldName, newName } = req.body;
  const userId = req.session.userId;

  db.run(
    "UPDATE USERS SET name = ? WHERE id = ?",
    [newName, userId],
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
        [userId, "NAME_CHANGE", detailLog],
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

app.put("/user/image", (req, res) => {
  const { image } = req.body;
  const userId = req.session.userId;

  db.run(
    "UPDATE USERS SET image = ? WHERE id = ?",
    [image, userId],
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

app.put("/user/bgColor", (req, res) => {
  const { bgColor } = req.body;
  const userId = req.session.userId;

  db.run(
    "UPDATE USERS SET bgColor = ? WHERE id = ?",
    [bgColor, userId],
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
    `SELECT messages.type,
            messages.messageId,
            messages.isMine,
            messages.message,
            messages.imageFile,
            messages.createdAt,
            messages.name,
            messages.image,
            messages.bgColor,
            messages.deletedAt,
            messages.reactions,
      CASE
        WHEN (messages.type = 'MSG'
              AND messages.userId IS NOT NULL
              AND messages.deletedAt IS NULL
              AND messages.userId = LAG(messages.userId) OVER (ORDER BY messages.createdAt)
        )
        THEN 'Y'
        ELSE 'N'
      END AS isContinue
      FROM (
            SELECT "DATE" as type,
                    NULL as messageId,
                    "N" as isMine,
                    strftime('%Y년 %m월 %d일', datetime(createdAt, '+9 hours')) as message,
                    NULL as imageFile,
                    NULL as name,
                    NULL as image,
                    NULL as bgColor,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(createdAt, '+9 hours')) as createdAt,
                    NULL as deletedAt,
                    NULL as reactions,
                    MESSAGES.userId as userId
              FROM MESSAGES
              GROUP BY strftime('%Y년 %m월 %d일', datetime(createdAt, '+9 hours'))
              UNION ALL
              SELECT "MSG" as type,
                    MESSAGES.id as messageId, 
                    CASE WHEN MESSAGES.userId = ? THEN "Y" ELSE "N" END as isMine,
                    MESSAGES.message, 
                    MESSAGE_FILE.image as imageFile,
                    USERS.name, 
                    USERS.image, 
                    USERS.bgColor,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(MESSAGES.createdAt, '+9 hours')) as createdAt, 
                    MESSAGES.deletedAt,
                    (
                      SELECT GROUP_CONCAT(type || ':' || cnt || ':' || CASE WHEN userId = ? THEN 'isMine' ELSE 'isNotMine' END, ',')
                      FROM (
                        SELECT type, COUNT(*) as cnt, userId
                        FROM MESSAGE_REACTION
                        WHERE messageId = MESSAGES.id
                        GROUP BY type
                      )
                    ) as reactions,
                    MESSAGES.userId
              FROM MESSAGES 
              LEFT JOIN MESSAGE_FILE ON MESSAGES.id = MESSAGE_FILE.messageId
              INNER JOIN USERS ON MESSAGES.userId = USERS.id
              UNION ALL
              SELECT "LOG" as type,
                    NULL as messageId,
                    CASE WHEN LOGS.userId = ? THEN "Y" ELSE "N" END as isMine,
                    LOGS.details as message,
                    NULL as imageFile,
                    NULL as name,
                    NULL as image,
                    NULL as bgColor,
                    strftime('%Y-%m-%d %H:%M:%S', datetime(LOGS.createdAt, '+9 hours')) as createdAt,
                    NULL as deletedAt,
                    NULL as reactions,
                    NULL as userId
              FROM LOGS
          ) as messages
      ORDER BY createdAt ASC`,
    [req.session.userId, req.session.userId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.post("/message", upload.single("file"), (req, res) => {
  const { body, file } = req;
  const message = body.message;
  const userId = req.session.userId;

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

app.delete("/message/:messageId", (req, res) => {
  const { messageId } = req.params;
  db.run(
    "UPDATE MESSAGES SET deletedAt = CURRENT_TIMESTAMP, message = '' WHERE id = ?",
    [messageId],
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

app.post("/message/:messageId/reaction", (req, res) => {
  const { messageId } = req.params;
  const { type } = req.body;
  const userId = req.session.userId;

  // Check if reaction already exists
  db.get(
    "SELECT id FROM MESSAGE_REACTION WHERE messageId = ? AND userId = ? AND type = ?",
    [messageId, userId, type],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        // If reaction exists, delete it
        db.run(
          "DELETE FROM MESSAGE_REACTION WHERE messageId = ? AND userId = ? AND type = ?",
          [messageId, userId, type],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            broadcast({ type: "MESSAGE_UPDATE" });
            return res.json({ success: true });
          }
        );
      } else {
        // If reaction does not exist, create it
        db.run(
          "INSERT INTO MESSAGE_REACTION (messageId, userId, type) VALUES (?, ?, ?)",
          [messageId, userId, type],
          function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            // Broadcast message update
            broadcast({ type: "MESSAGE_UPDATE" });
            res.json({ success: true });
          }
        );
      }
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
