import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Script para re-hashear contraseñas que están en texto plano
 * Esto es necesario cuando se importaron datos con contraseñas sin hashear
 */

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function fixPasswords() {
  console.log('🔐 Iniciando corrección de contraseñas...\n');
  
  try {
    // Obtener todos los usuarios
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Total de usuarios: ${allUsers.length}\n`);
    
    let fixed = 0;
    let alreadyHashed = 0;
    
    for (const user of allUsers) {
      // Las contraseñas hasheadas con scrypt tienen un formato: hash.salt
      // y suelen tener más de 100 caracteres
      const isHashed = user.password.includes('.') && user.password.length > 100;
      
      if (!isHashed) {
        console.log(`🔧 Hasheando contraseña para: ${user.username}`);
        
        const hashedPassword = await hashPassword(user.password);
        
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.id, user.id));
        
        console.log(`   ✅ Contraseña hasheada correctamente\n`);
        fixed++;
      } else {
        console.log(`✓ ${user.username} - Ya tiene contraseña hasheada`);
        alreadyHashed++;
      }
    }
    
    console.log('\n📋 Resumen:');
    console.log(`   ✅ Contraseñas hasheadas: ${fixed}`);
    console.log(`   ✓  Ya estaban hasheadas: ${alreadyHashed}`);
    console.log(`   📊 Total procesado: ${allUsers.length}`);
    
    if (fixed > 0) {
      console.log('\n🎉 ¡Corrección completada! Ahora puedes iniciar sesión con las contraseñas originales.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

fixPasswords();
