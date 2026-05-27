import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_ClassSport_SUPABASE_URL || 'https://wtxdzsfgiudecqudjcox.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ClassSport_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function createUser(email, name, password, role = 'profesor') {
  try {
    console.log(`\n📝 Creando usuario: ${email}`);
    
    // Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insertar usuario
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          name,
          password_hash: passwordHash,
          role,
          is_active: true,
          must_change_password: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear usuario:', error.message);
      return false;
    }

    console.log('✅ Usuario creado exitosamente:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Nombre: ${data.name}`);
    console.log(`   Rol: ${data.role}`);
    console.log(`   Contraseña: ${password}`);
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

// Crear el usuario
await createUser('juan.gutierrez20@usa.edu.co', 'Juan Gutiérrez', '1044218091', 'profesor');
