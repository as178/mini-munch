package com.example.mini_munch_android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.mini_munch_android.ui.table.TableInputViewModel
import com.example.mini_munch_android.ui.table.TableInputScreen

// entry to the android app
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val tableInputViewModel: TableInputViewModel = viewModel()
            TableInputScreen(tableInputViewModel)
        }
    }
}