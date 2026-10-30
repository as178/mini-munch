package com.example.mini_munch_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
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
    val navController = rememberNavController()
    val tableInputViewModel: TableInputViewModel = viewModel()
    val tableInputUiState by tableInputViewModel.uiState.collectAsStateWithLifecycle()

    NavHost(
        navController = navController,
        startDestination = "table-input"
    ) {
        // table input screen
        composable("table-input") {
            LaunchedEffect(
                tableInputUiState.isTableOccupied,
                tableInputUiState.tableNumber
            ) {
                if (tableInputUiState.isTableOccupied) {
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
            val tableNumber =
                backStackEntry.arguments?.getInt("tableNumber") ?: return@composable

            val customerViewModel: CustomerViewModel = viewModel()

            CustomerDashboardScreen(
                tableNumber = tableNumber,
                viewModel = customerViewModel,
                onLeaveTable = {
                    tableInputViewModel.reset()
                    navController.popBackStack()
                }
            )
        }
    }
}