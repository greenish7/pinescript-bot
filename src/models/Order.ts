import { OrderSide } from 'binance';
import { Schema, model, Model } from 'mongoose';

interface IOrder {
  symbol: string;
  side: string;
}
interface OrderModel extends Model<IOrder, {}> {
  build(attrs: IOrder): any;
}
// Creating order schema
const OrderSchema = new Schema<IOrder, OrderModel>(
  {
    symbol: {
      type: String,
      default: '',
    },
    side: {
      type: String,
      default: '',
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);

// Statics
OrderSchema.statics.build = (attrs: IOrder) => {
  return new Order(attrs);
};
// Creating order model
const Order = model<IOrder, OrderModel>('Order', OrderSchema);

export { Order };
