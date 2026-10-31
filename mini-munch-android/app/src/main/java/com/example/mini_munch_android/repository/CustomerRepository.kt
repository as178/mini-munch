package com.example.mini_munch_android.repository

import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.data.CustomerMenuItem
import com.example.mini_munch_android.data.CustomerOrder
import com.example.mini_munch_android.data.CustomerOrderItem
import com.example.mini_munch_android.data.Table
import com.example.mini_munch_android.generated_services.apis.MenuItemsApi
import com.example.mini_munch_android.generated_services.apis.OrdersApi
import com.example.mini_munch_android.generated_services.apis.TablesApi
import com.example.mini_munch_android.generated_services.infrastructure.ClientException
import com.example.mini_munch_android.generated_services.models.ApiOrdersIdItemsMenuItemIdPatchRequest
import com.example.mini_munch_android.generated_services.models.ApiOrdersIdItemsPostRequest
import com.example.mini_munch_android.generated_services.models.ApiOrdersIdStatusPatchRequest
import com.example.mini_munch_android.generated_services.models.ApiOrdersPostRequest
import com.example.mini_munch_android.generated_services.models.Order
import com.example.mini_munch_android.utility.apiCall
import com.example.mini_munch_android.utility.getErrorCode

// handles communication with the customer menu, order, and table apis
class CustomerRepository {

    // generated api clients configured with the backend url
    private val menuApi = MenuItemsApi(
        basePath = BuildConfig.API_BASE_URL
    )

    private val ordersApi = OrdersApi(
        basePath = BuildConfig.API_BASE_URL
    )

    private val tablesApi = TablesApi(
        basePath = BuildConfig.API_BASE_URL
    )

    // retrieves menu items from backend
    suspend fun getMenu(): List<CustomerMenuItem> = apiCall {
        menuApi.apiMenuGet().menuItems.map { item ->
            CustomerMenuItem(
                id = item.id,
                name = item.name,
                description = item.description,
                price = item.price
            )
        }
    }

    // creates a draft order or retrieves the existing order for the table
    suspend fun getOrCreateOrder(tableNumber: Int): CustomerOrder = apiCall {
        try {
            val response = ordersApi.apiOrdersPost(
                ApiOrdersPostRequest(tableNumber = tableNumber)
            )

            response.order.toCustomerOrder()
        } catch (exception: ClientException) {
            if (getErrorCode(exception) == "ORDER_ALREADY_EXISTS") {
                ordersApi.apiOrdersTableTableNumberGet(tableNumber).order.toCustomerOrder()
            } else {
                throw exception
            }
        }
    }

    // retrieves the current order for a table
    suspend fun getOrder(tableNumber: Int): CustomerOrder = apiCall {
        ordersApi.apiOrdersTableTableNumberGet(tableNumber).order.toCustomerOrder()
    }

    // adds a menu item to the current order
    suspend fun addItem(
        orderId: String,
        menuItemId: String
    ): CustomerOrder = apiCall {
        ordersApi.apiOrdersIdItemsPost(
            id = orderId,
            apiOrdersIdItemsPostRequest = ApiOrdersIdItemsPostRequest(
                menuItemId = menuItemId
            )
        ).order.toCustomerOrder()
    }

    // updates the quantity of an item in the current order
    suspend fun updateItemQuantity(
        orderId: String,
        menuItemId: String,
        quantity: Int
    ): CustomerOrder = apiCall {
        ordersApi.apiOrdersIdItemsMenuItemIdPatch(
            id = orderId,
            menuItemId = menuItemId,
            apiOrdersIdItemsMenuItemIdPatchRequest = ApiOrdersIdItemsMenuItemIdPatchRequest(
                quantity = quantity
            )
        ).order.toCustomerOrder()
    }

    // removes a menu item from the current order
    suspend fun removeItem(
        orderId: String,
        menuItemId: String,
        tableNumber: Int
    ): CustomerOrder = apiCall {
        ordersApi.apiOrdersIdItemsMenuItemIdDelete(
            id = orderId,
            menuItemId = menuItemId
        )

        ordersApi.apiOrdersTableTableNumberGet(tableNumber).order.toCustomerOrder()
    }

    // submits the current order to the kitchen
    suspend fun submitOrder(orderId: String): CustomerOrder = apiCall {
        ordersApi.apiOrdersIdStatusPatch(
            id = orderId,
            apiOrdersIdStatusPatchRequest = ApiOrdersIdStatusPatchRequest(
                status = ApiOrdersIdStatusPatchRequest.Status.SUBMITTED
            )
        ).order.toCustomerOrder()
    }

    // deletes the current order and releases the table
    suspend fun leaveTable(
        orderId: String,
        tableNumber: Int
    ) {
        apiCall {
            ordersApi.apiOrdersIdDelete(orderId)
            tablesApi.apiTablesTableNumberReleasePatch(tableNumber)
        }
    }

    // retrieves table information
    suspend fun getTable(tableNumber: Int): Table = apiCall {
        val response = tablesApi.apiTablesTableNumberGet(tableNumber)
        Table(
            tableNumber = response.table.tableNumber,
            available = response.table.available
        )
    }

    // checks if the table has been released or the order has been discarded by staff
    suspend fun checkTableStatus(tableNumber: Int, orderId: String?): Boolean {
        return try {
            val table = getTable(tableNumber)
            if (table.available) return true

            // double-check; calling this may trigger an error if order does not exist, thus returning true for table availability
            if (orderId != null) {
                getOrder(tableNumber)
            }
            false
        } catch (exception: Exception) {
            val errorCode = getErrorCode(exception)
            if (errorCode == "ORDER_NOT_FOUND" || exception.message?.contains("404") == true) {
                return true
            }
            false
        }
    }
}

// converts a generated api order into the app's own order model
private fun Order.toCustomerOrder(): CustomerOrder = CustomerOrder(
    id = id,
    tableNumber = table.tableNumber,
    items = items.map { item ->
        CustomerOrderItem(
            menuItemId = item.menuItem,
            name = item.name,
            price = item.price,
            quantity = item.quantity
        )
    },
    total = total,
    status = status.value
)