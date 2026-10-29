package com.example.mini_munch_android.ui.table

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

// table input viewmodel to manage the table input screen state and actions
class TableEntryViewModel : ViewModel() {

    // the table number entered by the customer
    var tableNumber by mutableStateOf("")
        private set

    // true if the table has been occupied
    var isTableOccupied by mutableStateOf(false)
        private set

    // update the table number when the customer types
    fun onTableNumberChange(newTableNumber: String) {
        // only allow numeric input, and prevent changes after occupation
        if (!isTableOccupied && newTableNumber.all { inputChar -> inputChar.isDigit() }) {
            tableNumber = newTableNumber
        }
    }

    // only occupy the table if a number has been entered
    fun occupyTable() {
        if (tableNumber.isNotBlank() && !isTableOccupied) {
            isTableOccupied = true
        }
    }
}
