package com.example.mini_munch_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.mini_munch_android.utility.TableSessionManager.clearTableNumber
import com.example.mini_munch_android.utility.TableSessionManager.getTableNumber
import com.example.mini_munch_android.utility.TableSessionManager.saveTableNumber
import com.example.mini_munch_android.ui.customer.CustomerDashboardScreen
import com.example.mini_munch_android.ui.customer.CustomerViewModel
import com.example.mini_munch_android.ui.table.TableInputViewModel
import com.example.mini_munch_android.ui.table.TableInputScreen

// entry to the android app
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MiniMunchApp()
        }
    }
}

// handles navigation between the table input and customer dashboard screens
@Composable
fun MiniMunchApp() {
    val context = LocalContext.current
    val savedTableNumber = remember { getTableNumber(context) }
    val navController = rememberNavController()
    val tableInputViewModel: TableInputViewModel = viewModel()
    val tableInputUiState by tableInputViewModel.uiState.collectAsStateWithLifecycle()
    val startDestination = if (savedTableNumber != null) {
        "customer-dashboard/$savedTableNumber"
    } else {
        "table-input"
    }

    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // table input screen
        composable("table-input") {
            LaunchedEffect(
                tableInputUiState.isTableOccupied,
                tableInputUiState.tableNumber
            ) {
                if (tableInputUiState.isTableOccupied) {
                    // handle navigation to customer dashboard and persist valid table number into session
                    val tableNum = tableInputUiState.tableNumber.toIntOrNull()
                    if (tableNum != null) {
                        saveTableNumber(context, tableNum)
                    }
                    navController.navigate(
                        "customer-dashboard/${tableInputUiState.tableNumber}"
                    )
                }
            }

            TableInputScreen(tableInputViewModel)
        }

        // customer dashboard screen
        composable(
            route = "customer-dashboard/{tableNumber}",
            arguments = listOf(
                navArgument("tableNumber") {
                    type = NavType.IntType
                }
            )
        ) { backStackEntry ->
            // retrieve table number from route
            val tableNumber = backStackEntry.arguments?.getInt("tableNumber")
            if (tableNumber == null) {
                // stop composition of the screen as a safeguard and navigate to table input if argument is missing (reset)
                LaunchedEffect(Unit) {
                    clearTableNumber(context)
                    navController.navigate("table-input") {
                        popUpTo(0) { inclusive = true }
                    }
                }
                return@composable
            }

            // save session whenever viewing dashboard
            LaunchedEffect(tableNumber) {
                saveTableNumber(context, tableNumber)
            }

            // else, load the customer dashboard screen
            val customerViewModel: CustomerViewModel = viewModel()
            CustomerDashboardScreen(
                tableNumber = tableNumber,
                viewModel = customerViewModel,
                onLeaveTable = {
                    clearTableNumber(context)
                    tableInputViewModel.reset()
                    navController.navigate("table-input") {
                        popUpTo("customer-dashboard/{tableNumber}") { inclusive = true }
                    }
                }
            )
        }
    }
}