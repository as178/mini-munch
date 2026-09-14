import { api } from "./api";

/**
 * POST /api/orders
 * @returns a success response with the created order document, else returns an error response
 */
export function createOrder(tableNumber: number): Promise<unknown> {
  const response = api.post("/orders", { tableNumber });
  return response;
}

/**
 * GET /api/orders/table/:tableNumber
 * @returns a success response with an order document retrieved by table number (i.e. order for the table), else returns an error response
 */
export function getOrderByTableNumber(tableNumber: number): Promise<unknown> {
  const response = api.get(`/orders/table/${tableNumber}`);
  return response;
}

/**
 * POST /api/orders/:id/items
 * @returns a success response with the updated order document, else returns an error response
 */
export function addOrderItem(
  orderId: string,
  menuItemId: string,
): Promise<unknown> {
  const response = api.post(`/orders/${orderId}/items`, { menuItemId });
  return response;
}

/**
 * PATCH /api/orders/:id/items/:menuItemId
 * @returns a success response with the updated order document, else returns an error response
 */
export function updateOrderItemQuantity(
  orderId: string,
  menuItemId: string,
  quantity: number,
): Promise<unknown> {
  const response = api.patch(`/orders/${orderId}/items/${menuItemId}`, {
    quantity,
  });
  return response;
}

/**
 * DELETE /api/orders/:id/items/:menuItemId
 * @returns a success response with no content, else returns an error response
 */
export function removeOrderItem(
  orderId: string,
  menuItemId: string,
): Promise<unknown> {
  const response = api.delete(`/orders/${orderId}/items/${menuItemId}`);
  return response;
}

/**
 * PATCH /api/orders/:id/status
 * @returns a success response with the updated order document, else returns an error response
 */
export function updateOrderStatus(
  orderId: string,
  status: string, // controller will validate status
): Promise<unknown> {
  const response = api.patch(`/orders/${orderId}/status`, { status });
  return response;
}

/**
 * GET /api/orders
 * @returns a success response with all order documents (excluding DRAFT orders), else returns an error response
 */
export function getOrders(): Promise<unknown> {
  const response = api.get("/orders");
  return response;
}

/**
 * DELETE /api/orders/:id
 * @returns a success response with no content, else returns an error response
 */
export function deleteOrder(orderId: string): Promise<unknown> {
  const response = api.delete(`/orders/${orderId}`);
  return response;
}
