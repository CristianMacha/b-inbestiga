import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const DatabaseProvider: DynamicModule = TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  async useFactory(config: ConfigService) {
    const dbConfig: TypeOrmModuleOptions = {
      type: 'mysql',
      port: 3306,
      username: config.get('DB_USERNAME'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      host: config.get('DB_HOST'),
      synchronize: (config.get('SYNCRONIZE') === 'TRUE'),
      autoLoadEntities: true,
    };

    return dbConfig;
  },
});
