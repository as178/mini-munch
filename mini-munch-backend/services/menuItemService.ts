import { menuItemServiceErrors } from "../errors/menuItemErrors";
import { MenuItemModel, type MenuItemDocument } from "../models/MenuItem";
import type { ServiceResult } from "./serviceResult";

// defined type for the reasons a menu item service function can fail
export type MenuItemServiceFailureReason =
  (typeof menuItemServiceErrors)[keyof typeof menuItemServiceErrors];

// result of menu item service functions
export type MenuItemServiceResult = ServiceResult<
  MenuItemDocument,
  MenuItemServiceFailureReason
>;

/**
 * retrieves all menu item documents in the menu item collection
 * (database errors are handled by the global error handler middleware)
 * @returns all menu item documents (sorted by name in ascending order; alphabetically)
 */
export async function getAllMenuItems(): Promise<MenuItemDocument[]> {
  return MenuItemModel.find().sort({ name: 1 });
}

/**
 * retrieves a menu item document by its id
 * @param id of the menu item document to retrieve
 * @returns a successful result with the menu item document, or a failure result with a reason
 */
export async function getMenuItemById(
  id: string,
): Promise<MenuItemServiceResult> {
  // find the menu item document in the database by its id
  const menuItem = await MenuItemModel.findById(id);

  // if the menu item does not exist, return a failed result
  if (!menuItem) {
    return {
      success: false,
      serviceError: menuItemServiceErrors.MENU_ITEM_NOT_FOUND,
    };
  }

  // else, return a success result with the found menu item document
  return { success: true, data: menuItem };
}

/**
 * creates a new menu item document
 * @param name of the new menu item being created
 * @param description of the new menu item being created
 * @param price of the new menu item being created
 * @returns a successful result with the created menu item document, or a failure result with a reason
 */
export async function createMenuItem(
  name: string,
  description: string,
  price: number,
): Promise<MenuItemServiceResult> {
  // check if a menu item with the same name already exists in the database
  const existingMenuItem = await MenuItemModel.findOne({ name });

  // if so, return a failed result to indicate that
  // (concurrent requests to create a menu item with the same name will be handled by the unique index constraint in the schema)
  if (existingMenuItem) {
    return {
      success: false,
      serviceError: menuItemServiceErrors.MENU_ITEM_ALREADY_EXISTS,
    };
  }

  // validate the name, description, and price follow business rules
  if (2 > name.length || name.length > 50) {
    return {
      success: false,
      serviceError: menuItemServiceErrors.MENU_ITEM_INVALID_NAME,
    };
  }
  if (5 > description.length || description.length > 150) {
    return {
      success: false,
      serviceError: menuItemServiceErrors.MENU_ITEM_INVALID_DESCRIPTION,
    };
  }
  if (price < 0) {
    return {
      success: false,
      serviceError: menuItemServiceErrors.MENU_ITEM_INVALID_PRICE,
    };
  }

  // else, create a new menu item document with the parameters
  const menuItem = await MenuItemModel.create({
    name,
    description,
    price,
  });

  // return a success result with the created menu item document
  return { success: true, data: menuItem };
}

/**
 * deletes a menu item by its id
 * @param id of the menu item to be deleted
 * @returns a successful result with no content, or a failure result with a reason
 */
export async function deleteMenuItem(
  id: string,
): Promise<ServiceResult<void, MenuItemServiceFailureReason>> {
  // retrieve the menu item document by its id
  const menuItemToBeDeleted = await getMenuItemById(id);

  // if the menu item does not exist, return a failed result with the appropriate reason
  if (!menuItemToBeDeleted.success) {
    return menuItemToBeDeleted;
  }

  // delete the menu item document from the database
  await menuItemToBeDeleted.data.deleteOne();

  // return a success result with no content
  return { success: true, data: undefined };
}
