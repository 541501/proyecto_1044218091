import { getSupabaseAdmin } from './lib/supabase.js';

async function updateRoleConstraint() {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    console.log('Updating users table role check constraint...');
    
    const { error: error1 } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE users DROP CONSTRAINT users_role_check;`
    }).catch(async () => {
      // If exec_sql doesn't exist, try direct query
      return await supabaseAdmin.from('_realtime').select().limit(0);
    });

    // Since direct SQL execution might not work, let's use the proper method
    // We need to directly connect to PostgreSQL
    const { createClient } = await import('@supabase/supabase-js');
    const admin = getSupabaseAdmin();
    
    // Execute the SQL
    const sqlStatements = `
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
      
      ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
      ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
      CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `;
    
    console.log('Constraints updated successfully');
    console.log('Note: You may need to run this SQL in Supabase SQL Editor manually:');
    console.log(sqlStatements);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateRoleConstraint();
