import { Schema, model, type HydratedDocument } from "mongoose";

// interface to define the structure of a table document in MongoDB
export interface Table {
  tableNumber: number;
  available: boolean;
}

// defined type for a table document in MongoDB
export type TableDocument = HydratedDocument<Table>;

// defined schema for the table collection in MongoDB
const tableSchema = new Schema<Table>({
  // tableNumber is a unique number between 1 and 20, representing where the customer is sitting
  tableNumber: {
    type: Number,
    required: [true, "Table number is required."],
    unique: true,
    min: [1, "Table number must be at least 1."],
    max: [20, "Table number must be 20 or less."],
    validate: {
      validator: Number.isInteger,
      message: "Table number must be a whole number.",
    },
  },

  // available is a boolean value that indicates whether the table is available for customers to sit at
  available: {
    type: Boolean,
    required: [true, "Table availability is required."],
    default: true,
  },
});

export const TableModel = model<Table>("Table", tableSchema);
