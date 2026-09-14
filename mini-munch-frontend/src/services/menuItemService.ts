import { api } from "./api";

/**
 * GET /api/menu
 * @returns a success response with all menu item documents, else returns an error response
 */
export function getAllMenuItems(): Promise<unknown> {
  const response = api.get("/menu");
  return response;
}

/**
 * GET /api/menu/:id
 * @returns a success response with a menu item document retrieved by id, else returns an error response
 */
export function getMenuItemById(id: string): Promise<unknown> {
  const response = api.get(`/menu/${id}`);
  return response;
}

/**
 * POST /api/menu
 * @returns a success response with the created menu item document, else returns an error response
 */
export function createMenuItem(
  name: string,
  description: string,
  price: number,
): Promise<unknown> {
  const response = api.post("/menu", { name, description, price });
  return response;
}

/**
 * DELETE /api/menu/:id
 * @returns a success response with no content, else returns an error response
 */
export function deleteMenuItem(id: string): Promise<unknown> {
  const response = api.delete(`/menu/${id}`);
  return response;
}
