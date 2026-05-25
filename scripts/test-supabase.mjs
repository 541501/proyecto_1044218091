// Verifica conectividad a Supabase usando las credenciales de .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

async function testRest() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('— Supabase REST —');
  console.log('  URL:', url);
  console.log('  ANON key present:', !!anonKey);
  console.log('  SERVICE ROLE key present:', !!serviceKey);

  const supabase = createClient(url, serviceKey);
  // Intentar consultar la tabla _migrations (puede no existir aún)
  const { data, error, status } = await supabase
    .from('_migrations')
    .select('filename')
    .limit(5);

  if (error) {
    console.log(`  Query _migrations → status=${status}, error=${error.message}`);
    if (error.message.includes('does not exist') || status === 404) {
      console.log('  ↳ La tabla aún no existe (esperado antes del bootstrap). Conexión OK.');
    } else {
      console.log('  ↳ Problema de conexión/credenciales.');
      process.exitCode = 1;
    }
  } else {
    console.log('  Query _migrations OK:', data);
  }
}

async function testPg() {
  console.log('\n— Postgres directo (DATABASE_URL) —');
  const cs = process.env.DATABASE_URL;
  console.log('  Connection string set:', !!cs);
  // Strip sslmode from connection string so pg respects our explicit ssl option
  const cleanedCs = cs.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?&/, '?').replace(/[?&]$/, '');
  const client = new pg.Client({
    connectionString: cleanedCs,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const { rows } = await client.query('SELECT NOW() as now, current_database() as db, version() as v');
    console.log('  Connected:', rows[0].db, '|', rows[0].now.toISOString());
    console.log('  Server:', rows[0].v.split(' ').slice(0, 2).join(' '));
  } catch (err) {
    console.log('  ✗ Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

await testRest();
await testPg();
