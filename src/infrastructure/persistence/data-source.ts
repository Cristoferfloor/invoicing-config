import { DataSource } from 'typeorm';

import { opcionesTypeOrm } from './typeorm.config';

// Solo para la linea de comandos de TypeORM (npm run migration:*).
// Desde el equipo, la base esta en 127.0.0.1:5433 (no en "postgres", que es
// el nombre dentro de Docker): se usa MIGRATIONS_PG_URL si esta definida.
try {
  process.loadEnvFile();
} catch {
  // sin .env
}

const url = process.env.MIGRATIONS_PG_URL ?? process.env.CONFIG_PG_URL;
if (!url) throw new Error('Defina MIGRATIONS_PG_URL o CONFIG_PG_URL.');

export default new DataSource({ ...opcionesTypeOrm(url), migrationsRun: false });
