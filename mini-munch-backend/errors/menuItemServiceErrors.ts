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
