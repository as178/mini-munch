import { Schema, model } from "mongoose";

// interface to define the structure of a table document in MongoDB
interface Table {
  tableNumber: number;
  available: boolean;
}

// defined schema for the table collection in MongoDB
const tableSchema = new Schema<Table>({
  // tableNumber is a unique number between 1 and 20, representing where the customer is sitting
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 20,
  },

  // available is a boolean value that indicates whether the table is available for customers to sit at
  available: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export const TableModel = model<Table>("Table", tableSchema);
