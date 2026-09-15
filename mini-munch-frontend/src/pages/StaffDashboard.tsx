import { useEffect, useRef, useState, type JSX } from "react";
import { toast } from "react-hot-toast";
import type {
  MenuItem,
  Order,
  OrderStatus,
} from "../services/generated/generatedApi.schemas";
import {
  deleteApiMenuId,
  deleteApiOrdersId,
  getApiMenu,
  getApiOrders,
  patchApiOrdersIdStatus,
  patchApiTablesTableNumberRelease,
  postApiMenu,
} from "../services/generated";
import handleApiError from "../utils/errorUtil";

// React page for staff to manage menu items and current orders
export default function StaffDashboard(): JSX.Element {
  // state variables for menu items, current orders and loading state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // state variables for the add menu item form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // load menu items and current orders when the page is first loaded
  const hasLoaded = useRef(false);
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    void loadStaffDashboard();
  }, []);

  // poll current orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const getAllOrdersResponse = await getApiOrders();
        setOrders(getAllOrdersResponse.orders);
      } catch (error: unknown) {
        handleApiError(error, "Failed to refresh orders.");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * helper function to load the menu items and current orders
   */
  async function loadStaffDashboard(): Promise<void> {
    try {
      setLoading(true);
      // retrieve menu items and current orders + update state variables
      const [getMenuResponse, getAllOrdersResponse] = await Promise.all([
        getApiMenu(),
        getApiOrders(),
      ]);
      setMenuItems(getMenuResponse.menuItems);
      setOrders(getAllOrdersResponse.orders);
    } catch (error: unknown) {
      // catch any errors and set loading state to false after the data is loaded
      handleApiError(
        error,
        "Failed to load staff dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * helper function to create a new menu item
   */
  async function handleCreateMenuItem(): Promise<void> {
    try {
      const createMenuItemResponse = await postApiMenu({
        name,
        description,
        price: Number(price),
      });

      // update the menu items state variable with the newly created menu item
      setMenuItems((previousMenuItems) => [
        ...previousMenuItems,
        createMenuItemResponse.menuItem,
      ]);

      // clear the form + show success toast notification
      setName("");
      setDescription("");
      setPrice("");
      toast.success("Menu item successfully added!");
    } catch (error: unknown) {
      handleApiError(error, "Failed to create menu item.");
    }
  }

  /**
   * helper function to delete a menu item
   */
  async function handleDeleteMenuItem(menuItemId: string): Promise<void> {
    try {
      await deleteApiMenuId(menuItemId);
      // update the menu items state variable + show success toast notification
      setMenuItems((previousMenuItems) =>
        previousMenuItems.filter((item) => item._id !== menuItemId),
      );
      toast.success("Menu item deleted successfully!");
    } catch (error: unknown) {
      handleApiError(error, "Failed to delete menu item.");
    }
  }

  /**
   * helper function to update an order status
   */
  async function handleUpdateStatus(
    orderId: string,
    status: Exclude<OrderStatus, "DRAFT">,
  ): Promise<void> {
    try {
      const updateStatusResponse = await patchApiOrdersIdStatus(orderId, {
        status,
      });

      // update the modified order locally + show success toast notification
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? updateStatusResponse.order : order,
        ),
      );
      toast.success(`Order status updated to: ${status}`);
    } catch (error: unknown) {
      handleApiError(error, "Failed to update order status.");
    }
  }

  /**
   * helper function to delete a READY status order and release the corresponding table
   */
  async function handleDeleteOrder(order: Order): Promise<void> {
    try {
      await deleteApiOrdersId(order._id);
      await patchApiTablesTableNumberRelease(order.table.tableNumber);
      // remove the order locally + show success toast notification
      setOrders((previousOrders) =>
        previousOrders.filter(
          (existingOrder) => existingOrder._id !== order._id,
        ),
      );
      toast.success("Order discarded and table released.");
    } catch (error: unknown) {
      handleApiError(error, "Failed to discard order and/or release table.");
    }
  }

  /**
   * helper function to determine the next valid order status and the corresponding button label
   */
  function getNextStatusAction(status: OrderStatus): {
    status: Exclude<OrderStatus, "DRAFT">;
    label: string;
  } | null {
    switch (status) {
      case "SUBMITTED":
        return {
          status: "PREPARING",
          label: "Prepare Order",
        };

      case "PREPARING":
        return {
          status: "READY",
          label: "Mark Order as Ready",
        };

      default:
        return null;
    }
  }

  // if the page is still loading, show a loading message
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-3xl font-bold">Loading . . .</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center px-6 py-10">
      <section className="w-full max-w-4xl space-y-8 rounded-lg bg-gray-50 p-8 inset-shadow-sm inset-shadow-gray-300">
        {/* page header; app title and dashboard name */}
        <div>
          <h1 className="text-3xl font-bold">Mini Munch</h1>
          <p className="mt-1 text-xl text-gray-600">Staff Dashboard</p>
        </div>

        {/* menu management section; add new menu items + display current menu */}
        <div>
          {/* add menu item form */}
          <form
            onSubmit={(event) => {
              event.preventDefault(); // prevent the default form submission behavior
              void handleCreateMenuItem();
            }}
            className="mb-6 space-y-3 rounded-md bg-white p-4 shadow-md"
          >
            <h3 className="text-2xl font-bold">Add New Menu Item</h3>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              required
              minLength={2}
              maxLength={50}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              required
              minLength={5}
              maxLength={150}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />

            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Price"
              required
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />

            <button
              type="submit"
              className="cursor-pointer rounded-md bg-emerald-400 px-6 py-2 text-md font-medium text-white hover:bg-emerald-600"
            >
              Add Menu Item
            </button>
          </form>

          {/* current menu; list of all menu items + delete buttons */}
          <div className="space-y-3">
            <h2 className="mb-4 text-2xl font-bold">Current Menu Items</h2>
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-md bg-white p-4 gap-4 shadow-md transition hover:shadow-lg"
              >
                {/* menu item details section; name, description and price + delete button */}
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="font-medium text-gray-600">
                    {item.description}
                  </p>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteMenuItem(item._id)}
                  className="cursor-pointer rounded-md bg-red-400 px-6 py-2 text-md font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* incoming orders section; display all current staff orders */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Incoming Orders</h2>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                // determine the next valid order status and the corresponding button label
                const statusAction = getNextStatusAction(order.status);
                return (
                  <div
                    key={order._id}
                    className="rounded-md bg-white p-5 shadow-md transition hover:shadow-lg"
                  >
                    {/* order header; table number + order status */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">
                          Table {order.table.tableNumber}
                        </h3>
                      </div>
                      <span className="rounded bg-cyan-700 px-3 py-1 text-xl font-bold text-white shadow-sm">
                        {order.status}
                      </span>
                    </div>

                    {/* order items; display all items in the order */}
                    <div className="mt-4 space-y-2 border-t border-gray-300 pt-4">
                      {order.items.map((item) => (
                        <div
                          key={item.menuItem}
                          className="flex justify-between"
                        >
                          <span className="font-medium">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* order total */}
                    <div className="mt-4 flex justify-between border-t border-gray-300 pt-4 text-xl font-bold">
                      <span>Total</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>

                    {/* order actions; change status or delete the order + release table */}
                    <div className="mt-4">
                      {statusAction && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleUpdateStatus(
                              order._id,
                              statusAction.status,
                            )
                          }
                          className="w-full cursor-pointer rounded-md bg-cyan-500 px-4 py-2 text-md font-medium text-white hover:bg-cyan-700"
                        >
                          {statusAction.label}
                        </button>
                      )}
                      {order.status === "READY" && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteOrder(order)}
                          className="w-full cursor-pointer rounded-md bg-red-500 px-4 py-2 text-md font-medium text-white hover:bg-red-700"
                        >
                          Discard Order & Release Table
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // message to display if there are no incoming orders
            <p className="text-xl text-gray-600">
              There are currently no incoming orders.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
