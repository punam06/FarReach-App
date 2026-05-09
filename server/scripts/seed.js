require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const RESERVED_ADMINS = (process.env.RESERVED_ADMIN_EMAILS || 'punam.papri@gmail.com,rebekasultanaorce455@gmail.com')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farreach_app',
    multipleStatements: true
  });

  try {
    const seedersDir = path.join(__dirname, '..', 'db', 'seeders');
    const files = fs.readdirSync(seedersDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(seedersDir, file), 'utf8');
      await conn.query(sql);
      console.log(`Applied seed: ${file}`);
    }

    const [roles] = await conn.query('SELECT id, name FROM roles');
    const adminRole = roles.find((r) => r.name === 'admin');
    if (!adminRole) throw new Error('Admin role missing. Run migration and seed again.');

    const defaultPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const passwordHash = await bcrypt.hash(defaultPass, 10);

    for (const email of RESERVED_ADMINS) {
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length) {
        await conn.query('UPDATE users SET role_id = ?, is_verified = 1, is_active = 1 WHERE id = ?', [adminRole.id, existing[0].id]);
        continue;
      }

      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
      await conn.query(
        `INSERT INTO users (name, email, password_hash, is_verified, is_active, role_id)
         VALUES (?, ?, ?, 1, 1, ?)`,
        [name, email, passwordHash, adminRole.id]
      );
    }

    console.log('Seed completed. Reserved admins ensured.');
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
