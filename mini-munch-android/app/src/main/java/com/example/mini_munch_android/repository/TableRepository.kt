package com.example.mini_munch_android.repository

import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.data.Table
import com.example.mini_munch_android.generated_services.apis.TablesApi
import com.example.mini_munch_android.utility.apiCall

// handles communication with the table api
class TableRepository {

    // generated api client configured with the backend url
    private val tablesApi = TablesApi(
        basePath = BuildConfig.API_BASE_URL
    )

    // function to occupy a table and return updated table from backend
    suspend fun occupyTable(tableNumber: Int): Table = apiCall("Unable to occupy the table.") {
        // if successful, return updated table
        val response = tablesApi.apiTablesTableNumberOccupyPatch(tableNumber)

        Table(
            tableNumber = response.table.tableNumber,
            available = response.table.available
        )
    }
}