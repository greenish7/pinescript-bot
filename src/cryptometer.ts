import axios from 'axios';
import config from '../config';

class CryptoMeterWrapper {
  private _binance_futures: any;
  private _base_url: string;
  private _api_key: string;
  constructor() {
    this._binance_futures = [];
    this._base_url = 'https://api.cryptometer.io';
    this._api_key = config.CRYPTOMETER_API_KEY!;
  }

  private _fetch = async (
    exchange: string = 'binance_futures',
    filter = 'all'
  ) => {
    const { data } = await axios.get(
      `${this._base_url}//cryptocurrency-info/`,
      {
        params: {
          e: exchange,
          filter,
          api_key: this._api_key,
        },
      }
    );

    if (data.success || data.success == 'true') {
      this._binance_futures = data.data;
    } else {
      console.error(`Error:`, data?.error);
    }
  };

  checkPairToTrade = async (side: string, _pair: string) => {
    await this._fetch();
    for (let i = 0; i < this._binance_futures.length; i++) {
      let pair = this._binance_futures[i];
      if (pair.pair.includes(_pair)) {
        if (
          (parseFloat(pair.volume) >= config.VOLUME_USD_THRESHOLD &&
            parseFloat(pair.change_24h) >= config.CHANGE_24H_THRESHOLD &&
            ['BUY', 'LONG'].includes(side.toUpperCase())) ||
          (Math.abs(parseFloat(pair.volume)) >= config.VOLUME_USD_THRESHOLD &&
            Math.abs(parseFloat(pair.change_24h)) >=
              config.CHANGE_24H_THRESHOLD &&
            ['SELL', 'SHORT'].includes(side.toUpperCase()))
        ) {
          return pair;
        }
        return [];
      }
    }
    return [];
  };
}

export const cryptoMeterWrapper = new CryptoMeterWrapper();
