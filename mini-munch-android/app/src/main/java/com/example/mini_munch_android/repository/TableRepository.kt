package com.example.mini_munch_android.repository

import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.data.Table
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

// handles communication with the table api
class TableRepository {
    // shared HTTP client
    private val client = OkHttpClient()

    // base URL derived from build config
    private val baseUrl = BuildConfig.API_BASE_URL

    // function to occupy a table and return updated table from the backend
    suspend fun occupyTable(tableNumber: Int): Table = withContext(Dispatchers.IO) {
        val requestBody = "{}".toRequestBody(
            "application/json".toMediaType()
        )

        val request =
            Request.Builder()
                .url("$baseUrl/api/tables/$tableNumber/occupy")
                .patch(requestBody)
                .build()

        client.newCall(request).execute().use { response ->
            val responseBody = response.body.string()

            // display error from backend or a fallback message
            if (!response.isSuccessful) {
                val errorMessage = try {
                    JSONObject(responseBody).optString(
                        "message", "Unable to occupy the table."
                    )
                } catch (_: Exception) {
                    "Unable to occupy the table."
                }

                throw IOException(errorMessage)
            }

            // else, retrieve and return the updated table
            val tableJson = JSONObject(responseBody).getJSONObject("table")
            Table(
                tableNumber = tableJson.getInt("tableNumber"),
                available = tableJson.getBoolean("available")
            )
        }
    }
}
