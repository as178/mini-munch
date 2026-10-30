package com.example.mini_munch_android.data

import java.math.BigDecimal

// customer dashboard information that the client app will utilise
data class CustomerMenuItem(
    val id: String,
    val name: String,
    val description: String,
    val price: BigDecimal
)

data class CustomerOrderItem(
    val menuItemId: String,
    val name: String,
    val price: BigDecimal,
    val quantity: Int
)

data class CustomerOrder(
    val id: String,
    val tableNumber: Int,
    val items: List<CustomerOrderItem>,
    val total: BigDecimal,
    val status: String
)