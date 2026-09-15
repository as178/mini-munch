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
      toast.success(`Order marked ${status.toLowerCase()}.`);
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
      toast.success("Order completed and table released.");
    } catch (error: unknown) {
      handleApiError(error, "Failed to complete order.");
    }
  }

  return <p>Staff Dashboard</p>;
}
