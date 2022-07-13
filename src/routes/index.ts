import { Application } from 'express';

export const configureRoutes = (app: Application) => {
  app.use('/cryptometer/api/v1/orders', require('./api/orders'));
  app.use('/', (req, res) => {
    res.status(200).send('Welcome to CryptoMeter Trading Bot');
  });
};
