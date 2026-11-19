import 'reflect-metadata';

import { validarEntorno } from '../src/config/entorno.validation';

describe('variables de entorno', () => {
  const completas = {
    CONFIG_PG_URL: 'postgres://config:clave@postgres:5432/config',
    CONFIG_ADMIN_TOKEN: 'token',
    CONFIG_MASTER_KEY: Buffer.alloc(32, 1).toString('base64'),
  };

  it('acepta las variables completas y pone el puerto por defecto', () => {
    expect(validarEntorno(completas).PORT).toBe(3003);
    expect(validarEntorno({ ...completas, PORT: '4000' }).PORT).toBe(4000);
  });

  it('no arranca si falta algo y dice que', () => {
    const { CONFIG_ADMIN_TOKEN: _, ...sinToken } = completas;
    expect(() => validarEntorno(sinToken)).toThrow(/CONFIG_ADMIN_TOKEN/);
    expect(() => validarEntorno({ ...completas, CONFIG_PG_URL: 'mysql://x' })).toThrow(/CONFIG_PG_URL/);
  });
});
