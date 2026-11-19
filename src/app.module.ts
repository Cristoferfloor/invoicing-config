import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VariablesEntorno, validarEntorno } from './config/entorno.validation';
import { GuardarConexionErpUseCase } from './application/use-cases/guardar-conexion-erp.use-case';
import { GuardarEmpresaUseCase } from './application/use-cases/guardar-empresa.use-case';
import { ListarConexionesErpUseCase } from './application/use-cases/listar-conexiones-erp.use-case';
import { ListarVersionesLogoUseCase } from './application/use-cases/listar-versiones-logo.use-case';
import { ListarVersionesPlantillaUseCase } from './application/use-cases/listar-versiones-plantilla.use-case';
import { ObtenerConexionErpUseCase } from './application/use-cases/obtener-conexion-erp.use-case';
import { ObtenerEmpresaUseCase } from './application/use-cases/obtener-empresa.use-case';
import { ObtenerLogoUseCase } from './application/use-cases/obtener-logo.use-case';
import { ObtenerPlantillaVigenteUseCase } from './application/use-cases/obtener-plantilla-vigente.use-case';
import { PublicarLogoUseCase } from './application/use-cases/publicar-logo.use-case';
import { PublicarPlantillaUseCase } from './application/use-cases/publicar-plantilla.use-case';
import { CIFRADOR_PORT } from './domain/ports/cifrador.port';
import { CONEXIONES_ERP_REPOSITORY } from './domain/ports/conexiones-erp.repository.port';
import { EMPRESAS_REPOSITORY } from './domain/ports/empresas.repository.port';
import { LOGOS_REPOSITORY } from './domain/ports/logos.repository.port';
import { PLANTILLAS_REPOSITORY } from './domain/ports/plantillas.repository.port';
import { VALIDADOR_PLANTILLA_PORT } from './domain/ports/validador-plantilla.port';
import { AesGcmCifradorAdapter } from './infrastructure/crypto/aes-gcm-cifrador.adapter';
import { ConexionErpEntity, EmpresaEntity, LogoEntity, PlantillaEntity } from './infrastructure/persistence/entities';
import { ConexionesErpTypeOrmRepository } from './infrastructure/persistence/repositories/conexiones-erp.typeorm.repository';
import { EmpresasTypeOrmRepository } from './infrastructure/persistence/repositories/empresas.typeorm.repository';
import { LogosTypeOrmRepository } from './infrastructure/persistence/repositories/logos.typeorm.repository';
import { PlantillasTypeOrmRepository } from './infrastructure/persistence/repositories/plantillas.typeorm.repository';
import { opcionesTypeOrm } from './infrastructure/persistence/typeorm.config';
import { ConexionesErpController } from './infrastructure/rest/controllers/conexiones-erp.controller';
import { EmpresasController } from './infrastructure/rest/controllers/empresas.controller';
import { LogosController } from './infrastructure/rest/controllers/logos.controller';
import { PlantillasController } from './infrastructure/rest/controllers/plantillas.controller';
import { SaludController } from './infrastructure/rest/controllers/salud.controller';
import { TOKEN_ADMIN, TokenAdminGuard } from './infrastructure/rest/guards/token-admin.guard';
import { XmldomValidadorPlantillaAdapter } from './infrastructure/xml/xmldom-validador-plantilla.adapter';

type Entorno = ConfigService<VariablesEntorno, true>;

@Module({
  imports: [
    // Fuera de Docker lee .env; dentro, las variables vienen de env_file.
    ConfigModule.forRoot({ isGlobal: true, validate: validarEntorno }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (entorno: Entorno) => opcionesTypeOrm(entorno.get('CONFIG_PG_URL')),
    }),
    TypeOrmModule.forFeature([EmpresaEntity, PlantillaEntity, LogoEntity, ConexionErpEntity]),
  ],
  controllers: [EmpresasController, PlantillasController, LogosController, ConexionesErpController, SaludController],
  providers: [
    // Casos de uso
    GuardarEmpresaUseCase,
    ObtenerEmpresaUseCase,
    PublicarPlantillaUseCase,
    ObtenerPlantillaVigenteUseCase,
    ListarVersionesPlantillaUseCase,
    PublicarLogoUseCase,
    ObtenerLogoUseCase,
    ListarVersionesLogoUseCase,
    GuardarConexionErpUseCase,
    ObtenerConexionErpUseCase,
    ListarConexionesErpUseCase,

    // Puertos -> adaptadores
    { provide: EMPRESAS_REPOSITORY, useClass: EmpresasTypeOrmRepository },
    { provide: PLANTILLAS_REPOSITORY, useClass: PlantillasTypeOrmRepository },
    { provide: LOGOS_REPOSITORY, useClass: LogosTypeOrmRepository },
    { provide: CONEXIONES_ERP_REPOSITORY, useClass: ConexionesErpTypeOrmRepository },
    { provide: VALIDADOR_PLANTILLA_PORT, useClass: XmldomValidadorPlantillaAdapter },
    {
      provide: CIFRADOR_PORT,
      inject: [ConfigService],
      useFactory: (entorno: Entorno) => new AesGcmCifradorAdapter(entorno.get('CONFIG_MASTER_KEY')),
    },

    // Seguridad
    TokenAdminGuard,
    {
      provide: TOKEN_ADMIN,
      inject: [ConfigService],
      useFactory: (entorno: Entorno) => entorno.get('CONFIG_ADMIN_TOKEN'),
    },
  ],
})
export class AppModule {}
