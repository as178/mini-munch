import { Schema, model, type HydratedDocument } from "mongoose";

// interface to define the structure of a menu item document in MongoDB
interface MenuItem {
  name: string;
  description: string;
  price: number;
}

// defined type for a menu item document in MongoDB
export type MenuItemDocument = HydratedDocument<MenuItem>;

// defined schema for the menu item collection in MongoDB
const menuItemSchema = new Schema<MenuItem>({
  // name is a string value that represents the name of the food within the menu
  name: {
    type: String,
    required: [true, "Menu item name is required."],
    trim: true,
    unique: [true, "Menu item name must be unique."],
    minlength: [2, "Menu item name must be at least 2 characters."],
    maxlength: [50, "Menu item name cannot exceed 50 characters."],
  },

  // description is a string value that represents the description of the food within the menu
  description: {
    type: String,
    required: [true, "Menu item description is required."],
    trim: true,
    minlength: [5, "Menu item description must be at least 5 characters."],
    maxlength: [150, "Menu item description cannot exceed 150 characters."],
  },

  // price is a number value that represents the price of the food within the menu
  price: {
    type: Number,
    required: [true, "Menu item price is required."],
    min: [0, "Menu item price must be greater than or equal to $0."],
  },
});

export const MenuItemModel = model<MenuItem>("MenuItem", menuItemSchema);
