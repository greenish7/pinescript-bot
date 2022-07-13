import { OrderSide } from 'binance';
import { config } from '../config';
import { binanceWrapper, cryptoMeterWrapper, sendMessage } from '../core';
import { Order } from '../models';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const placeNewOrder = async (req: Request, res: Response) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: errors.array()[0] });
  }
  let { symbol, side, token, close, recheck } = req.body;

  // check if token is valid
  if (token !== config.JWT_SECRET) {
    return res.status(400).json({ msg: 'invalid token' });
  }

  let message = '';
  try {
    // ensure symbol is valid

    // @notice Check whether the market volume and price change in the past 24hrs meets threshold
    symbol = symbol.endsWith('PERP') ? symbol.replace('PERP', '') : symbol;

    let { trade, pair, pairs } = await cryptoMeterWrapper.tradePair(
      symbol,
      side
    );

    if (!pair) {
      message = `Invalid market pair. ${symbol} not found in cryptometer API`;
      sendMessage(message);
      return res.status(400).json({ msg: message, success: false });
    }

    if (!trade && !recheck && !close) {
      message = `SKIPPING TRADE FOR \`${symbol}\`\n---`;
      message += `\nSide: ${side.toUpperCase()}`;
      message += `\n---`;
      message += `\n**CRYPTOMETER**\n- - -`;
      message += `\nVolume: $\`${pair.volume_24.toLocaleString()}\``;
      message += `\nChange 24h: \`${pair.change_24h}\\%\``;
      message += `\n- - -`;
      message += `\n**CONFIG**\n- - -`;
      message += `\nVolume: $\`${config.VOLUME_USD_THRESHOLD.toLocaleString()}\``;
      message += `\nChange 24h: \`${config.CHANGE_24H_THRESHOLD}\\%\``;
      message += `\n- - -`;
      sendMessage(message);
      Order.build({
        symbol,
        side,
      }).save();
      return res.status(200).json({ msg: 'SKIPPING TRADE', success: false });
    }

    if (!close) {
      // check if the token is in top 1 of the past 24hrs
      pairs = pairs.sort((a, b) => Number(b.change_24h) - Number(a.change_24h));

      const top = 1;

      const topPairs3 =
        side.toLowerCase() === 'buy'
          ? pairs.slice(0, 3)
          : pairs
              .sort((a, b) => Number(a.change_24h) - Number(b.change_24h))
              .slice(0, 3);

      if (
        !topPairs3
          .slice(0, top)
          .some(
            (p) =>
              p.market_pair === pair.market_pair ||
              p.pair === pair.pair ||
              p.market_pair.replace('-', '') ===
                pair.market_pair.replace('-', '')
          )
      ) {
        message = `SKIPPING TRADE FOR \`${symbol}\`\n---`;
        message += `\nSide: ${side.toUpperCase()}`;
        message += `\n---`;
        message += `\n**CRYPTOMETER**\n- - -`;
        message += `\nVolume: $\`${pair.volume_24.toLocaleString()}\``;
        message += `\nChange 24h: \`${pair.change_24h}\\%\``;
        message += `\n- - -`;
        message +=
          topPairs3.length > 1
            ? `\n**TOP ${topPairs3.length} PAIRS IN THE PAIRS 24HRs**\n- - -`
            : '\n**TOP PAIR IN THE PAIRS 24HRs**\n- - -';
        topPairs3.forEach((p) => {
          message += `\nPair: \`${p.market_pair}\``;
          message += `\nVolume: $\`${p.volume_24.toLocaleString()}\``;
          message += `\nChange 24h: \`${p.change_24h}\\%\``;
          message += `\n- -`;
        });
        message += `\n${
          pair.market_pair || pair.pair || symbol
        } is not in top ${top} in the past 24hrs`;
        message += `\n---`;

        sendMessage(message);

        return res.status(200).json({ msg: 'SKIPPING TRADE', success: false });
      }
    }

    // @notice Check whether there's any open position
    const positions = await binanceWrapper.getAllOpenOrders();
    if (!close && positions.length > 0) {
      message = `Failed to submit new order.\nYou have an open position for ${positions
        .map((order) => order.symbol)
        .join(', ')}`;
      console.error(message);
      sendMessage(message);
      return res.status(400).json({ msg: message, success: false });
    }
    let decimals =
      (await binanceWrapper.getPricePrecision(pair.market_pair)) || 2;
    if (close) {
      // close all open positions
      let pToClose = positions.find(
        (p) => p.symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (pToClose) {
        let price =
          side.toUpperCase() == 'BUY'
            ? (await binanceWrapper.getSymbolLastPrice({ symbol })).price
            : (
                await binanceWrapper.getMarkPrice({
                  symbol,
                })
              ).markPrice;

        await binanceWrapper.submitNewOrder({
          symbol: pToClose.symbol,
          side: side.toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
          type: 'LIMIT',
          quantity: Math.abs(parseFloat(pToClose.positionAmt as string)),
          price: parseFloat(parseFloat(price.toString()).toFixed(decimals)),
          timeInForce: 'GTC',
          reduceOnly: 'true',
          decimals,
        });

        message = `Successfully submitted a close order for \`${symbol}\`\n---`;
        sendMessage(message);
      } else {
        message = `No open position for \`${symbol}\``;
        // sendMessage(message);
      }
    } else {
      // decide on the price to use
      //@notice when BUY price = Last Price and when SELL, price = Mark Price.
      let price = (await binanceWrapper.getSymbolLastPrice({ symbol })).price;
      side.toUpperCase() == 'BUY'
        ? (await binanceWrapper.getSymbolLastPrice({ symbol })).price
        : (
            await binanceWrapper.getMarkPrice({
              symbol,
            })
          ).markPrice;
      console.log({ price }, { q: config.QUANTITY });
      price = parseFloat(price.toString());
      let quantity = parseFloat((config.QUANTITY / price).toFixed(0));
      console.log({ quantity });
      await binanceWrapper.submitNewOrder({
        symbol,
        side: side.toUpperCase(),
        type: close ? 'MARKET' : 'LIMIT',
        quantity,
        decimals,
        price: parseFloat(parseFloat(price.toString()).toFixed(decimals)),
        timeInForce: 'GTC',
      });
      message = `NEW ORDER SUBMITTED FOR \`${symbol}\`\n---`;
      message += `\nSide: ${side.toUpperCase()}`;
      message += `\nPrice: $\`${price.toLocaleString()}\``;
      message += `\nQuantity: $\`${quantity.toLocaleString()}\``;
      message += `\n- - -`;

      message += `\n**CRYPTOMETER**\n- - -`;
      message += `\nVolume: $\`${pair.volume_24.toLocaleString()}\``;
      message += `\nChange 24h: \`${pair.change_24h}\\%\``;
      message += `\n- - -`;

      message += `\n**CONFIG**\n- - -`;
      message += `\nVolume: $\`${config.VOLUME_USD_THRESHOLD.toLocaleString()}\``;
      message += `\nChange 24h: \`${config.CHANGE_24H_THRESHOLD}\\%\``;
      message += `\n- - -`;

      sendMessage(message);
    }

    return res.status(200).json({ msg: message, success: true });
  } catch (error: any) {
    message = `Failed to submit new order. ${error.message} ${symbol}`
      .replace('(', '\\(')
      .replace(')', '\\)');
    sendMessage(message);
    return res.status(400).json({ msg: message, success: false });
  }
};
