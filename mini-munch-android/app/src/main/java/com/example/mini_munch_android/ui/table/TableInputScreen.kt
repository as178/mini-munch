package com.example.mini_munch_android.ui.table

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.mini_munch_android.ui.theme.MunchBlue
import com.example.mini_munch_android.ui.theme.MunchDarkerGrayBlue
import com.example.mini_munch_android.ui.theme.MunchGrayBlue

// table input page, forwarding customer actions to the viewmodel for handling
@Composable
fun TableInputScreen(viewModel: TableInputViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // welcome message
        Text(
            text = "Welcome to Mini Munch!",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MunchBlue
        )
        Spacer(modifier = Modifier.height(16.dp))

        // instructions for customer
        Text(
            text = "Please enter your table number below.",
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(32.dp))

        // only allows numeric input and becomes disabled after occupation
        OutlinedTextField(
            value = uiState.tableNumber,
            onValueChange = viewModel::onTableNumberChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Table Number") },
            placeholder = { Text("Enter table number") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number
            ),
            enabled = !uiState.isTableOccupied && !uiState.isLoading
        )

        // display api errors so customer stays informed
        uiState.errorMessage?.let { errorMessage ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorMessage,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium
            )
        }
        Spacer(modifier = Modifier.height(24.dp))

        // button, prevents duplicate requests while the api call is running
        Button(
            onClick = viewModel::occupyTable,
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState.tableNumber.isNotBlank() && !uiState.isTableOccupied && !uiState.isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = MunchBlue,
                contentColor = Color.White,
                disabledContainerColor = MunchGrayBlue,
                disabledContentColor = MunchDarkerGrayBlue
            )
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.height(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = if (uiState.isTableOccupied) {
                        "Table Occupied"
                    } else {
                        "Occupy Table"
                    },
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
