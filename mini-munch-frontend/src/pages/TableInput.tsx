import type { JSX } from "react";
import { api } from "../services/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export default function TableInput(): JSX.Element {
  async function testTableRequest(): Promise<void> {
    try {
      const response = await api.get("/tables/17");

      console.log("Table response:", response.data);
      toast.success(
        `Table ${response.data.table.tableNumber} is available: ${response.data.table.available}`,
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error("Table request failed:", error.response?.data);
        toast.error(
          `${error.response?.data.code}
          ${error.response?.data.message}`,
        );
      }
    }
  }

  return (
    <div>
      <p>Table Input</p>

      <button onClick={() => void testTableRequest()}>Test Table 5</button>
    </div>
  );
}
