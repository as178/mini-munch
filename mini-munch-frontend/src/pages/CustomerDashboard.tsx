import { useEffect, useRef, useState, type JSX } from "react";
import { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import type {
  MenuItem,
  Order,
} from "../services/generated/generatedApi.schemas";
import {
  deleteApiOrdersId,
  deleteApiOrdersIdItemsMenuItemId,
  getApiMenu,
  getApiOrdersTableTableNumber,
  patchApiOrdersIdItemsMenuItemId,
  patchApiOrdersIdStatus,
  patchApiTablesTableNumberRelease,
  postApiOrders,
  postApiOrdersIdItems,
} from "../services/generated";
import handleApiError from "../utils/errorUtil";

// React page where customers can view the menu, create and manage their order, and submit it
export default function CustomerDashboard(): JSX.Element {
  const navigate = useNavigate(); // router navigation hook

  // retrieve the table number from the url parameters and parse it to a number
  const { tableNumber } = useParams();
  const parsedTableNumber = Number(tableNumber);

  // state variables for menu items, current order, and loading state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // load menu items and the customer's current order when the page is first loaded
  const hasLoaded = useRef(false);
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    void loadCustomerDashboard();
  }, [tableNumber]);

  // poll the current order every 5 seconds so the customer sees status changes
  useEffect(() => {
    // if there is no order or the order is in DRAFT status, do not poll
    if (!order || order.status === "DRAFT") return;
    const interval = setInterval(() => {
      void refreshOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [tableNumber, order]);

  /**
   * helper function to load the menu items
   * + the customer's existing order (or create a DRAFT status order otherwise)
   */
  async function loadCustomerDashboard(): Promise<void> {
    try {
      setLoading(true);

      // retrieve all menu items
      const getMenuResponse = await getApiMenu();
      setMenuItems(getMenuResponse.menuItems);

      // create a DRAFT status order
      try {
        const postOrderResponse = await postApiOrders({
          tableNumber: parsedTableNumber,
        });
        setOrder(postOrderResponse.order);
      } catch (error: unknown) {
        // if an order already exists, retrieve the existing order
        if (
          error instanceof AxiosError &&
          error.response?.data?.code === "ORDER_ALREADY_EXISTS"
        ) {
          const getOrderResponse =
            await getApiOrdersTableTableNumber(parsedTableNumber);
          setOrder(getOrderResponse.order);
        } else {
          throw error;
        }
      }
      // catch any errors and set loading state to false after the data is loaded
    } catch (error: unknown) {
      handleApiError(error, "Failed to load customer data. Please try again.");

      // if the error is not a server error, navigate back to the table input page
      if (error instanceof AxiosError && error.response?.status !== 500) {
        navigate("/table-input", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  /**
   * helper function to refresh the current order without changing the menu
   */
  async function refreshOrder(): Promise<void> {
    try {
      const getOrderResponse =
        await getApiOrdersTableTableNumber(parsedTableNumber);
      setOrder(getOrderResponse.order);
    } catch (error: unknown) {
      if (
        error instanceof AxiosError &&
        error.response?.data?.code === "ORDER_NOT_FOUND"
      ) {
        // if the old "table session" is over, navigate back to the table input page
        toast.success(
          "Your table session has ended. To create a new order, please enter an available table number again.",
        );
        navigate("/table-input", { replace: true });
      }
      handleApiError(error, "Failed to refresh order. Please try again.");
    }
  }

  /**
   * helper function to add a menu item to the customer's order
   * (if there is no existing order, the function will return early)
   */
  async function handleAddItem(menuItemId: string): Promise<void> {
    if (!order) return;
    try {
      const addOrderItemResponse = await postApiOrdersIdItems(order._id, {
        menuItemId: menuItemId,
      });
      setOrder(addOrderItemResponse.order);
    } catch (error: unknown) {
      handleApiError(error, "Failed to add item to order. Please try again.");
    }
  }

  /**
   * helper function to alter the quantity of an order item
   * (if there is no existing order, the function will return early)
   */
  async function handleUpdateQuantity(
    menuItemId: string,
    quantity: number,
  ): Promise<void> {
    if (!order) return;
    try {
      const updateQuantityResponse = await patchApiOrdersIdItemsMenuItemId(
        order._id,
        menuItemId,
        { quantity: quantity },
      );
      setOrder(updateQuantityResponse.order);
    } catch (error: unknown) {
      handleApiError(
        error,
        "Failed to update item quantity. Please try again.",
      );
    }
  }

  /**
   * helper function to delete a menu item from the order completely
   * (if there is no existing order, the function will return early)
   */
  async function handleDeleteItem(menuItemId: string): Promise<void> {
    if (!order) return;
    try {
      await deleteApiOrdersIdItemsMenuItemId(order._id, menuItemId);
      // retrieve the updated order (+ total re-calculated) after deleting the item
      await refreshOrder();
    } catch (error: unknown) {
      handleApiError(
        error,
        "Failed to remove item from order. Please try again.",
      );
    }
  }

  /**
   * helper function to submit the DRAFT status order
   * (if there is no existing order, the function will return early)
   */
  async function handleSubmitOrder(): Promise<void> {
    if (!order) return;
    try {
      const updateStatusResponse = await patchApiOrdersIdStatus(order._id, {
        status: "SUBMITTED",
      });
      setOrder(updateStatusResponse.order);
      toast.success("Order submitted! Please wait for your order to be ready.");
    } catch (error: unknown) {
      handleApiError(error, "Failed to submit order. Please try again.");
    }
  }

  /**
   * helper function to delete delete the customer's READY status order, release the table, and return to the table input page
   * (if there is no existing order, the function will return early)
   */
  async function handleLeaveTable(): Promise<void> {
    try {
      if (!order) return;
      await deleteApiOrdersId(order._id);
      await patchApiTablesTableNumberRelease(parsedTableNumber);
      toast.success("Thank you for dining with Mini Munch!");
      navigate("/table-input");
    } catch (error: unknown) {
      handleApiError(error, "Failed to leave table. Please try again.");
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
      <section className="w-full max-w-4xl space-y-8 rounded-lg p-8 inset-shadow-sm inset-shadow-gray-300 bg-gray-50">
        {/* page header; app title, table number and leave table button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mini Munch</h1>

            <p className="mt-1 text-xl text-gray-600">
              Table {parsedTableNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLeaveTable()}
            disabled={order?.status !== "READY"} // disable the button if the order is not in READY status
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white text-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Leave Table
          </button>
        </div>

        {/* menu section; title + formatted list of all menu items */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Menu</h2>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-md p-4 bg-white shadow-md transition hover:shadow-lg"
              >
                {/* menu item details section; name, description and price + add button */}
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-gray-600 font-medium">
                    {item.description}
                  </p>
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleAddItem(item._id)}
                  disabled={order?.status !== "DRAFT"} // disable the button if the order is not in DRAFT status
                  className="cursor-pointer rounded-md bg-emerald-400 px-6 py-2 text-white text-md font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* current order section; list of all order items + action buttons, total and order status */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Current Order</h2>

          {order && order.items.length > 0 ? (
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.menuItem}
                  className="rounded-md p-4 bg-white shadow-md transition hover:shadow-lg"
                >
                  {/* order item details section; name and price + remove button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="font-medium ">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleDeleteItem(item.menuItem)}
                      disabled={order.status !== "DRAFT"}
                      className="cursor-pointer rounded-md bg-red-400 px-6 py-2 text-white text-md font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>

                  {/* order item quantity section; decrement button, current quantity and increment button */}
                  <div className="mt-3 flex items-center gap-3 border-t border-gray-300 pt-4">
                    <button
                      type="button"
                      disabled={order.status !== "DRAFT" || item.quantity === 1} // disable button if status is not DRAFT or quantity is 1 (cannot go below 1)
                      onClick={() =>
                        void handleUpdateQuantity(
                          item.menuItem,
                          item.quantity - 1,
                        )
                      }
                      className="cursor-pointer rounded px-4 py-1 bg-violet-200 text-violet-900 text-lg font-bold hover:bg-violet-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      -
                    </button>

                    <span className="text-lg font-medium">{item.quantity}</span>

                    <button
                      type="button"
                      disabled={
                        order.status !== "DRAFT" || item.quantity === 10 // disable button if status is not DRAFT or quantity is 10 (cannot go above 10)
                      }
                      onClick={() =>
                        void handleUpdateQuantity(
                          item.menuItem,
                          item.quantity + 1,
                        )
                      }
                      className="cursor-pointer rounded px-3 py-1 bg-violet-200 text-violet-900 text-lg font-bold hover:bg-violet-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* order total section; total price of all order items */}
              <div className="flex justify-between pt-4 text-2xl font-bold">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            // message to display if the order is empty (no items added yet)
            <p className="text-xl text-gray-600">
              Your order is currently empty.
            </p>
          )}
        </div>

        {/* order status section; order status + submit button */}
        {order && (
          <div className="space-y-4 rounded-md p-4 bg-white shadow-md transition hover:shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Status</h2>

              <span className="rounded bg-cyan-100 px-3 py-1 font-bold bg-cyan-700 text-white text-xl shadow-sm">
                {order.status}
              </span>
            </div>

            <button
              type="button"
              disabled={order.status !== "DRAFT" || order.items.length === 0} // disable button if status is not DRAFT or order is empty
              onClick={() => void handleSubmitOrder()}
              className="cursor-pointer w-full rounded-md bg-cyan-500 px-4 py-2 text-white text-md font-medium hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Order
            </button>

            {/* message to display if the order is in READY status */}
            {order.status === "READY" && (
              <p className="flex items-center justify-center font-medium text-cyan-600 text-lg">
                Your order is ready for pickup, please leave the table when
                finished.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
