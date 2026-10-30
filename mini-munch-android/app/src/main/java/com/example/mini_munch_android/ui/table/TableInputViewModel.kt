package com.example.mini_munch_android.ui.table

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.mini_munch_android.repository.TableRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// represents the ui state for table input screen
data class TableInputUiState(
    val tableNumber: String = "",       // current text entered for table number
    val isLoading: Boolean = false,     // whether network request is in progress
    val isTableOccupied: Boolean = false, // whether table successfully occupied
    val errorMessage: String? = null    // error message to display if any
)

// viewmodel managing table input state and network actions
class TableInputViewModel(
    private val repository: TableRepository = TableRepository()
) : ViewModel() {

    // mutable state flow holding current ui state
    private val _uiState = MutableStateFlow(TableInputUiState())

    // read-only state flow exposed to the ui
    val uiState = _uiState.asStateFlow()

    // updates table number when user types
    fun onTableNumberChange(newTableNumber: String) {
        if (!_uiState.value.isLoading && newTableNumber.all { char -> char.isDigit() }) {
            _uiState.update { currentState ->
                currentState.copy(
                    tableNumber = newTableNumber, isTableOccupied = false, errorMessage = null
                )
            }
        }
    }

    // requests backend to occupy selected table number
    fun occupyTable() {
        val currentState = _uiState.value
        val tableNumber = currentState.tableNumber.toIntOrNull()

        // do nothing if already loading
        if (currentState.isLoading) return

        // validate table number range
        if (tableNumber == null || tableNumber !in 1..20) {
            _uiState.update { state ->
                state.copy(errorMessage = "Enter a table number from 1 to 20.")
            }
            return
        }

        // launch coroutine to perform network request
        viewModelScope.launch {
            // set loading state to true and clear previous errors
            _uiState.update { state ->
                state.copy(isLoading = true, errorMessage = null)
            }

            try {
                // call repository to occupy table
                val table = repository.occupyTable(tableNumber)

                // update state based on response availability
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        isTableOccupied = !table.available,
                        errorMessage = if (table.available) {
                            "The table was not occupied. Please try again."
                        } else {
                            null
                        }
                    )
                }
            } catch (exception: CancellationException) {
                throw exception
            } catch (exception: Exception) {
                // handle network or server errors
                _uiState.update { state ->
                    state.copy(
                        isLoading = false,
                        errorMessage = exception.message
                            ?: "Unable to connect to the server. Please try again."
                    )
                }
            }
        }
    }

    // resets table input state when returning from the customer dashboard
    fun reset() {
        _uiState.value = TableInputUiState()
    }
}