import { Schema, model, Types } from "mongoose";

// defined type for the status of an order
export const ORDER_STATUSES = ["SUBMITTED", "PREPARING", "READY"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// interface to define the structure of an order item embedded document
interface OrderItem {
  menuItem: Types.ObjectId; // reference to the MenuItem document in MongoDB
  name: string;
  price: number;
  quantity: number; // quantity of the menu item ordered
}

// interface to define the structure of an order document in MongoDB
interface Order {
  tableNumber: Types.ObjectId; // reference to the Table document in MongoDB
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

// defined schema for an order item embedded document
const orderItemSchema = new Schema<OrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId, // reference to the MenuItem document in MongoDB
      ref: "MenuItem",
      required: [true, "Menu item is required."],
    },

    // included snapshots of the menu item name and price at the time of order creation
    name: {
      type: String,
      required: [true, "Menu item name is required."],
      trim: true,
      minlength: [2, "Menu item name must be at least 2 characters."],
      maxlength: [50, "Menu item name cannot exceed 50 characters."],
    },

    price: {
      type: Number,
      required: [true, "Menu item price is required."],
      min: [0, "Price must be greater than or equal to $0."],
    },

    // quantity is a number value that represents the quantity of the menu item ordered
    quantity: {
      type: Number,
      required: [true, "Quantity is required."],
      min: [1, "Quantity must be at least 1."],
      max: [10, "Quantity cannot exceed 10."],
    },
  },

  // no automatic generation of _id for embedded documents, since orders are retrieved as a whole and not individually
  { _id: false },
);

// defined schema for the order collection in MongoDB
const orderSchema = new Schema<Order>({
  tableNumber: {
    type: Schema.Types.ObjectId, // reference to the Table document in MongoDB
    ref: "Table",
    required: [true, "Table is required."],
  },

  // items is a list of all order items
  items: {
    type: [orderItemSchema],
    required: [true, "Order items are required."],
    validate: {
      validator: (items: OrderItem[]) => items.length > 0,
      message: "Order must contain at least one item.",
    },
  },

  // total is a number value that represents the total price of the order
  total: {
    type: Number,
    required: true,
    min: [0, "Total cannot be negative."],
  },

  // status is a string value that represents the current status of the order
  status: {
    type: String,
    enum: {
      values: ORDER_STATUSES,
      message: "Status must be SUBMITTED, PREPARING, or READY.",
    },
    default: "SUBMITTED", // default status when an order is created
    required: true,
  },

  // createdAt is a date value that represents the time when the order was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OrderModel = model<Order>("Order", orderSchema);
