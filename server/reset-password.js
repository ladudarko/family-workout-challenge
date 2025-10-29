const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Get arguments: username and new password
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node reset-password.js <username> <new-password>');
  process.exit(1);
}

const username = args[0];
const newPassword = args[1];

const dbPath = path.join(__dirname, 'workout.db');
const db = new sqlite3.Database(dbPath);

// Check if user exists
db.get('SELECT id, username, name FROM users WHERE username = ?', [username], async (err, user) => {
  if (err) {
    console.error('Database error:', err);
    db.close();
    process.exit(1);
  }

  if (!user) {
    console.error(`User "${username}" not found in database.`);
    console.log('\nAvailable users:');
    db.all('SELECT username, name FROM users ORDER BY name', [], (err, users) => {
      if (!err) {
        users.forEach(u => console.log(`  - ${u.username} (${u.name})`));
      }
      db.close();
      process.exit(1);
    });
    return;
  }

  console.log(`Found user: ${user.username} (${user.name})`);
  console.log('Resetting password...');

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in database
  db.run(
    'UPDATE users SET password = ? WHERE username = ?',
    [hashedPassword, username],
    function(err) {
      if (err) {
        console.error('Error updating password:', err);
        db.close();
        process.exit(1);
      }

      console.log(`✅ Password reset successfully for user "${username}"!`);
      console.log(`   New password: ${newPassword}`);
      db.close();
    }
  );
});

