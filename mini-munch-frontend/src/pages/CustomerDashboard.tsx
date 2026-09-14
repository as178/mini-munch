import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import type {
  MenuItem,
  Order,
} from "../services/generated/generatedApi.schemas";
import {
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

  // retrieve the table number from the url
  const { tableNumber } = useParams();

  // throw an notification error if it is missing + return
  // (router will navigate to the table input page)
  if (!tableNumber) {
    toast.error("Table number is missing from the URL!");
    return <></>;
  }

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
    const interval = setInterval(() => {
      void refreshOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [tableNumber]);

  /**
   * helper function to load the menu items
   * + the customer's existing order (or create a DRAFT status order otherwise)
   */
  async function loadCustomerDashboard(): Promise<void> {
    try {
      setLoading(true);

      // retrieve all menu items
      const menuResponse = await getApiMenu();
      setMenuItems(menuResponse.menuItems);

      // create a DRAFT status order
      try {
        const postOrderResponse = await postApiOrders({
          tableNumber: Number(tableNumber),
        });
        setOrder(postOrderResponse.order);
      } catch (error: unknown) {
        // if an order already exists, retrieve the existing order
        if (
          error instanceof AxiosError &&
          error.response?.data?.code === "ORDER_ALREADY_EXISTS"
        ) {
          const getOrderResponse = await getApiOrdersTableTableNumber(
            Number(tableNumber),
          );
          setOrder(getOrderResponse.order);
        } else {
          throw error;
        }
      }
      // catch any errors and set loading state to false after the data is loaded
    } catch (error: unknown) {
      handleApiError(error, "Failed to load customer data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * helper function to refresh the current order without changing the menu
   */
  async function refreshOrder(): Promise<void> {
    try {
      const getOrderResponse = await getApiOrdersTableTableNumber(
        Number(tableNumber),
      );
      setOrder(getOrderResponse.order);
    } catch (error: unknown) {
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
   * helper function to remove a menu item from the order completely
   */
  async function handleRemoveItem(menuItemId: string): Promise<void> {
    if (!order) return;
    try {
      await deleteApiOrdersIdItemsMenuItemId(order._id, menuItemId);

      // the delete endpoint returns 204, so retrieve the updated order
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
   */
  async function handleSubmitOrder(): Promise<void> {
    if (!order) return;
    try {
      const updateStatusResponse = await patchApiOrdersIdStatus(order._id, {
        status: "SUBMITTED",
      });
      setOrder(updateStatusResponse.order);
      toast.success(
        "Order submitted! Please wait for your order to be prepared.",
      );
    } catch (error: unknown) {
      handleApiError(error, "Failed to submit order. Please try again.");
    }
  }

  /**
   * helper function to release the customer's table, delete their order, and return to the welcome page
   */
  async function handleLeaveTable(): Promise<void> {
    try {
      await patchApiTablesTableNumberRelease(Number(tableNumber));
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
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return <p>Customer Dashboard</p>;
}
