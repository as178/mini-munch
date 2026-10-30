package com.example.mini_munch_android.ui.customer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mini_munch_android.data.CustomerMenuItem
import com.example.mini_munch_android.data.CustomerOrder
import com.example.mini_munch_android.repository.CustomerRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.milliseconds

// represents the ui state for customer screen
data class CustomerUiState(
    val tableNumber: Int? = null,
    val menuItems: List<CustomerMenuItem> = emptyList(),
    val order: CustomerOrder? = null,
    val isLoading: Boolean = false,
    val isActionLoading: Boolean = false,
    val errorMessage: String? = null,
    val hasLeftTable: Boolean = false
)

// handles customer dashboard state and actions
class CustomerViewModel(
    private val repository: CustomerRepository = CustomerRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(CustomerUiState())
    val uiState = _uiState.asStateFlow()

    private var menuPollingJob: Job? = null
    private var orderPollingJob: Job? = null

    // loads the menu and creates or retrieves the table's current order
    fun loadDashboard(tableNumber: Int) {
        if (_uiState.value.isLoading) return

        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    tableNumber = tableNumber, isLoading = true, errorMessage = null
                )
            }

            try {
                val menuItems = repository.getMenu()
                val order = repository.getOrCreateOrder(tableNumber)

                _uiState.update { state ->
                    state.copy(
                        menuItems = menuItems, order = order, isLoading = false, errorMessage = null
                    )
                }
            } catch (exception: CancellationException) {
                throw exception
            } catch (exception: Exception) {
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        errorMessage = exception.message ?: "Unable to load the customer dashboard."
                    )
                }
            }
        }
    }

    // starts refreshing menu and order information while the dashboard is active
    fun startPolling(tableNumber: Int) {
        if (menuPollingJob?.isActive == true) return

        // refresh menu items every 7 seconds
        menuPollingJob = viewModelScope.launch {
            while (isActive) {
                delay(7000.milliseconds)

                try {
                    val menuItems = repository.getMenu()

                    _uiState.update { state ->
                        state.copy(menuItems = menuItems)
                    }
                } catch (exception: CancellationException) {
                    throw exception
                } catch (_: Exception) {
                    // keep the existing menu if a refresh fails
                }
            }
        }

        // refresh table and order status every 5 seconds to detect if table was released or order discarded by staff
        orderPollingJob = viewModelScope.launch {
            while (isActive) {
                delay(5000.milliseconds)

                val currentOrder = _uiState.value.order

                try {
                    val isKickedOff = repository.checkTableStatus(tableNumber, currentOrder?.id)
                    if (isKickedOff) {
                        _uiState.update { state ->
                            state.copy(hasLeftTable = true)
                        }
                        break
                    }

                    if (currentOrder != null && currentOrder.status != "DRAFT") {
                        val order = repository.getOrder(tableNumber)
                        _uiState.update { state ->
                            state.copy(order = order)
                        }
                    }
                } catch (exception: CancellationException) {
                    throw exception
                } catch (_: Exception) {
                    // keep existing order if a refresh fails temporarily
                }
            }
        }
    }

    // stops menu and order polling when the dashboard is no longer active
    fun stopPolling() {
        menuPollingJob?.cancel()
        menuPollingJob = null

        orderPollingJob?.cancel()
        orderPollingJob = null
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

    // submits the current order to the kitchen
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