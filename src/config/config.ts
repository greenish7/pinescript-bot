import 'dotenv/config';

if (!process.env.BOT_TOKEN || !process.env.MONGO_URI) {
  throw new Error('BOT_TOKEN and MONGO_URI must be defined in .env file');
}
export const config = {
  /**
   * @notice Database configuration
   */
  MONGO_URI: process.env.MONGO_URI!,

  /**
   * TRADE PREFERENCIES
   */
  QUANTITY: 10, // Initial Margin in $, actual quantity will be this initial margin x Leverage
  // VOLUME_USD_THRESHOLD: 150_000_000, // volume change in 24hrs
  VOLUME_USD_THRESHOLD: 150_000_000, // volume change in 24hrs
  CHANGE_24H_THRESHOLD: 7, // price change in % over 24hrs

  /**
   * CRYPTOMETER
   * https://www.cryptometer.io/list/binance_futures
   */
  CRYPTOMETER_API_KEY: process.env.CRYPTOMETER_API_KEY,

  /**
   * @notice JWT configuration
   * @dev This is the secret key that will be used to sign the JWT
   */
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 24 * 7, // 7 days

  /**
   * TELEGRAM
   */
  BOT_TOKEN: process.env.BOT_TOKEN!,
  WHITELISTED_IDS: [251669027, 5567872501],

  /**
   * BINANCE
   */
  BINANCE_API_KEY: process.env.BINANCE_API_KEY!,
  BINANCE_API_SECRET: process.env.BINANCE_API_SECRET!,
};
