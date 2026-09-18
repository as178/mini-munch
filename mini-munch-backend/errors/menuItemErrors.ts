import type { MenuItemServiceFailureReason } from "../services/menuItemService";

// defined service failure reasons and messages for menu item service functions
export const menuItemServiceErrors = {
  MENU_ITEM_NOT_FOUND: {
    reason: "MENU_ITEM_NOT_FOUND",
    message: "Menu item does not exist.",
  },
  MENU_ITEM_ALREADY_EXISTS: {
    reason: "MENU_ITEM_ALREADY_EXISTS",
    message: "Menu item already exists.",
  },
  MENU_ITEM_INVALID_NAME: {
    reason: "MENU_ITEM_INVALID_NAME",
    message:
      "Menu item name is required, must be unique and between 2 and 50 characters.",
  },
  MENU_ITEM_INVALID_DESCRIPTION: {
    reason: "MENU_ITEM_INVALID_DESCRIPTION",
    message:
      "Menu item description is required and must be between 5 and 150 characters.",
  },
  MENU_ITEM_INVALID_PRICE: {
    reason: "MENU_ITEM_INVALID_PRICE",
    message:
      "Menu item price is required and must be greater than or equal to $0.",
  },
} as const;

// defined mapping of menu item service failure reasons to HTTP status codes
export const menuItemHttpErrorResponses: Record<
  MenuItemServiceFailureReason["reason"],
  { statusCode: number }
> = {
  MENU_ITEM_NOT_FOUND: { statusCode: 404 },
  MENU_ITEM_ALREADY_EXISTS: { statusCode: 409 },
  MENU_ITEM_INVALID_NAME: { statusCode: 400 },
  MENU_ITEM_INVALID_DESCRIPTION: { statusCode: 400 },
  MENU_ITEM_INVALID_PRICE: { statusCode: 400 },
};
