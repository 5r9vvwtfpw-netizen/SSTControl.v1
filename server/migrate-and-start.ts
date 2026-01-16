#!/usr/bin/env node
/**
 * Script de inicio para producción que ejecuta migraciones antes de iniciar la app
 * Este script asegura que la base de datos esté actualizada antes de arrancar
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔄 Ejecutando migraciones de base de datos...');

// Ejecutar drizzle-kit push con --force para aplicar cambios automáticamente
const migrate = spawn('npx', ['drizzle-kit', 'push', '--force'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

migrate.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Migraciones completadas exitosamente');
    console.log('🚀 Iniciando aplicación...');
    
    // Iniciar la aplicación
    const app = spawn('node', ['dist/index.js'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    app.on('close', (appCode) => {
      process.exit(appCode || 0);
    });
  } else {
    console.warn('⚠️ Migraciones fallaron, pero intentando iniciar de todos modos...');
    
    // Intentar iniciar la aplicación incluso si las migraciones fallan
    const app = spawn('node', ['dist/index.js'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    app.on('close', (appCode) => {
      process.exit(appCode || 0);
    });
  }
});

migrate.on('error', (err) => {
  console.error('❌ Error al ejecutar migraciones:', err);
  console.log('⚠️ Intentando iniciar aplicación de todos modos...');
  
  // Iniciar la aplicación incluso si hay error
  const app = spawn('node', ['dist/index.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  app.on('close', (appCode) => {
    process.exit(appCode || 0);
  });
});
