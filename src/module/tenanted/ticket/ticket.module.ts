import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/module/common/mail/mail.service';
import { TenancyModule } from 'src/module/common/tenancy/tenantcy.module';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { Receipt } from './entity/receipt.entity';
import { Ticket } from './entity/ticket.entity';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { TicketController } from './ticket.controller';
import { TicketHandlerService } from './ticket.handler.service';
import { TicketService } from './ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Receipt, User, CompanyConfig, Company]), TenancyModule],
  controllers: [TicketController, ReceiptController],
  providers: [TicketService, TicketHandlerService, ReceiptService, MailService],
})
export class TicketModule {}
