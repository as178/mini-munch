package com.example.mini_munch_android.ui.customer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.mini_munch_android.data.CustomerMenuItem
import com.example.mini_munch_android.data.CustomerOrder
import com.example.mini_munch_android.data.CustomerOrderItem
import com.example.mini_munch_android.ui.theme.MunchBlue
import com.example.mini_munch_android.ui.theme.MunchDarkerGrayBlue
import com.example.mini_munch_android.ui.theme.MunchGrayBlue
import com.example.mini_munch_android.ui.theme.MunchRed
import com.example.mini_munch_android.ui.theme.MunchTurquoise
import com.example.mini_munch_android.utility.NotificationHelper.showOrderReadyNotification
import com.example.mini_munch_android.utility.TableSessionManager.getLastNotifiedOrderId
import com.example.mini_munch_android.utility.TableSessionManager.setLastNotifiedOrderId
import java.util.Locale

// customer dashboard page, forwarding customer actions to the viewmodel
@Composable
fun CustomerDashboardScreen(
    tableNumber: Int,
    viewModel: CustomerViewModel,
    onLeaveTable: () -> Unit
) {
    // context for notifications
    val context = LocalContext.current

    // collect ui state from viewmodel
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    // derive order status from ui state
    val orderStatus = uiState.order?.status

    // trigger notification when order status becomes ready using shared preferences as single source of truth
    LaunchedEffect(orderStatus, uiState.order?.id) {
        val orderId = uiState.order?.id
        if (orderStatus == "READY" && orderId != null) {
            // ensure to update the last notified order id in shared preferences
            val lastNotifiedId = getLastNotifiedOrderId(context)
            if (lastNotifiedId != orderId) {
                setLastNotifiedOrderId(context, orderId)
                showOrderReadyNotification(context, tableNumber)
            }
        }
    }

    // load dashboard information when the screen is opened
    LaunchedEffect(tableNumber) {
        viewModel.loadDashboard(tableNumber)
    }

    // start/stop real-time websocket listener when the screen is active/not active
    DisposableEffect(tableNumber) {
        viewModel.startWebSocketListener(tableNumber)
        onDispose {
            viewModel.stopWebSocketListener()
        }
    }

    // return to table input after successfully leaving the table
    LaunchedEffect(uiState.hasLeftTable) {
        if (uiState.hasLeftTable) {
            onLeaveTable()
        }
    }

    // displaying the dashboard; loading is indicated, otherwise the dashboard is shown
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (uiState.isLoading) {
            Spacer(modifier = Modifier.weight(1f))
            CircularProgressIndicator(color = MunchBlue)
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Loading . . .",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MunchGrayBlue
            )
            Spacer(modifier = Modifier.weight(1f))
        } else {
            // lazy column to adapt to differing list sizes and dynamically render content
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // page header; app title, table number and leave table button
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Mini Munch",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = MunchBlue
                            )

                            Text(
                                text = "Table $tableNumber",
                                style = MaterialTheme.typography.titleMedium,
                                color = MunchDarkerGrayBlue
                            )
                        }

                        Button(
                            onClick = viewModel::leaveTable,
                            enabled = !uiState.isActionLoading && (uiState.order?.status == "DRAFT" || uiState.order?.status == "READY"),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.error,
                                contentColor = Color.White,
                                disabledContainerColor = MunchGrayBlue,
                                disabledContentColor = MunchDarkerGrayBlue
                            )
                        ) {
                            Text(text = "Leave Table", fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // display api errors so the customer stays informed
                uiState.errorMessage?.let { errorMessage ->
                    item {
                        Text(
                            text = errorMessage,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                // menu section; title and formatted list of menu items
                item {
                    Text(
                        text = "Menu",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MunchBlue
                    )
                }

                if (uiState.menuItems.isEmpty()) {
                    item {
                        Text(
                            text = "There are currently no menu items available.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MunchDarkerGrayBlue
                        )
                    }
                } else {
                    items(
                        items = uiState.menuItems, key = { item -> item.id }) { item ->
                        MenuItemCard(
                            item = item,
                            enabled = uiState.order?.status == "DRAFT" && !uiState.isActionLoading,
                            onAdd = { viewModel.addItem(item) }
                        )
                    }
                }

                // current order section; list of order items and total
                item {
                    Text(
                        text = "Current Order",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MunchBlue
                    )
                }

                // handle if there are no current order items or the order does not exist
                val order = uiState.order
                if (order == null || order.items.isEmpty()) {
                    item {
                        Text(
                            text = "Your order is currently empty.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = MunchDarkerGrayBlue
                        )
                    }
                } else {
                    // display formatted list of order items
                    items(
                        items = order.items,
                        key = { item -> "order_${item.menuItemId}" }
                    ) { item ->
                        // card to handle order item manipulation and safe handling
                        OrderItemCard(
                            item = item,
                            enabled = order.status == "DRAFT" && !uiState.isActionLoading,
                            onRemove = {
                                viewModel.removeItem(item.menuItemId)
                            },
                            onDecrease = {
                                viewModel.updateItemQuantity(
                                    item.menuItemId, item.quantity - 1
                                )
                            },
                            onIncrease = {
                                viewModel.updateItemQuantity(
                                    item.menuItemId, item.quantity + 1
                                )
                            })
                    }

                    // order total section
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = formatPrice(order.total),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // order status section; status and submit button
                if (order != null) {
                    item {
                        OrderStatusCard(
                            order = order,
                            isActionLoading = uiState.isActionLoading,
                            onSubmit = viewModel::submitOrder
                        )
                    }
                }
            }
        }
    }
}

// menu item card component; displays an individual menu item and its add button
@Composable
private fun MenuItemCard(
    item: CustomerMenuItem,
    enabled: Boolean,
    onAdd: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MunchDarkerGrayBlue
                )
                Text(
                    text = formatPrice(item.price),
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Button(
                onClick = onAdd,
                enabled = enabled,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MunchTurquoise,
                    contentColor = Color.White,
                    disabledContainerColor = MunchGrayBlue,
                    disabledContentColor = MunchDarkerGrayBlue
                )
            ) {
                Text(text = "Add", fontWeight = FontWeight.Bold)
            }
        }
    }
}

// order item card component; displays an individual order item and its quantity controls
@Composable
private fun OrderItemCard(
    item: CustomerOrderItem,
    enabled: Boolean,
    onRemove: () -> Unit,
    onDecrease: () -> Unit,
    onIncrease: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${formatPrice(item.price)} each",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                Button(
                    onClick = onRemove,
                    enabled = enabled,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MunchRed,
                        contentColor = Color.White,
                        disabledContainerColor = MunchGrayBlue,
                        disabledContentColor = MunchDarkerGrayBlue
                    )
                ) {
                    Text(text = "Remove", fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = onDecrease,
                    enabled = enabled && item.quantity > 1,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MunchBlue,
                        contentColor = Color.White,
                        disabledContainerColor = MunchGrayBlue,
                        disabledContentColor = MunchDarkerGrayBlue
                    )
                ) {
                    Text(text = "-", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }

                Text(
                    text = item.quantity.toString(),
                    modifier = Modifier.padding(horizontal = 20.dp),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Button(
                    onClick = onIncrease,
                    enabled = enabled && item.quantity < 10,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MunchBlue,
                        contentColor = Color.White,
                        disabledContainerColor = MunchGrayBlue,
                        disabledContentColor = MunchDarkerGrayBlue
                    )
                ) {
                    Text(text = "+", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// displays the current order status and submit button
@Composable
private fun OrderStatusCard(
    order: CustomerOrder,
    isActionLoading: Boolean,
    onSubmit: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Order Status",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MunchBlue
            )
            Text(
                text = order.status,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MunchBlue
            )

            Button(
                onClick = onSubmit,
                modifier = Modifier.fillMaxWidth(),
                enabled = order.status == "DRAFT" && order.items.isNotEmpty() && !isActionLoading,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MunchBlue,
                    contentColor = Color.White,
                    disabledContainerColor = MunchGrayBlue,
                    disabledContentColor = MunchDarkerGrayBlue
                )
            )
            // dynamic text shown depending on loading state and order status
            {
                Text(
                    text = if (isActionLoading) {
                        "Please wait"
                    } else {
                        "Submit Order"
                    },
                    fontWeight = FontWeight.Bold
                )
            }
            if (order.status == "READY") {
                Text(
                    text = "Your order is ready for pickup, please leave the table when finished.",
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Medium,
                    color = MunchBlue
                )
            }
        }
    }
}

// function to format prices consistently to two decimal places
private fun formatPrice(price: java.math.BigDecimal): String =
    "$" + String.format(Locale.US, "%.2f", price)