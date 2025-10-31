import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

const result = await db.execute(sql`
  SELECT id, title, verification_pin, created_at 
  FROM deals 
  ORDER BY created_at DESC 
  LIMIT 10
`);

console.log('\n📌 Recent Deal Verification PINs:\n');
result.rows.forEach(r => {
  const isHashed = r.verification_pin.startsWith('$2b$');
  const status = isHashed ? '❌ HASHED' : '✅ PLAIN';
  console.log(`${status} - "${r.title}"`);
  console.log(`   PIN: ${r.verification_pin}\n`);
});

process.exit(0);
