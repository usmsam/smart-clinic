import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Telegraf } from 'telegraf';

@Injectable()
export class NotificationsService {
  constructor(private readonly configService: ConfigService) {}

  private createMailer() {
    const host = this.configService.get<string>('smtp.host');
    const user = this.configService.get<string>('smtp.user');
    const pass = this.configService.get<string>('smtp.pass');
    const port = this.configService.get<number>('smtp.port') || 587;

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendActivationEmail(to: string, link: string) {
    const transporter = this.createMailer();
    if (!transporter) return;
    await transporter.sendMail({
      from: this.configService.get<string>('mailFrom'),
      to,
      subject: 'Activate your account',
      html: `<p>Activate your account:</p><p><a href="${link}">${link}</a></p>`,
    });
  }

  async sendAppointmentEmail(to: string, title: string, body: string) {
    const transporter = this.createMailer();
    if (!transporter) return;
    await transporter.sendMail({
      from: this.configService.get<string>('mailFrom'),
      to,
      subject: title,
      html: `<p>${body}</p>`,
    });
  }

  async sendTelegramMessage(chatId: string, text: string) {
    const token = this.configService.get<string>('telegramBotToken');
    if (!token || !chatId) return;
    const bot = new Telegraf(token);
    await bot.telegram.sendMessage(chatId, text).catch(() => undefined);
  }
}
