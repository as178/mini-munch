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
} as const;

// defined mapping of menu item service failure reasons to HTTP status codes
export const menuItemHttpErrorResponses: Record<
  MenuItemServiceFailureReason["reason"],
  { statusCode: number }
> = {
  MENU_ITEM_NOT_FOUND: { statusCode: 404 },
  MENU_ITEM_ALREADY_EXISTS: { statusCode: 409 },
};
