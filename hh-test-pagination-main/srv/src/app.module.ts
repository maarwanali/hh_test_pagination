import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

// Check if the environment variable is set
if (!process.env.APP_PG_URL) {
  console.error('Error: APP_PG_URL environment variable is not set.');
  console.log(process.env);
  process.exit(1); // Exit the process with an error code
}

const pg = new URL(process.env.APP_PG_URL);
console.log('Database URL:', process.env.APP_PG_URL);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: pg.hostname,
      port: parseInt(pg.port),
      username: pg.username,
      password: pg.password,
      database: pg.pathname.slice(1),
      ssl: pg.searchParams.get('sslmode') !== 'disable',
      autoLoadEntities: true,
      // It is unsafe to use synchronize: true for schema synchronization on production
      synchronize: true, // Typically you might check process.env.NODE_ENV here
      logging: process.env.NODE_ENV === 'development',
      useUTC: true,
    }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
