package com.example.mini_munch_android.repository

import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.data.Table
import com.example.mini_munch_android.generated_services.apis.TablesApi
import com.example.mini_munch_android.generated_services.infrastructure.ClientError
import com.example.mini_munch_android.generated_services.infrastructure.ClientException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

// handles communication with the table api
class TableRepository {

    // generated api client configured with the backend url
    private val tablesApi = TablesApi(basePath = BuildConfig.API_BASE_URL)

    // function to occupy a table and return updated table from backend
    suspend fun occupyTable(tableNumber: Int): Table = withContext(Dispatchers.IO) {
        try {
            // if successful, return updated table
            val response = tablesApi.apiTablesTableNumberOccupyPatch(tableNumber)
            Table(
                tableNumber = response.table.tableNumber,
                available = response.table.available
            )
        } catch (exception: ClientException) {
            // extract and throw error messages from backend
            val errorBody =
                exception.response?.let { response -> response as? ClientError<*> }?.body as? String

            val errorMessage = try {
                errorBody?.let { body ->
                    JSONObject(body).optString("message").takeIf { message ->
                        message.isNotBlank()
                    }
                }
            } catch (_: Exception) {
                null
            }

            // provide fallback error message if not available
            throw Exception(
                errorMessage ?: exception.message ?: "Unable to occupy the table."
            )
        }
    }
}
