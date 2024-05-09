import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get().mail.host,
          port: config.get().mail.port,
          secure: false,
          auth: {
            user: config.get().mail.username,
            pass: config.get().mail.password,
          },
        },
        defaults: {
          from: 'pos@zimaw.com',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
