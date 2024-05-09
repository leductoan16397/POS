import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as moment from 'moment-timezone';
import { APP_NAME } from 'src/common/constant';
import { DiscountType } from 'src/common/enum';
import { convertNumberToFloat } from 'src/common/utils';
import { Company } from 'src/module/public/company/entity/company.entity';
import { CompanyConfig } from 'src/module/public/company_config/entity/company.config.entity';
import { User } from 'src/module/public/user/entity/user.entity';
import { DiscountTicket } from 'src/module/tenanted/ticket/entity/discount.ticket.entity';
import { ItemTicket } from 'src/module/tenanted/ticket/entity/item.ticket.entity';
import { Receipt } from 'src/module/tenanted/ticket/entity/receipt.entity';
import { Ticket } from 'src/module/tenanted/ticket/entity/ticket.entity';
import { OrderTypeLabel } from 'src/module/tenanted/ticket/utils/enum';
import { formatCurrency } from 'src/module/tenanted/ticket/utils/helper';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMail(mailOptions: ISendMailOptions) {
    return this.mailerService.sendMail(mailOptions);
  }

  // send mail otp
  async sendOtp({ email, otp }: { email: string; otp: string }) {
    const rs = await this.sendMail({
      to: email,
      subject: `[${APP_NAME}] OTP Code`,
      template: './otp.ejs',
      context: {
        otp,
      },
      attachments: [
        {
          filename: 'logo.png',
          content: createReadStream(`${__dirname}/templates/images/logo.png`, {}),
          cid: 'logo',
        },
      ],
    });
    return rs;
  }

  //  email crated
  async companyCreated({ email, businessName }: { email: string; businessName: string }) {
    const rs = await this.sendMail({
      to: email,
      subject: `[${APP_NAME}] Your company was created`,
      template: './company.created.ejs',
      context: {
        businessName,
      },
      attachments: [
        {
          filename: 'logo.png',
          path: `${__dirname}/templates/images/logo.png`,
          cid: 'logo',
        },
      ],
    });
    return rs;
  }

  //  change password

  // add employee
  async employeeCreated({ email, password }: { email: string; password: string }) {
    const rs = await this.sendMail({
      to: email,
      subject: `[${APP_NAME}] Account created`,
      template: './employee.created.ejs',
      context: {
        password,
      },
      attachments: [
        {
          filename: 'logo.png',
          path: `${__dirname}/templates/images/logo.png`,
          cid: 'logo',
        },
      ],
    });
    return rs;
  }

  // Send receipt mails
  async sendTicketReceiptMail(data: {
    ticket: Ticket;
    itemTickets: ItemTicket[];
    discountTickets: DiscountTicket[];
    receipts: Receipt[];
    email: string;
    employee: User;
    company: Company;
    companyConfig: CompanyConfig;
  }) {
    const ticketType = OrderTypeLabel[data.ticket.type];
    const { companyConfig } = data;

    const formattedTotalPrice = formatCurrency(data.ticket.totalPrice < 0 ? 0 : data.ticket.totalPrice, companyConfig);
    let subTotalPrice = 0;
    const itemTickets = data.itemTickets.map((itemTicket) => {
      subTotalPrice += itemTicket.discountedPrice * itemTicket.quantity;
      const modifiers = itemTicket.modifiers.map((modifier) => {
        return `+ ${modifier.optionName} (${formatCurrency(modifier.price, companyConfig)})`;
      });

      return {
        ...itemTicket,
        formattedPrice: formatCurrency(itemTicket.price, companyConfig),
        formattedTotalPrice: formatCurrency(itemTicket.quantity * itemTicket.price, companyConfig),
        modifiers,
      };
    });

    const discounts: { name: string; price: number; formattedPrice: string }[] = [];
    let discountedPercent = data.ticket.totalPriceOriginal;

    data.discountTickets.forEach((discountTicket) => {
      if (discountTicket.discountType === DiscountType.Amount) {
        discounts.push({
          name: discountTicket.discountName,
          price: discountTicket.value,
          formattedPrice: formatCurrency(discountTicket.value, companyConfig),
        });
      } else {
        const discountValue = (discountedPercent / 100) * discountTicket.value;

        discounts.push({
          name: discountTicket.discountName,
          price: convertNumberToFloat(discountValue, companyConfig.decimalPlaces),
          formattedPrice: formatCurrency(
            convertNumberToFloat(discountValue, companyConfig.decimalPlaces),
            companyConfig,
          ),
        });
        discountedPercent -= discountValue;
      }
    });

    let taxList: { name: string; price: number; formattedPrice: string }[] = [];
    data.itemTickets.forEach((itemTicket) => {
      if (itemTicket.tax) {
        const taxValue = (itemTicket.price - itemTicket.price / (1 + itemTicket.tax / 100)) * itemTicket.quantity;
        const taxInList = taxList.find((tax) => tax.name === itemTicket.tax.toString() + '%');
        if (!taxInList) {
          taxList.push({
            name: itemTicket.tax.toString() + '%',
            price: convertNumberToFloat(taxValue, companyConfig.decimalPlaces),
            formattedPrice: formatCurrency(convertNumberToFloat(taxValue, companyConfig.decimalPlaces), companyConfig),
          });
        } else {
          taxList = taxList.map((tax) => {
            if (tax.name === itemTicket.tax.toString() + '%') {
              tax.price += convertNumberToFloat(taxValue, companyConfig.decimalPlaces);
              tax.formattedPrice = formatCurrency(
                convertNumberToFloat(tax.price, companyConfig.decimalPlaces),
                companyConfig,
              );
            }

            return tax;
          });
        }
      }
    });

    const receipts: { name: string; formattedAmout: string; formattedPrice: string; formattedChange: string }[] =
      data.receipts.map((receipt) => {
        return {
          name: receipt.paymentType,
          formattedAmout: formatCurrency(
            convertNumberToFloat(receipt.totalPrice - receipt.differentAmount, companyConfig.decimalPlaces),
            data.companyConfig,
          ),
          formattedPrice: formatCurrency(receipt.totalPrice, data.companyConfig),
          formattedChange: receipt.differentAmount ? formatCurrency(receipt.differentAmount, data.companyConfig) : '',
        };
      });

    const rs = await this.sendMail({
      to: data.email,
      subject: `[${APP_NAME}] Receipt Information`,
      template: './ticket/ticket.receipt.ejs',
      context: {
        ...data,
        formattedTotalPrice,
        ticketType,
        itemTickets,
        discounts,
        taxList,
        receipts,
        companyConfig,
        ticketDate: moment(data.ticket.updatedAt).tz(data.companyConfig.timezone).format('YYYY-MM-DD'),
        ticketLabel: data.ticket.ticketNumber.toString().padStart(4, '0'),
        companyAddress: `${companyConfig.address ? companyConfig.address + ',' : ''} ${
          companyConfig.state ? companyConfig.state + ',' : ''
        }
        ${companyConfig.city ? companyConfig.city + ',' : ''}
        ${companyConfig.zipCode ?? ''}`,
      },
    });
    return rs;
  }

  async sendEndDayReport({ email, xmlFile }: { email: string; xmlFile: string }) {
    console.log(
      `${new Date().toString()} 🚀 ~ file: mail.service.ts:209 ~ MailService ~ sendEndDayReport ~ xmlFile:`,
      xmlFile,
    );
    console.log(
      `${new Date().toString()} 🚀 ~ file: mail.service.ts:209 ~ MailService ~ sendEndDayReport ~ email:`,
      email,
    );
    const date = moment().format('YYYYMMDDHHmmss');
    const rs = await this.sendMail({
      to: email,
      subject: `[${APP_NAME}] End Day Report`,
      template: './end-day.report.ejs',
      attachments: [
        {
          filename: 'logo.png',
          content: createReadStream(`${__dirname}/templates/images/logo.png`, {}),
          cid: 'logo',
        },
        {
          filename: `SAF-T Cash Register_99999989_${date}_1_1.xml`,
          content: xmlFile,
          contentType: 'application/xml',
        },
      ],
    });
    return rs;
  }
}
