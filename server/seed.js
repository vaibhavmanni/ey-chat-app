// server/seed.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('./models');

async function seed() {
  try {
    // 1) Recreate all tables
    await db.sequelize.sync({ force: true });
    console.log('✅ Database synced (all tables dropped/recreated)');

    // 2) Create 5 demo users
    const demoUsers = [
      { username: 'johndoe',   firstName: 'John',  lastName: 'Doe',    email: 'john@example.com',  password: 'password1' },
      { username: 'janesmith', firstName: 'Jane',  lastName: 'Smith',  email: 'jane@example.com',  password: 'password2' },
      { username: 'alicewong', firstName: 'Alice', lastName: 'Wong',   email: 'alice@example.com', password: 'password3' },
      { username: 'bobbrown',  firstName: 'Bob',   lastName: 'Brown',  email: 'bob@example.com',   password: 'password4' },
      { username: 'carolmiller', firstName: 'Carol', lastName: 'Miller', email: 'carol@example.com', password: 'password5' },
    ];

    const users = [];
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      const user = await db.User.create({
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: hash,
      });
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // 3) Seed 100 messages for each pair of users
    let total = 0;
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const A = users[i];
        const B = users[j];
        for (let k = 0; k < 100; k++) {
          const sender   = (k % 2 === 0) ? A : B;
          const receiver = (k % 2 === 0) ? B : A;
          await db.Message.create({
            senderId:   sender.id,
            receiverId: receiver.id,
            content:    `Message #${k+1} from ${sender.firstName} to ${receiver.firstName}`,
          });
          total++;
        }
      }
    }
    console.log(`✅ Seeded ${total} messages (100 per pair)`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
