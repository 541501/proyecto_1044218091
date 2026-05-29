import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Create admin client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json({
        success: false,
        error: 'Missing Supabase credentials'
      }, { status: 500 });
    }

    // Note: Supabase-js doesn't support direct SQL execution
    // We need to tell the user to do it manually
    const sql = `
-- Fix role constraints to include new escuela roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_user_role_check;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_user_role_check
CHECK (user_role IN ('profesor', 'coordinador', 'esc_psicologia', 'esc_derecho', 'esc_ciencias', 'admin'));
    `;

    return Response.json({
      success: true,
      message: 'To fix the role constraints, execute this SQL in Supabase:',
      sql: sql.trim(),
      supabaseLink: 'https://supabase.com/dashboard/project/wtxdzsfgiudecqudjcox/sql/new',
      instructions: [
        '1. Go to Supabase SQL Editor (link above)',
        '2. Create a new query',
        '3. Paste the SQL above',
        '4. Click "Run"',
        '5. Refresh the app'
      ]
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
