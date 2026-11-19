import { DataSourceOptions } from 'typeorm';

import { ENTIDADES } from './entities';
import { MIGRACIONES } from './migrations';

// Las tablas salen de las entidades y cambian solo con migraciones, que se
// aplican solas al arrancar. synchronize queda apagado siempre: puede borrar
// columnas con datos.
export function opcionesTypeOrm(url: string): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    entities: ENTIDADES,
    migrations: MIGRACIONES,
    migrationsRun: true,
    synchronize: false,
    poolSize: 5,
  };
}
