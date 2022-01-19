import { BasicSymbolParam, NewFuturesOrderParams, USDMClient } from 'binance';
class BinanceWrapper {
  private readonly client: USDMClient;
  constructor() {
    this.client = new USDMClient({});
  }

  submitNewOrder = async (params: NewFuturesOrderParams) => {
    await this.client.submitNewOrder(params);
  };

  getMarkPrice = async (params: Partial<BasicSymbolParam>) => {
    return await this.client.getMarkPrice(params);
  };

  getAllOpenOrders = async (params?: Partial<BasicSymbolParam>) => {
    return await this.client.getAllOpenOrders(params);
  };
}

export const binanceWrapper = new BinanceWrapper();
