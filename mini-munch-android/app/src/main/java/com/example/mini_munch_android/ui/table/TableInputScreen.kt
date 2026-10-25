package com.example.mini_munch_android.ui.table

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mini_munch_android.ui.theme.MunchBlue

// table input page
@Composable
fun TableEntryScreen() {
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
            fontSize = 16.sp
        )
        Spacer(modifier = Modifier.height(32.dp))
    }
}