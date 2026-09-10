import { Schema, model, Types } from "mongoose";

// defined type for the status of an order
type OrderStatus = "SUBMITTED" | "PREPARING" | "READY";

// interface to define the structure of an order item document in MongoDB
interface OrderItem {
  menuItem: Types.ObjectId; // reference to the MenuItem collection in MongoDB
  name: string;
  price: number;
  quantity: number;
}

// interface to define the structure of an order document in MongoDB
interface Order {
  tableNumber: Types.ObjectId; // reference to the Table collection in MongoDB
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

// defined schema for the order item collection in MongoDB
const orderItemSchema = new Schema<OrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

// defined schema for the order collection in MongoDB
const orderSchema = new Schema<Order>({
  // tableNumber is a reference to the Table collection in MongoDB
  tableNumber: {
    type: Types.ObjectId,
    ref: "Table",
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items: OrderItem[]) => items.length > 0,
      message: "Order must contain at least one item",
    },
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["SUBMITTED", "PREPARING", "READY", "COMPLETED"],
    default: "SUBMITTED",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OrderModel = model<Order>("Order", orderSchema);
