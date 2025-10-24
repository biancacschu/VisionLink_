import { db } from './db.js';
import bcrypt from 'bcryptjs';

const adminEmail = 'admin@visionlink.app';
const adminPass = 'VisionLink123!';

db.serialize(() => {
  // Create admin user if not exists
  db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync(adminPass, 10);
      db.run(`INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?,?,?,?,?)`,
        [adminEmail, hash, 'Vision', 'Admin', 'Admin']);
      console.log('Seeded admin user:', adminEmail, 'password:', adminPass);
    } else {
      console.log('Admin user already exists');
    }
  });

  // Seed one client, project, and some tasks (if none exist)
  db.get(`SELECT COUNT(*) as c FROM clients`, [], (e, r) => {
    if (r && r.c === 0) {
      db.run(`INSERT INTO clients (name, contact_email, phone, address, requirements, created_by) VALUES (?,?,?,?,?,?)`,
        ['Ground Floor Interiors', 'info@gfi.example', '000-000-0000', 'Ballito, KZN', 'High-level brief storage', 1]);
    }
  });

  db.get(`SELECT COUNT(*) as c FROM projects`, [], (e, r) => {
    if (r && r.c === 0) {
      db.run(`INSERT INTO projects (client_id, name, description, status, location, budget, start_date, end_date, created_by) 
              VALUES (?,?,?,?,?,?,?,?,?)`,
        [1, 'Penthouse Renovation', 'Luxury downtown penthouse', 'Active', 'Durban', 1250000, '2025-09-01', '2025-12-15', 1]);
    }
  });

  db.get(`SELECT COUNT(*) as c FROM tasks`, [], (e, r) => {
    if (r && r.c === 0) {
      db.run(`INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date) VALUES (?,?,?,?,?,?,?)`,
        [1, 'Finalize bathroom tile selection', 'Complete tile selection', 'todo', 'high', 'Emily Rodriguez', '2025-09-15']);
      db.run(`INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date) VALUES (?,?,?,?,?,?,?)`,
        [1, 'Custom furniture delivery', 'Coordinate delivery', 'pending', 'medium', 'James Wilson', '2025-09-20']);
      db.run(`INSERT INTO tasks (project_id, title, description, status, priority, assignee, due_date) VALUES (?,?,?,?,?,?,?)`,
        [1, 'Final walkthrough', 'Client walkthrough', 'not_started', 'low', 'Emily Rodriguez', '2025-09-28']);
    }
  });

  console.log('Seeded sample data (if empty).');
});
