import express from 'express';
import { createServer } from 'http';
import { schedule } from 'node-cron';
import { connectDB } from './config';
import { configureRoutes } from './routes';
import { configureMiddleware } from './middleware';
import { Order } from './models';
// import { _placeNewOrder } from './controller';

// Connect and get reference to db
let db: any;

(async () => {
  db = await connectDB();
})();

// Init express app
const app = express();

// Config Express middleware
configureMiddleware(app);

// Set-up routes
configureRoutes(app);

// Start server and listen for connections
const httpServer = createServer(app);

httpServer.listen(5000, () => {
  console.info(`Server started on `, httpServer.address(), '\n');
});

// schedule(
//   `*/1 * * * *`,
//   async () => {
//     console.log(`Running task every day at 1 minute`);

//     let orders = await Order.find({});

//     orders.forEach(async (order: any) => {
//       let { symbol, side, createdAt, id } = order;

//       if (Date.now() - new Date(createdAt).getTime() > 30 * 60 * 1000) {
//         let isRecheck = true;
//         _placeNewOrder(side, symbol, isRecheck);
//       } else {
//         console.log(
//           `Deleting order ${id}, ${symbol} because it's older than 30 minutes`
//         );
//         await Order.findByIdAndDelete(id);
//       }
//     });
//   },
//   {
//     scheduled: true,
//     timezone: 'America/New_York',
//   }
// );

// Erorr handling - close server if error
// process.on('uncaughtException', (err) => {
//   db.disconnect();

//   console.error(`Error: ${err.message}`);

//   httpServer.close(() => {
//     process.exit(1);
//   });
// });
