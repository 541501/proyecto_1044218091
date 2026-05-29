#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://wtxdzsfgiudecqudjcox.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0eGR6c2ZnaXVkZWNxdWRqY294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg3MDAwMCwiZXhwIjoyMDkzNDQ2MDAwfQ.wfqQWUqGexSBdr6T55wPymHYoNBb-nSUqzvtu-GweL8';

const sql = `
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
`;

async function executeSQL() {
  try {
    // Try to use RPC or direct SQL execution via Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql_string: sql })
    });

    if (response.ok) {
      console.log('✅ SQL executed successfully!');
    } else {
      const error = await response.text();
      console.error(`Error (${response.status}):`, error);
      console.log('\nTo execute manually, go to:');
      console.log('https://supabase.com/dashboard/project/wtxdzsfgiudecqudjcox/sql');
      console.log('\nAnd paste this SQL:');
      console.log(sql);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTo execute manually, go to:');
    console.log('https://supabase.com/dashboard/project/wtxdzsfgiudecqudjcox/sql');
    console.log('\nAnd paste this SQL:');
    console.log(sql);
  }
}

executeSQL();
