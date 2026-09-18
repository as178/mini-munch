### Mini Munch!

#### A bite-sized, distributed restaurant system. 🍽️🍔

<hr style="margin: 30px 0;" />

### Software & Tools Required

- **Environment files (for both frontend and backend)**: to extract and/or modify ports and enable access to the database

- **Terminal**: to run the commands from

- **Node.js (+ npm)**: to run the program

<hr style="margin: 30px 0;" />

### Setup & Installation Instructions

1. Open a terminal and change to the root Mini Munch directory:

   ```bash
   cd ./mini-munch/
   ```

2. Install the frontend and backend dependencies:

   ```bash
   npm run install-all
   ```

3. From the same terminal (or a new terminal), <a id="backend-instruction"></a> run the backend:

   ```bash
   npm run backend
   ```

4. Open another terminal and run the frontend (in development mode). This will host the frontend on `http://localhost:5173/`

   ```bash
   npm run frontend
   ```

   Alternatively, open another terminal and run the frontend (in deployment mode). <a id="frontend-deploy-url"></a> This will host the frontend on `http://localhost:4173/`

   ```bash
   npm run frontend-deploy
   ```

   Either option is appropriate for running the frontend.

<hr style="margin: 30px 0;" />

### Instructions for Testing the Main Functions

The main functions of the program can be tested via either of the following methods. The second method instructions give more depth and insight into the workflows, capabilities and business rules of the system.

<hr style="margin: 20px 0;" />

### 1. Interacting with Endpoints via Swagger

Open your browser and go to: `http://localhost:5001/api-docs/`

You will be able to see a list of all the available endpoints, representing main functions of the system. Each endpoint provides a description of its purpose, with both input and output fields (and examples where appropriate), as well as a list of potential errors that may occur and their meanings. At the bottom, the database schemas and reference types are also displayed.

Click on any endpoint, and then click the "**Try it out**" button to test main functionalities and error handling by typing in and submitting your own values.

❗❗❗ _> The port `5001` is derived from the backend environment file for ease of configuration. Change the URL port accordingly if you modified the environment file. Update the frontend environment file accordingly. Ensure that you have [rerun the backend](#backend-instruction) (you will see changes applied in `mini-munch-backend/generated-openapi-spec.json`) and regenerated the client API by running the following command from the root Mini Munch directory:_

```bash
npm run frontend-orval
```

<hr style="margin: 20px 0;" />

### 2. Interacting with Pages via Browser

❗❗❗ _> These instructions assume you are running the frontend in development mode (if running in deployment mode, simply change the URL as [previously described](#frontend-deploy-url))._

Open your browser and go to: `http://localhost:5173/table-input`

Open another tab on your browser and go to: `http://localhost:5173/staff-dashboard`

For the best experience, keep both of the tabs open next to each other.

#### Customer Capabilities:

- You may occupy tables 1-20 (table 17 intentionally doesn't exist to demonstrate error handling). In doing so, you will create a DRAFT status order for that table.
- You may add or remove order items from the menu, and adjust their quantity accordingly. Menu items can only be added once per order, and the quantity must be between 1-10.
- Menu items that have been deleted from the menu in real time may remain in your order, but cannot be readded if you delete them.
- You may submit your order for the staff to prepare, however once an order is submitted you may not leave the table or change the contents of the order.
- If your order status is DRAFT or READY, you may leave your table.
- If a staff member discards your order, your table will be released and you will be taken back to `/table-input`.

#### Staff Capabilities:

- You may add new menu items or delete current ones.
- When adding new menu items, they must meet the following validation criteria:
  - Name: must be between 2-50 characters
  - Description: must be between 5-150 characters
  - Price: must be greater than or equal to 0
- You may view and change the status of incoming orders from customers. Discarding the order and releasing the table (last possible status change) will take the customer back to the `/table-input` page.

#### Role-less Capabilities:

- At any point you may try to access the following pages through the URL:
  - `http://localhost:5173/table-input` - can be accessed at any time
  - `http://localhost:5173/staff-dashboard` - can be accessed at any time
  - `http://localhost:5173/customer-dashboard/x` where **x** is the table number; can only be accessed if the corresponding table is occupied

  Other invalid URLs (e.g. `http://localhost:5173/xyz`) will redirect you to the `/table-input` page.

<hr style="margin: 30px 0;" />

### Known Limitations/Unresolved Problems

There is no authentication, thus pages may be accessed freely as described above. Additionally, concurrency and atomic database operations are not handled properly by the backend.
