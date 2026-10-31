### Mini Munch!

#### A bite-sized, distributed restaurant system. 🍽️🍔

##### Final commit hash (excluding updating the README file with this value + final merge): d7ef46a34301032eeae97d055201c8c6d2545d4a

<hr style="margin: 30px 0;" />

### Software & Tools Required

- **Environment files (for frontend, backend and ws) + local.properties file (Android)**: to extract and/or modify ports, addresses and enable access to the database

- **Terminal**: to run the commands from

- **Git**: to clone the repository

- **Node.js (+ npm)**: to run the system

- **Android Studio**: to run the Android repository and interact with the compiled app

- **Android Debug Bridge (ADB)**: to use physical mobile devices to test the Android app functionalities

<hr style="margin: 30px 0;" />

### Setup & Installation Instructions

1. Clone the repository onto your local machine:

   ```bash
   git clone https://github.com/as178/mini-munch.git
   ```

2. Change to the root Mini Munch directory:

   ```bash
   cd ./mini-munch/
   ```

3. Install the frontend, backend and ws dependencies:

   ```bash
   npm run install-all
   ```

4. From the same terminal (or a new terminal), <a id="backend-instruction"></a> run the backend:

   ```bash
   npm run backend
   ```

5. Open another terminal and run the frontend (in development mode). This will host the frontend on `http://localhost:5173/` (recommended)

   ```bash
   npm run frontend
   ```

   Alternatively, open another terminal and run the frontend (in deployment mode). <a id="frontend-deploy-url"></a> This will host the frontend on `http://localhost:4173/`

   ```bash
   npm run frontend-deploy
   ```

   Either option is appropriate for running the frontend.

6. Open another terminal and run the ws (WebSocket service) repository:

   ```bash
   npm run ws
   ```

7. To run the Android app, open the `mini-munch-android` repository within Android Studio. Ensure that you 'Sync Project with Gradle Files' (icon present in the top right part of the IDE). Afterwards, you may click the play icon at the top of the IDE to 'Assemble App Configuration', running the app onto your chosen device. Depending on whether you are using a physical device or an emulator, the paths defined in `local.properties` should change accordingly. More detailed information on setting up can be [read here](#3-interacting-with-the-android-app-via-android-studio).

<hr style="margin: 30px 0;" />

### Instructions for Testing the Main Functions

The main functions of the program can be tested via the following methods. The second method instructions give more depth and insight into the workflows, capabilities and business rules of the system.

<hr style="margin: 20px 0;" />

### 1. Interacting with Endpoints via Swagger

Open your browser and go to: `http://localhost:5001/api-docs/`

You will be able to see a list of all the available endpoints, representing main functions of the system. Each endpoint provides a description of its purpose, with both input and output fields (and examples where appropriate), as well as a list of potential errors that may occur and their meanings. At the bottom, the database schemas and reference types are also displayed.

Click on any endpoint, and then click the "**Try it out**" button to test main functionalities and error handling by typing in and submitting your own values.

❗❗❗ _> The port `5001` is derived from the backend environment file for ease of configuration. Change the URL port accordingly if you modified the environment file. Update the frontend environment file accordingly. Ensure that you have [rerun the backend](#backend-instruction) (you will see changes applied in `mini-munch-backend/generated-openapi-spec.json`) and regenerated the client API by running the following command from the root Mini Munch directory:_

```bash
npm run frontend-orval
```

Also ensure that the `mini-munch-ws` and `mini-munch-android` repositories have reflected changes within their `.env` and `local.properties` files, as needed, depending on which ports were changed.

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

<hr style="margin: 20px 0;" />

### 3. Interacting with the Android App via Android Studio

As mentioned before, open the `mini-munch-android` repository within Android Studio to easily set-up and test the app. Before trying to interact with the app, ensure that your `mini-munch-android/local.properties` file has the correct SDK path, as well as the appropriate base and ws URLs. These properties should look like the following in the file:

`sdk.dir=X:\path-to-your-SDK
API_BASE_URL="http://x.x.x.x:yyyy"
API_WS_URL="ws://x.x.x.x:zzzz"`

Please also ensure relevant ports remain consistent throughout both this file and other environment variables in the system, to ensure connectivity. You may be required to tune a few more settings in Android Studio depending on your set-up, thus we highly recommend referring to the [Android Studio Guides](https://developer.android.com/studio/intro).

Sync Gradle files and build the project with the tools/buttons provided within Android Studio. Set-up your device using the Device Manager tool and lastly press the Play icon at the top of the IDE once you are ready to compile the app onto your device of choice.

If testing the app via an emulator, ensure that your IP addresses for both of the aforementioned properties are `10.0.2.2`. If testing via physical hardware, connect to your host via cable, enable USB debugging on your device and ensure ADB can recognise it (see [this guide](https://developer.android.com/tools/adb) for getting started with ADB).

The workflow of the app focuses on customer functionality and works seamlessly with the existing backend architecture. Business rules applied are identital to the ones [previously described](#customer-capabilities). Similarly to the web functionalities, customers can occupy tables, pick and modify real-time menu items for their orders, adjust quantities, and view their order status transitions. Additionally, if permission is granted upon opening the app, a notification will be sent when your current order status is changed to "READY". Foreground tracking notifications are also included, to help you ensure your food never goes cold whilst waiting for your order. The app is able to retain local state of currently selected tables and synchronise intuitively with the backend in order to prevent stale UI renderings and a confusing UX. Phone rotations are also supported for increased comfort.

Physical hardware used for successful functional testing included the `Galaxy S22 Ultra, Android Version 14`, whilst Android Studio emulators used included the `Pixel 10a, Android Version 17` and the `Medium Phone, Android Version 17`. These devices and their versions successfully supported the app and are our recommended baseline for testing and using it.

<hr style="margin: 30px 0;" />

### Known Limitations/Unresolved Problems

There is no authentication, thus pages (and APIs) may be accessed freely as described above. Additionally, concurrency and atomic database operations are not handled properly by the backend. Within the frontend, there are no reusable components and little to no separation of HTML, state logic and business checks. In the Android project, there needs to be more thorough and careful evaluation of differing versioning compatibility. WebSockets are also designed to preserve the utilisation of API client-server calls by instructing the clients when to refresh their data, as opposed to carrying everything.
