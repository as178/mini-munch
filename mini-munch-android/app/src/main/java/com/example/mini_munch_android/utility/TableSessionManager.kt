package com.example.mini_munch_android.utility

import android.content.Context
import androidx.core.content.edit

// helper to manage persistent session storage for active table number
object TableSessionManager {
    private const val PREF_NAME = "mini_munch_session"
    private const val KEY_ACTIVE_TABLE = "active_table"
    private const val KEY_LAST_NOTIFIED_ORDER_ID = "last_notified_order_id"

    // save active table number to local shared preferences
    fun saveTableNumber(context: Context, tableNumber: Int) {
        val prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit { putInt(KEY_ACTIVE_TABLE, tableNumber) }
    }

    // retrieve saved table number if any
    fun getTableNumber(context: Context): Int? {
        val prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val table = prefs.getInt(KEY_ACTIVE_TABLE, -1)
        return if (table != -1) table else null
    }

    // get last notified order id
    fun getLastNotifiedOrderId(context: Context): String? {
        val prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_LAST_NOTIFIED_ORDER_ID, null)
    }

    // set last notified order id
    fun setLastNotifiedOrderId(context: Context, orderId: String) {
        val prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit { putString(KEY_LAST_NOTIFIED_ORDER_ID, orderId) }
    }

    // clear saved table number and notification state when leaving table or discarding order
    fun clearTableNumber(context: Context) {
        val prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        prefs.edit {
            remove(KEY_ACTIVE_TABLE)
            remove(KEY_LAST_NOTIFIED_ORDER_ID)
        }
    }
}
