import { useState, type JSX } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { patchApiTablesTableNumberOccupy } from "../services/generated";
import handleApiError from "../utils/errorUtil";

// React page where customers can input their table number to occupy a table and proceed to the customer dashboard
export default function TableInput(): JSX.Element {
  const navigate = useNavigate(); // router navigation hook

  // state variables to store the table number input and loading state
  const [tableNumber, setTableNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // function to send the table number to the backend to occupy the table
  async function handleOccupyTable(): Promise<void> {
    const parsedTableNumber = Number(tableNumber); // parse the table number input to a number

    // set loading state to true while the request is being processed
    setLoading(true);
    try {
      // call the occupyTable service function
      await patchApiTablesTableNumberOccupy(parsedTableNumber);

      // show a success toast notification if the table was occupied successfully
      toast.success(`Table ${parsedTableNumber} occupied!`);

      // move the customer to the dashboard after successfully occupying the table
      navigate(`/customer-dashboard/${parsedTableNumber}`);
    } catch (error: unknown) {
      handleApiError(error, "Failed to occupy the table. Please try again.");
    } finally {
      // reset loading state after the request is complete
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <section className="w-full max-w-xl rounded-lg p-8 inset-shadow-sm inset-shadow-gray-300 bg-gray-50">
        {/* header section with welcome message and instructions */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome to Mini Munch!</h1>

          <p className="mt-2 text-gray-600 text-xl">
            Please enter your table number below.
          </p>
        </div>

        {/* input section for the table number and occupy button */}
        <div className="space-y-4">
          <label htmlFor="table-number" className="block text-md font-medium">
            Table Number:
          </label>

          <input
            type="number"
            value={tableNumber}
            required
            min="1"
            max="20"
            step="1"
            onChange={(event) => setTableNumber(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleOccupyTable(); // call the function when the Enter key is pressed
              }
            }}
            placeholder="Enter table number"
            className="w-full rounded-md border px-4 py-2 outline-none focus:ring-2"
          />

          <button
            type="button"
            onClick={() => void handleOccupyTable()} // ... or when button is clicked
            disabled={loading}
            className="w-full cursor-pointer rounded-md bg-cyan-500 text-white text-xl px-4 py-2 font-medium transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* show button loading text + disable button while the request is being processed */}
            {loading ? "Occupying..." : "Occupy Table"}
          </button>
        </div>
      </section>
    </div>
  );
}
