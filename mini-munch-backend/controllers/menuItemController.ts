import type { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/errorMiddleware";
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  type MenuItemServiceFailureReason,
} from "../services/menuItemService";
import {
  parseFiniteNumber,
  parseObjectId,
  parseRequiredString,
} from "../utils/validation";

// defined mapping of menu item service failure reasons to HTTP status codes and error messages
const menuItemFailureResponses: Record<
  MenuItemServiceFailureReason,
  { statusCode: number; message: (name?: string) => string }
> = {
  MENU_ITEM_NOT_FOUND: {
    statusCode: 404,
    message: () => "Menu item does not exist.",
  },
  MENU_ITEM_ALREADY_EXISTS: {
    statusCode: 409,
    message: (name) => `${name ?? "Menu item"} already exists on the menu.`,
  },
};

/**
 * creates an AppError for a menu item service failure
 * @param reason the menu item service failure reason
 * @param name of the menu item associated with the failure
 * @returns an AppError with the corresponding HTTP status code, failure reason, and error message
 */
function createMenuItemServiceError(
  reason: MenuItemServiceFailureReason,
  name?: string,
): AppError {
  // retrieve the corresponding HTTP status code and error message for the failure reason
  const response = menuItemFailureResponses[reason];
  // create and return an AppError for the controller to pass to the global error middleware
  return new AppError(response.statusCode, reason, response.message(name));
}

/**
 * GET /api/menu
 * @returns a success response with all menu item documents, else returns an error response
 */
export async function getAllMenuItemsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // retrieve all menu item documents from the database
    const menuItems = await getAllMenuItems();
    res.status(200).json({ menuItems });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * GET /api/menu/:id
 * @returns a success response with a menu item document retrieved by id, else returns an error response
 */
export async function getMenuItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the menu item id from the request parameter and return an error if it is not a valid ObjectId
  const id = parseObjectId(req.params.id);
  if (id instanceof AppError) {
    next(id);
    return;
  }

  // else, call the menu item service to retrieve the menu item document by id
  try {
    const menuItemServiceResult = await getMenuItemById(id);

    // handle menu item service failure by passing an AppError to the global error middleware
    if (!menuItemServiceResult.success) {
      next(createMenuItemServiceError(menuItemServiceResult.reason));
      return;
    }

    res.status(200).json({ menuItem: menuItemServiceResult.menuItem });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * POST /api/menu
 * @returns a success response with the created menu item document, else returns an error response
 */
export async function createMenuItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse and validate the request body for required fields (name, description, price)
  const body = req.body as Record<string, unknown>;
  const name = parseRequiredString(body.name, "Name");
  if (name instanceof AppError) {
    next(name);
    return;
  }

  const description = parseRequiredString(body.description, "Description");
  if (description instanceof AppError) {
    next(description);
    return;
  }

  const price = parseFiniteNumber(body.price, "Price");
  if (price instanceof AppError) {
    next(price);
    return;
  }

  // call the menu item service to create a new menu item document
  try {
    const menuItemServiceResult = await createMenuItem(
      name,
      description,
      price,
    );

    // handle menu item service failure by passing an AppError to the global error middleware
    if (!menuItemServiceResult.success) {
      next(createMenuItemServiceError(menuItemServiceResult.reason, name));
      return;
    }

    res.status(201).json({ menuItem: menuItemServiceResult.menuItem });

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * DELETE /api/menu/:id
 * @returns a success response with no content, else returns an error response
 */
export async function deleteMenuItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // parse the menu item id from the request parameter and return an error if it is not a valid ObjectId
  const id = parseObjectId(req.params.id);
  if (id instanceof AppError) {
    next(id);
    return;
  }

  // call the menu item service to delete the menu item document by id
  try {
    const menuItemServiceResult = await deleteMenuItem(id);

    // handle menu item service failure by passing an AppError to the global error middleware
    if (!menuItemServiceResult.success) {
      next(createMenuItemServiceError(menuItemServiceResult.reason));
      return;
    }

    res.status(204).send();

    // catch any unexpected errors and pass them to the global error middleware
  } catch (error: unknown) {
    next(error);
  }
}
