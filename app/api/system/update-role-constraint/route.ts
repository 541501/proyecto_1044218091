import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const admin = getSupabaseAdmin();

    // Execute ALTER TABLE statements via RPC if available, or raw query
    const statements = [
      `ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_role_check`,
      `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'))`,
      `ALTER TABLE IF EXISTS audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check`,
      `ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'))`,
    ];

    // Try to execute via Supabase
    let result = null;
    try {
      // This will execute via the service role key which has admin privileges
      const { data, error } = await admin
        .from('users')
        .select('id')
        .limit(0); // Just to test connection

      if (error) throw error;

      // If basic query works, try to update constraints
      // Note: Direct SQL execution through Supabase client is limited
      // The constraint update needs to happen through database admin tools
      console.log('Supabase connection successful');
      
      return Response.json({
        success: false,
        message: 'To update the role constraints, please execute this SQL in Supabase SQL Editor:\n\n' + statements.join(';\n') + ';',
        instructions: 'Go to Supabase Dashboard > SQL Editor > run the SQL above'
      });
    } catch (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('Error:', error);
    return Response.json({
      success: false,
      error: error.message,
      instructions: 'Please execute the SQL migration manually in Supabase SQL Editor'
    }, { status: 500 });
  }
}
