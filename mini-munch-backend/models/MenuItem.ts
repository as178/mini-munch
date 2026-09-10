import { Schema, model } from "mongoose";

// interface to define the structure of a menu item document in MongoDB
interface MenuItem {
  name: string;
  description: string;
  price: number;
}

// defined schema for the menu item collection in MongoDB
const menuItemSchema = new Schema<MenuItem>({
  // name is a string value that represents the name of the food within the menu
  name: {
    type: String,
    required: true,
    trim: true,
  },

  // description is a string value that represents the description of the food within the menu
  description: {
    type: String,
    required: true,
    trim: true,
  },

  // price is a number value that represents the price of the food within the menu
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

export const MenuItemModel = model<MenuItem>("MenuItem", menuItemSchema);
