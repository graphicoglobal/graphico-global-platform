import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "graphico-global-secret-key-123";

const calculateRank = (credits: number) => {
  if (credits >= 5000) return "Platinum";
  if (credits >= 2000) return "Gold";
  if (credits >= 500) return "Silver";
  return "Bronze";
};

// In-memory "database" for demo/prototype
const users: any[] = [
  {
    id: "admin",
    email: "admin@graphico.global",
    password: bcrypt.hashSync("admin123", 10),
    name: "Admin User",
    role: "admin",
    credits: 10000,
    rank: "Platinum",
  }
];

const orders: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // API Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password: bcrypt.hashSync(password, 10),
      name,
      role: "user",
      credits: 100, // Starting credits
      rank: "Bronze",
    };
    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, credits: newUser.credits, rank: newUser.rank } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits, rank: user.rank } });
  });

  app.get("/api/user/me", authenticate, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, credits: user.credits, rank: user.rank });
  });

  app.post("/api/orders", authenticate, (req: any, res) => {
    const { serviceType, description, cost } = req.body;
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.credits < cost) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    user.credits -= cost;
    user.rank = calculateRank(user.credits);

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      serviceType,
      description,
      cost,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    res.json({ order: newOrder, user: { credits: user.credits, rank: user.rank } });
  });

  app.get("/api/orders", authenticate, (req: any, res) => {
    const userOrders = req.user.role === "admin" ? orders : orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
  });

  // Admin Routes
  app.get("/api/admin/users", authenticate, (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, credits: u.credits, rank: u.rank })));
  });

  app.patch("/api/admin/users/:id", authenticate, (req: any, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    const { credits, rank } = req.body;
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (credits !== undefined) {
      user.credits = credits;
      user.rank = calculateRank(user.credits);
    }
    if (rank !== undefined) user.rank = rank;
    res.json(user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
