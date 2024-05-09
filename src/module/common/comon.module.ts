import { Module } from '@nestjs/common';
import { ImageModule } from './image/image.module';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { SumUpModule } from './payment/sumup/sumup.module';

@Module({
  imports: [MailModule, ImageModule, SumUpModule],
  providers: [MailService],
  controllers: [],
  exports: [MailService],
})
export class CommonModule {}
