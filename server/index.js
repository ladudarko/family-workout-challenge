const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./workout.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Activities table
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    duration INTEGER,
    notes TEXT,
    date DATE NOT NULL,
    points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Daily checklist table
  db.run(`CREATE TABLE IF NOT EXISTS daily_checklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    workout_30min BOOLEAN DEFAULT 0,
    workout_extra_15min BOOLEAN DEFAULT 0,
    family_group_workout BOOLEAN DEFAULT 0,
    water_82oz BOOLEAN DEFAULT 0,
    sleep_6hours BOOLEAN DEFAULT 0,
    personal_goal_hit BOOLEAN DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, date)
  )`);

  // Add points column to existing activities table if it doesn't exist
  db.run(`ALTER TABLE activities ADD COLUMN points INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding points column:', err);
    }
  });

  // Add is_completed column to existing daily_checklist table if it doesn't exist
  db.run(`ALTER TABLE daily_checklist ADD COLUMN is_completed BOOLEAN DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding is_completed column:', err);
    }
  });

  // Weight tracking table
  db.run(`CREATE TABLE IF NOT EXISTS weight_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    weight_lbs REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, date)
  )`);

  // Add is_admin column to users table if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding is_admin column:', err);
    }
  });

  // Create admin user if it doesn't exist
  db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, user) => {
    if (err) {
      console.error('Error checking admin user:', err);
      return;
    }
    
    if (!user) {
      const hashedPassword = await bcrypt.hash('Summer12!', 10);
      db.run(
        'INSERT INTO users (username, password, name, is_admin) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Admin', 1],
        function(err) {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created successfully');
          }
        }
      );
    } else {
      // Update existing admin user to ensure they have admin privileges
      db.run(
        'UPDATE users SET is_admin = 1 WHERE username = ?',
        ['admin'],
        function(err) {
          if (err) {
            console.error('Error updating admin user:', err);
          } else {
            console.log('Admin user privileges confirmed');
          }
        }
      );
    }
  });
});

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Points calculation function - All activities now give 10 points
const calculateActivityPoints = (activityType, duration) => {
  // All logged activities give 10 points regardless of duration
  return 10;
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register new user
app.post('/api/register', async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, password, name) VALUES (?, ?, ?)',
      [username, hashedPassword, name],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'User created successfully',
          token,
          user: { 
            id: this.lastID, 
            username, 
            name,
            is_admin: false
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: { 
            id: user.id, 
            username: user.username, 
            name: user.name,
            is_admin: user.is_admin || false
          }
        });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
});

// Add activity
app.post('/api/activities', authenticateToken, (req, res) => {
  const { activity_type, duration, notes, date } = req.body;
  const userId = req.user.id;

  if (!activity_type || !date) {
    return res.status(400).json({ error: 'Activity type and date are required' });
  }

  const points = calculateActivityPoints(activity_type, duration || 0);

  db.run(
    'INSERT INTO activities (user_id, activity_type, duration, notes, date, points) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, activity_type, duration || 0, notes || '', date, points],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Activity added successfully',
        activity: {
          id: this.lastID,
          user_id: userId,
          activity_type,
          duration: duration || 0,
          notes: notes || '',
          date,
          points
        }
      });
    }
  );
});

// Get user's activities
app.get('/api/activities', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  let query = 'SELECT * FROM activities WHERE user_id = ?';
  let params = [userId];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  db.all(query, params, (err, activities) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(activities);
  });
});

// Get daily checklist
app.get('/api/daily-checklist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  db.get(
    'SELECT * FROM daily_checklist WHERE user_id = ? AND date = ?',
    [userId, date],
    (err, checklist) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Return empty checklist if none exists
      if (!checklist) {
        res.json({
          user_id: userId,
          date,
          workout_30min: false,
          workout_extra_15min: false,
          family_group_workout: false,
          water_82oz: false,
          sleep_6hours: false,
          personal_goal_hit: false,
          total_points: 0
        });
      } else {
        res.json(checklist);
      }
    }
  );
});

// Update daily checklist
app.post('/api/daily-checklist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { 
    date, 
    workout_30min, 
    workout_extra_15min, 
    family_group_workout, 
    water_82oz, 
    sleep_6hours, 
    personal_goal_hit 
  } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  // Use INSERT OR REPLACE to handle both new and existing records
  // Don't calculate points here - only store the checkbox states
  db.run(
    `INSERT OR REPLACE INTO daily_checklist 
     (user_id, date, workout_30min, workout_extra_15min, family_group_workout, 
      water_82oz, sleep_6hours, personal_goal_hit, total_points, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [userId, date, workout_30min || false, workout_extra_15min || false, 
     family_group_workout || false, water_82oz || false, sleep_6hours || false, 
     personal_goal_hit || false],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Daily checklist updated successfully',
        checklist: {
          user_id: userId,
          date,
          workout_30min: workout_30min || false,
          workout_extra_15min: workout_extra_15min || false,
          family_group_workout: family_group_workout || false,
          water_82oz: water_82oz || false,
          sleep_6hours: sleep_6hours || false,
          personal_goal_hit: personal_goal_hit || false,
          total_points: 0  // Points only calculated when completing
        }
      });
    }
  );
});

// Complete daily checklist
app.post('/api/daily-checklist/complete', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { 
    date, 
    workout_30min, 
    workout_extra_15min, 
    family_group_workout, 
    water_82oz, 
    sleep_6hours, 
    personal_goal_hit 
  } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  // Calculate total points
  const totalPoints = 
    (workout_30min ? 10 : 0) +
    (workout_extra_15min ? 5 : 0) +
    (family_group_workout ? 10 : 0) +
    (water_82oz ? 5 : 0) +
    (sleep_6hours ? 5 : 0) +
    (personal_goal_hit ? 10 : 0);

  // Use INSERT OR REPLACE to handle both new and existing records
  db.run(
    `INSERT OR REPLACE INTO daily_checklist 
     (user_id, date, workout_30min, workout_extra_15min, family_group_workout, 
      water_82oz, sleep_6hours, personal_goal_hit, total_points, is_completed, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
    [userId, date, workout_30min || false, workout_extra_15min || false, 
     family_group_workout || false, water_82oz || false, sleep_6hours || false, 
     personal_goal_hit || false, totalPoints],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Daily checklist completed successfully',
        checklist: {
          user_id: userId,
          date,
          workout_30min: workout_30min || false,
          workout_extra_15min: workout_extra_15min || false,
          family_group_workout: family_group_workout || false,
          water_82oz: water_82oz || false,
          sleep_6hours: sleep_6hours || false,
          personal_goal_hit: personal_goal_hit || false,
          total_points: totalPoints,
          is_completed: true
        },
        total_points: totalPoints
      });
    }
  );
});

// Get family leaderboard (updated with points)
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      u.name,
      u.username,
      COUNT(a.id) as total_activities,
      SUM(a.duration) as total_duration,
      COUNT(DISTINCT a.date) as active_days,
      SUM(a.points) as activity_points,
      COALESCE(SUM(dc.total_points), 0) as checklist_points,
      (SUM(a.points) + COALESCE(SUM(dc.total_points), 0)) as total_points
    FROM users u
    LEFT JOIN activities a ON u.id = a.user_id
    LEFT JOIN daily_checklist dc ON u.id = dc.user_id AND dc.is_completed = 1
    GROUP BY u.id, u.name, u.username
    ORDER BY total_points DESC, total_activities DESC
  `;

  db.all(query, [], (err, leaderboard) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(leaderboard);
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT id, username, name, is_admin, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    }
  );
});

// Add weight entry
app.post('/api/weight', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { date, weight_lbs } = req.body;

  if (!date || !weight_lbs) {
    return res.status(400).json({ error: 'Date and weight are required' });
  }

  if (weight_lbs <= 0) {
    return res.status(400).json({ error: 'Weight must be greater than 0' });
  }

  db.run(
    'INSERT OR REPLACE INTO weight_tracking (user_id, date, weight_lbs) VALUES (?, ?, ?)',
    [userId, date, weight_lbs],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Weight logged successfully',
        weight: {
          id: this.lastID,
          user_id: userId,
          date,
          weight_lbs
        }
      });
    }
  );
});

// Get user's weight entries (private)
app.get('/api/weight', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM weight_tracking WHERE user_id = ? ORDER BY date DESC',
    [userId],
    (err, weights) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(weights);
    }
  );
});

// Get weight for a specific date
app.get('/api/weight/:date', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;

  db.get(
    'SELECT * FROM weight_tracking WHERE user_id = ? AND date = ?',
    [userId, date],
    (err, weight) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(weight || {});
    }
  );
});

// Admin endpoint: Get all users' weight data
app.get('/api/admin/weights', authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Check if user is admin
  db.get(
    'SELECT is_admin FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user || !user.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Get all weight data with user info
      db.all(
        `SELECT wt.*, u.name, u.username 
         FROM weight_tracking wt
         JOIN users u ON wt.user_id = u.id
         ORDER BY wt.date DESC, u.name`,
        [],
        (err, weights) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json(weights);
        }
      );
    }
  );
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, 'client/dist');
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});

