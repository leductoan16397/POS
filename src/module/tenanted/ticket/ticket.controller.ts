import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { Pagination } from 'src/common/common.response';
import { CurrentUser } from 'src/common/loggedUser.decorator';
import { LoggedUser } from 'src/common/type';
import { AuthPermissions } from '../guard/guard.decorator';
import { FindTicketDto, SaveTicketDto, SendEmailDto, UpdateTicketDto } from './dto/ticket.dto';
import { MergeTicketsDto, ReportTicketDto } from './dto/ticket.handler.dto';
import { TicketData } from './response/ticket.res';
import { TicketHandlerService } from './ticket.handler.service';
import { TicketService } from './ticket.service';
import { LoggingInterceptor } from 'src/common/interceptor/transform.interceptor';

@ApiTags('Ticket')
@Controller('tickets')
@UseInterceptors(LoggingInterceptor)
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private readonly ticketHandlerService: TicketHandlerService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @AuthPermissions()
  async find(@Query() query: FindTicketDto): Promise<Pagination<TicketData>> {
    try {
      return await this.ticketService.find(query);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.controller.ts:23 ~ TicketController ~ find ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth()
  @AuthPermissions()
  async save(@CurrentUser() user: LoggedUser, @Body() body: SaveTicketDto): Promise<TicketData> {
    try {
      return await this.ticketService.save(user, body);
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.controller.ts:35 ~ TicketController ~ save ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async update(
    @CurrentUser() user: LoggedUser,
    @Param('id') id: string,
    @Body() body: UpdateTicketDto,
  ): Promise<TicketData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.ticketService.update(user, id, body);
    } catch (error) {
      console.log(`${new Date().toString()} 🚀 ~ file: ticket.controller.ts:51 ~ TicketController ~ error:`, error);
      throw error;
    }
  }

  @Get('data-report')
  @AuthPermissions()
  @ApiBearerAuth()
  async reportData(@CurrentUser() user: LoggedUser, @Query() query: ReportTicketDto) {
    return this.ticketHandlerService.reportData({ loggedUser: user, query });
  }

  @Get(':id')
  @AuthPermissions()
  @ApiBearerAuth()
  async findOne(@Param('id') id: string): Promise<TicketData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.ticketService.findOne({ id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.controller.ts:63 ~ TicketController ~ findOne ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Patch(':id/clear-item')
  @AuthPermissions()
  @ApiBearerAuth()
  async clearTicketItem(@Param('id') id: string): Promise<TicketData> {
    try {
      if (!isUUID(id, 'all')) {
        throw new BadRequestException('Invalid id');
      }
      return await this.ticketService.clearTicketItem({ ticketId: id });
    } catch (error) {
      console.log(
        `${new Date().toString()} 🚀 ~ file: ticket.controller.ts:106 ~ TicketController ~ clearTicketItem ~ error:`,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @AuthPermissions()
  async delete(@Param('id') id: string) {
    return this.ticketService.delete(id);
  }

  @Post('merge')
  @ApiBearerAuth()
  @AuthPermissions()
  async merge(@Body() body: MergeTicketsDto) {
    return this.ticketHandlerService.mergeTickets(body);
  }

  // @Post('split')
  // @ApiBearerAuth()
  // @AuthPermissions()
  // async split(@Body() body: SplitTicketsDto) {
  //   try {
  //     return await this.ticketHandlerService.splitTicket(body);
  //   } catch (error) {
  //     console.log(
  //       `${new Date().toString()} 🚀 ~ file: ticket.controller.ts:106 ~ TicketController ~ clearTicketItem ~ error:`,
  //       error,
  //     );
  //     throw error;
  //   }
  // }

  @Post('mail')
  @ApiBearerAuth()
  @AuthPermissions()
  async sendMail(@Body() body: SendEmailDto) {
    this.ticketService.sendMail(body);
  }
}
