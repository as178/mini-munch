package com.example.mini_munch_android.repository

import android.util.Log
import com.example.mini_munch_android.generated_services.infrastructure.ClientError
import com.example.mini_munch_android.generated_services.infrastructure.ClientException
import com.example.mini_munch_android.generated_services.infrastructure.ServerError
import com.example.mini_munch_android.generated_services.infrastructure.ServerException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

// runs generated api requests away from the main thread and handles errors
internal suspend fun <T> apiCall(
    fallbackMessage: String = "Something went wrong. Please try again.", request: () -> T
): T = withContext(Dispatchers.IO) {
    try {
        request()
    } catch (exception: CancellationException) {
        throw exception
    } catch (exception: Exception) {
        Log.e("ApiHelper", "API request failed", exception)
        throw Exception(
            getErrorMessage(exception) ?: exception.message ?: fallbackMessage, exception
        )
    }
}

// extracts the backend error code from an api exception
internal fun getErrorCode(exception: Exception): String? {
    val errorBody = getErrorBody(exception) ?: return null

    return try {
        JSONObject(errorBody).optString("code").takeIf { code -> code.isNotBlank() }
    } catch (e: Exception) {
        Log.w("ApiHelper", "Failed to parse backend error code JSON", e)
        null
    }
}

// extracts the backend error message from an api exception
private fun getErrorMessage(exception: Exception): String? {
    val errorBody = getErrorBody(exception) ?: return null

    return try {
        JSONObject(errorBody).optString("message").takeIf { message -> message.isNotBlank() }
    } catch (e: Exception) {
        Log.w("ApiHelper", "Failed to parse backend error message JSON", e)
        null
    }
}

// retrieves the response body from a generated api exception
private fun getErrorBody(exception: Exception): String? = when (exception) {
    is ClientException -> {
        when (val response = exception.response) {
            is ClientError<*> -> response.body as? String
            else -> null
        }
    }

    is ServerException -> {
        when (val response = exception.response) {
            is ServerError<*> -> response.body as? String
            else -> null
        }
    }

    else -> null
}