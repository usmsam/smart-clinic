import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import * as hbs from 'hbs';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;
    if (token) {
      try {
        res.locals.user = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
      } catch {
        res.locals.user = undefined;
      }
    } else {
      res.locals.user = undefined;
    }
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter(), new DatabaseExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setBaseViewsDir(join(process.cwd(), 'src/views'));
  app.setViewEngine('hbs');

  registerPartials(join(process.cwd(), 'src/views/partials'));
  hbs.handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  hbs.handlebars.registerHelper('or', (a: unknown, b: unknown) => a || b);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}

function registerPartials(partialsDir: string) {
  if (!existsSync(partialsDir)) return;

  for (const entry of readdirSync(partialsDir)) {
    const filePath = join(partialsDir, entry);
    if (!filePath.endsWith('.hbs')) continue;

    const name = entry.replace(/\.hbs$/, '');
    const content = readFileSync(filePath, 'utf8');
    hbs.handlebars.registerPartial(name, content);
  }
}

bootstrap();
