import { Controller, Get, Param } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { MailService } from './mail.service';

export class TestMailDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test/:email')
  async sendTestMail(@Param('email') email: string) {
    this.mailService.sendMail({
      to: email,
      subject: '[pos] Test Email',
      template: './otp',
      context: {
        otp: '123',
      },
      attachments: [
        {
          filename: 'logo.png',
          path: `${__dirname}/templates/images/logo.png`,
          cid: 'logo',
        },
      ],
    });
  }
}
