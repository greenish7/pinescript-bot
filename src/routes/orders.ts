import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { OrderSide } from 'binance';
import config from './../../config';
import { binanceWrapper } from './../binance';
import { cryptoMeterWrapper } from './../cryptometer';

const router = express.Router();

let message = '';

router.post(
  '/api/v1/orders/new',
  [
    body('symbol').notEmpty().withMessage('please provide asset symbol'),
    body('side').notEmpty().withMessage('please provide side'),
  ],
  async (req: Request, res: Response) => {
    let { side, symbol } = req.body;

    try {
      if (['BUY', 'SELL'].includes(side?.toUppeCase())) {
        // @notice Check whether the market volume and price change in the past 24hrs meets threshold
        const pair = await cryptoMeterWrapper.checkPairToTrade(
          side,
          symbol.replace('USDT', '-USDT')
        );

        if (pair.length == 0) {
          console.log('pair', pair);
          console.info(
            `[SKIPPING] trade for market ${symbol}, ${symbol} volume  or price change 24H is below set threshold, {config: {volume: ${config.VOLUME_USD_THRESHOLD}, change_24h: ${config.CHANGE_24H_THRESHOLD}}}`
          );
          return;
        }

        // @notice Check whether there's any open position
        const open_orders = await binanceWrapper.getAllOpenOrders();

        if (open_orders.length > 0) {
          console.error(
            `Failed to submit new order, reason: You have an active position for ${open_orders
              .map((order) => order.symbol)
              .join(', ')}`
          );
          return;
        }
      }

      // decide on the price to use
      //@notice when BUY price = Last Price and when SELL, price = Mark Price.
      let price =
        side == 'BUY'
          ? (
              await binanceWrapper.getMarkPrice({
                symbol,
              })
            ).estimatedSettlePrice
          : (
              await binanceWrapper.getMarkPrice({
                symbol,
              })
            ).markPrice;

      await binanceWrapper.submitNewOrder({
        symbol,
        side,
        type: 'LIMIT',
        quantity: config.QUANTITY,
        price,
      });
    } catch (error) {}
  }
);
