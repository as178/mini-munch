package com.example.mini_munch_android.ui.customer

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.data.CustomerMenuItem
import com.example.mini_munch_android.data.CustomerOrder
import com.example.mini_munch_android.repository.CustomerRepository
import com.example.mini_munch_android.repository.TableWebSocketManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.seconds

// represents the ui state for customer screen
data class CustomerUiState(
    val tableNumber: Int? = null,                       // current table number for this customer session
    val menuItems: List<CustomerMenuItem> = emptyList(), // available menu items fetched from backend
    val order: CustomerOrder? = null,                   // current customer order details and status
    val isLoading: Boolean = false,                     // whether initial screen data loading is in progress
    val isActionLoading: Boolean = false,               // whether a specific order button action is in progress
    val errorMessage: String? = null,                   // error message to display to customer if any
    val hasLeftTable: Boolean = false                   // whether customer has left table or table was released
)

// handles customer dashboard state and actions
class CustomerViewModel(
    private val repository: CustomerRepository = CustomerRepository(),
    private val webSocketManager: TableWebSocketManager = TableWebSocketManager()
) : ViewModel() {

    // mutable state flow holding current ui state
    private val _uiState = MutableStateFlow(CustomerUiState())

    // read-only state flow exposed to the ui
    val uiState = _uiState.asStateFlow()

    // websocket job to receive real-time menu and order events
    private var webSocketJob: Job? = null

    // loads the menu and creates or retrieves the table's current order
    fun loadDashboard(tableNumber: Int) {
        if (_uiState.value.isLoading) return

        // launch coroutine to update ui and perform network request
        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    tableNumber = tableNumber,
                    isLoading = true,
                    errorMessage = null
                )
            }

            // retrieve menu items and current order
            try {
                val menuItems = repository.getMenu()
                val order = repository.getOrCreateOrder(tableNumber)

                _uiState.update { state ->
                    state.copy(
                        menuItems = menuItems,
                        order = order, isLoading = false,
                        errorMessage = null
                    )
                }
            } catch (exception: CancellationException) {
                throw exception
            } catch (exception: Exception) {
                Log.e("CustomerViewModel", "Failed to load customer dashboard for table $tableNumber", exception)
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        errorMessage = exception.message ?: "Unable to load the customer dashboard."
                    )
                }
            }
        }
    }

    // starts listening for real-time menu and order websocket updates while the dashboard is active with automatic reconnection
    fun startWebSocketListener(tableNumber: Int) {
        if (webSocketJob?.isActive == true) return

        webSocketJob = viewModelScope.launch {
            while (isActive) {
                try {
                    webSocketManager.observeTableEvents(BuildConfig.API_WS_URL, tableNumber)
                        .collect { payload ->
                            // handle incoming websocket messages
                            when (payload.type) {
                                "menu" -> {
                                    // retrieve updated menu items and update ui
                                    try {
                                        val menuItems = repository.getMenu()
                                        _uiState.update { state ->
                                            state.copy(menuItems = menuItems)
                                        }
                                    } catch (e: Exception) {
                                        Log.w("CustomerViewModel", "Failed to refresh menu items from websocket event", e)
                                    }
                                }
                                "order" -> {
                                    // retrieve updated order and update ui
                                    val currentOrder = _uiState.value.order
                                    try {
                                        // check if staff has discarded the order and the customer is "kicked off"
                                        val isKickedOff = repository.checkTableStatus(tableNumber, currentOrder?.id)
                                        if (isKickedOff) {
                                            _uiState.update { state ->
                                                state.copy(hasLeftTable = true)
                                            }
                                        } else if (currentOrder != null) {
                                            // else, retrieve updated order and update ui
                                            val order = repository.getOrder(tableNumber)
                                            _uiState.update { state ->
                                                state.copy(order = order)
                                            }
                                        }
                                    } catch (e: Exception) {
                                        Log.w("CustomerViewModel", "Failed to refresh order from websocket event", e)
                                    }
                                }
                            }
                        }
                } catch (exception: CancellationException) {
                    throw exception
                } catch (exception: Exception) {
                    Log.w("CustomerViewModel", "WebSocket connection lost or failed. Reconnecting in 3 seconds...", exception)
                    delay(3.seconds) // wait 3 seconds before attempting reconnection
                }
            }
        }
    }

    // stops websocket listener when the dashboard is no longer active
    fun stopWebSocketListener() {
        webSocketJob?.cancel()
        webSocketJob = null
    }

    // adds a menu item to the current order
    fun addItem(menuItem: CustomerMenuItem) {
        updateOrder { order ->
            repository.addItem(order.id, menuItem.id)
        }
    }

    // changes the quantity of an item in the current order
    fun updateItemQuantity(
        menuItemId: String, quantity: Int
    ) {
        if (quantity <= 0) {
            removeItem(menuItemId)
            return
        }

        updateOrder { currentOrder ->
            repository.updateItemQuantity(
                currentOrder.id, menuItemId, quantity
            )
        }
    }

    // removes a menu item from the current order
    fun removeItem(menuItemId: String) {
        updateOrder { order ->
            repository.removeItem(
                orderId = order.id, menuItemId = menuItemId, tableNumber = order.tableNumber
            )
        }
    }

    // submits the current order to staff
    fun submitOrder() {
        updateOrder { order ->
            repository.submitOrder(order.id)
        }
    }

    // deletes the current order and releases the table
    fun leaveTable() {
        val currentState = _uiState.value
        val order = currentState.order ?: return
        val tableNumber = currentState.tableNumber ?: return

        if (currentState.isActionLoading) return

        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    isActionLoading = true, errorMessage = null
                )
            }

            try {
                repository.leaveTable(order.id, tableNumber)

                _uiState.update { state ->
                    state.copy(
                        isActionLoading = false, hasLeftTable = true
                    )
                }
            } catch (exception: CancellationException) {
                throw exception
            } catch (exception: Exception) {
                Log.e("CustomerViewModel", "Failed to leave table", exception)
                _uiState.update { state ->
                    state.copy(
                        isActionLoading = false,
                        errorMessage = exception.message ?: "Unable to leave the table."
                    )
                }
            }
        }
    }

    // performs an order action and updates the current order
    private fun updateOrder(
        action: suspend (CustomerOrder) -> CustomerOrder
    ) {
        val currentOrder = _uiState.value.order ?: return

        if (_uiState.value.isActionLoading) return

        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    isActionLoading = true, errorMessage = null
                )
            }

            try {
                val updatedOrder = action(currentOrder)

                _uiState.update { state ->
                    state.copy(
                        order = updatedOrder, isActionLoading = false
                    )
                }
            } catch (exception: CancellationException) {
                throw exception
            } catch (exception: Exception) {
                Log.e("CustomerViewModel", "Failed to update order", exception)
                _uiState.update { state ->
                    state.copy(
                        isActionLoading = false,
                        errorMessage = exception.message ?: "Unable to update your order."
                    )
                }
            }
        }
    }
}