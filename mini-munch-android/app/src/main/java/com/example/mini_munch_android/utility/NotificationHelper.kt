package com.example.mini_munch_android.utility

import android.Manifest.permission.POST_NOTIFICATIONS
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager.PERMISSION_GRANTED
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat.checkSelfPermission

object NotificationHelper {
    // notification content
    private const val CHANNEL_ID = "order_ready_channel"
    private const val CHANNEL_NAME = "Order Ready"
    private const val NOTIFICATION_ID = 1001

    // notification channel for android 8.0+; used to display notifications
    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                // description for notification channel in settings
                description = "Notifications when your Mini Munch order is ready."
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    // fires an immediate local notification when order is ready, given all safety checks have passed
    fun showOrderReadyNotification(context: Context, tableNumber: Int) {
        // verify if permission was granted (android 13+); safety check to prevent crash if not granted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val hasPermission = checkSelfPermission(
                context,
                POST_NOTIFICATIONS
            ) == PERMISSION_GRANTED

            if (!hasPermission) {
                Log.w("NotificationHelper", "POST_NOTIFICATIONS permission is not granted. Cannot show notification.")
                return
            }
        }

        // check whether user disabled notifications
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            Log.w("NotificationHelper", "Notifications are disabled for this app by the user.")
            return
        }

        // create notification channel and build the notification
        createNotificationChannel(context)
        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Munch away! 🍽️")
            .setContentText("Your order for Table $tableNumber is ready - enjoy!")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        // fire notification
        try {
            with(NotificationManagerCompat.from(context)) {
                notify(NOTIFICATION_ID, builder.build())
            }
        } catch (e: SecurityException) {
            // log if permission was denied
            Log.e("NotificationHelper", "SecurityException thrown while showing notification: ${e.message}")
        }
    }
}
