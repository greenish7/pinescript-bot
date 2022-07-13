import { connect } from 'mongoose';
import { config } from './config';

export const connectDB = async () => {
  console.log(`- - -`.repeat(10));
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    };
    const db = await connect(config.MONGO_URI, options);
    console.log('Connected to MongoDb :) ✅\n');
    console.log(`- - -`.repeat(10));
    return db;
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};
