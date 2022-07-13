import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import expressRateLimit from 'express-rate-limit';
// import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
const xss = require('xss-clean');

import { logger } from './logger';

export const configureMiddleware = (app: Express) => {
  // Body parser middleware
  app.use(express.json());

  // Form parser middleware
  app.use(express.urlencoded({ extended: true }));

  // Cookie parser middleware
  app.use(cookieParser());

  // MongoDB sanitize middleware
  app.use(mongoSanitize());

  // Helmet improves API security by setting some additional header checks
  // app.use(helmet());

  // Prevent XSS attacks
  app.use(xss());

  // Prevent http param pollution
  app.use(hpp());

  // Logger middleware
  app.use(logger);

  // Add rate limit to API (100 requests per 10 minutes)
  app.use(
    expressRateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    })
  );

  // Enable CORS
  app.use(cors());
};
