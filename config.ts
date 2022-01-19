import 'dotenv/config';

const config = {
  /**
   * TRADE PREFERENCIES
   */
  QUANTITY: 10000, // Initial Margin in $, actual quantity will be this initial margin x Leverage
  VOLUME_USD_THRESHOLD: 500_000, // volume change in 24hrs
  CHANGE_24H_THRESHOLD: -7, // price change in % over 24hrs

  /**
   * CRYPTOMETER
   * https://www.cryptometer.io/list/binance_futures
   */
  CRYPTOMETER_API_KEY: process.env.CRYPTOMETER_API_KEY,
};

export default config;
