import axios from 'axios';
import { config } from '../config';

/**
 * @class Cryptometer
 * @description Cryptometer class
 * @author
 * @version 1.0
 */
class CryptoMeter {
  private _binance_futures: any;
  private base_url: string;
  private _api_key: string;

  constructor() {
    this._binance_futures = [];
    this.base_url = 'https://api.cryptometer.io';
    this._api_key = config.CRYPTOMETER_API_KEY!;
  }

  tradePair = async (
    _pair: string,
    side: string
  ): Promise<{
    trade: boolean;
    pair: {
      pair: string;
      volume_24: string;
      change_24h: string;
      name: string;
      price: number;
      market_pair: string;
    };
    pairs: {
      pair: string;
      volume_24: string;
      change_24h: string;
      name: string;
      price: number;
      market_pair: string;
    }[];
  }> => {
    const data = await this._fetch();

    let pair = data.find(
      (data_: any) =>
        data_.pair === _pair ||
        data_.market_pair === _pair ||
        data_.market_pair.replace('-', '') === _pair
    );

    if (!pair) {
      if (_pair.endsWith('PERP')) {
        _pair = _pair.replace('PERP', '');
      } else if (_pair.endsWith('USDT')) {
        _pair = _pair.replace('USDT', '');
      }
      pair = data.find(
        (data_: any) =>
          data_.pair === _pair ||
          data_.market_pair === _pair ||
          data_.market_pair.replace('-', '') === _pair
      );
      // one more try
      if (!pair) {
        pair = data.find(
          (data_: any) =>
            data_.pair.includes(_pair) ||
            data_.market_pair.includes(_pair) ||
            data_.market_pair.replace('-', '').includes(_pair)
        );
      }
    }
    if (pair) {
      return {
        trade:
          pair.volume_24 &&
          pair.change_24h &&
          pair.volume_24 >= config.VOLUME_USD_THRESHOLD &&
          (side.toLowerCase() === 'buy'
            ? pair.change_24h >= config.CHANGE_24H_THRESHOLD
            : pair.change_24h <= -config.CHANGE_24H_THRESHOLD),

        pair,
        pairs: data.filter(
          (data_: any) =>
            ['USDT', 'PERP'].some((s) => data_.market_pair.endsWith(s)) &&
            parseFloat(data_.volume_24) >= config.VOLUME_USD_THRESHOLD &&
            Math.abs(data_.change_24h) >= config.CHANGE_24H_THRESHOLD
        ),
      };
    }
    return {
      trade: false,
      pair,
      pairs: data.filter(
        (data_: any) =>
          ['USDT', 'PERP'].some((s) => data_.market_pair.endsWith(s)) &&
          parseFloat(data_.volume_24) >= config.VOLUME_USD_THRESHOLD &&
          Math.abs(data_.change_24h) >= config.CHANGE_24H_THRESHOLD
      ),
    };
  };

  private _fetch = async (
    exchange: string = 'binance_futures',
    filter = 'all'
  ) => {
    const { data } = await axios.get(`${this.base_url}/tickerlist-pro/`, {
      params: {
        e: exchange,
        // filter,
        api_key: this._api_key,
      },
    });
    if (data.success == 'true') {
      return data.data;
    } else {
      console.error(`Error:`, data?.error);
      throw new Error(data?.error || data);
    }
  };

  private _fetch2 = async () => {
    const { data } = await axios({
      method: 'POST',
      baseURL: 'https://scanner.tradingview.com',
      url: '/crypto/scan',
      data: {
        filter: [
          { left: 'change', operation: 'nempty' },
          { left: 'exchange', operation: 'equal', right: 'BINANCE' },
        ],
        options: { lang: 'en' },
        markets: ['crypto'],
        symbols: { query: { types: [] }, tickers: [] },
        columns: [
          'base_currency_logoid',
          'currency_logoid',
          'name',
          'close',
          'change',
          'volume',
          'exchange',
          'description',
          'type',
          'subtype',
          'update_mode',
          'pricescale',
          'minmov',
          'fractional',
          'minmove2',
        ],
        sort: { sortBy: 'change', sortOrder: 'desc' },
        range: [0, 1500],
      },
      headers: {
        origin: `https://www.tradingview.com`,
        referrer: `https://www.tradingview.com/`,
      },
    });

    return (
      data?.data.map((d_: { s: string; d: any[] }) => {
        let { d } = d_;
        return {
          pair: d[2],
          volume: d[5],
          change_24h: d[4],
          name: d[7],
        };
      }) || []
    );
  };
}

export const cryptoMeterWrapper = new CryptoMeter();
