import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerRoutes } from './auth.js';
import { projectsRoutes } from './routes.projects.js';
import { tasksRoutes } from './routes.tasks.js';
import { filesRoutes } from './routes.files.js';
import { eventsRoutes } from './routes.events.js';
import { updatesRoutes } from './routes.updates.js';
import { notificationsRoutes } from './routes.notifications.js';
import { clientsRoutes } from './routes.clients.js';
import './db.js'; // init

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

registerRoutes(app);
projectsRoutes(app);
tasksRoutes(app);
filesRoutes(app);
eventsRoutes(app);
updatesRoutes(app);
notificationsRoutes(app);
clientsRoutes(app);

// Serve frontend build if exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`VisionLink API listening on ${PORT}`));
