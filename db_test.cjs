const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:123@localhost:5432/postgres'
});
async function test() {
  await client.connect();
  const res = await client.query("SELECT * FROM contracts;");
  console.log("Contracts:", res.rows);
  const students = await client.query("SELECT * FROM users;");
  console.log("Users:", students.rows.map(u => u.email));
  await client.end();
}
test().catch(console.error);
