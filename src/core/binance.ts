import {
  BasicSymbolParam,
  BooleanString,
  NewFuturesOrderParams,
  OrderSide,
  OrderTimeInForce,
  OrderType,
  USDMClient,
} from 'binance';
import { config } from '../config';

class BinanceWrapper {
  private readonly client: USDMClient;

  constructor() {
    this.client = new USDMClient({
      api_key: config.BINANCE_API_KEY,
      api_secret: config.BINANCE_API_SECRET,
    });
  }

  submitNewOrder = async (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    price: number;
    decimals: number;
    timeInForce: OrderTimeInForce;
    reduceOnly?: BooleanString;
  }) => {
    let trials = 0;
    while (true) {
      try {
        console.log(`Submitting order for`, params);
        return await this.client.submitNewOrder(params);
      } catch (error: any) {
        console.error(error);
        if (error.message.includes('Price not increased by tick size')) {
          params.price = parseFloat(params.price.toFixed(params.decimals - 1));
          params.decimals = params.decimals - 1;
        }
        if (trials > 3) {
          throw new Error(error?.message || error);
        }
        if (error.message.includes('ReduceOnly Order is rejected')) {
          throw new Error(`You already have an open ${params.side} order for`);
        }
      }
      trials++;
    }
  };

  getSymbolLastPrice = async (params: BasicSymbolParam) => {
    return await this.client.getSymbolPriceTicker(params);
  };

  getMarkPrice = async (params: BasicSymbolParam) => {
    return await this.client.getMarkPrice(params);
  };
  getPricePrecision = async (pair: string) => {
    const { symbols } = await this.client.getExchangeInfo();
    let symbol = symbols.find((s) => s.symbol === pair || s.pair === pair);
    if (!symbol) {
      if (pair.endsWith('PERP')) {
        pair.replace('PERP', '');
      } else if (pair.endsWith('USDT')) {
        pair.replace('USDT', '');
      }
      symbol = symbols.find((s) => s.symbol === pair || s.pair === pair);
    }
    return symbol?.pricePrecision;
  };

  getAllOpenOrders = async () => {
    const positions = await this.client.getPositions();
    return positions.filter(
      (position) => parseFloat(position.positionAmt as string) != 0
    );
  };
}

export const binanceWrapper = new BinanceWrapper();
