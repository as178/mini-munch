package com.example.mini_munch_android.utility

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent.FLAG_IMMUTABLE
import android.app.PendingIntent.FLAG_UPDATE_CURRENT
import android.app.PendingIntent.getActivity
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.mini_munch_android.BuildConfig
import com.example.mini_munch_android.MainActivity
import com.example.mini_munch_android.repository.CustomerRepository
import com.example.mini_munch_android.utility.NotificationHelper.showOrderReadyNotification
import com.example.mini_munch_android.utility.TableSessionManager.clearTableNumber
import com.example.mini_munch_android.utility.TableSessionManager.getLastNotifiedOrderId
import com.example.mini_munch_android.utility.TableSessionManager.setLastNotifiedOrderId
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.time.Duration.Companion.seconds

// foreground service to maintain websocket connection and listen for order updates when app is in background
class OrderForegroundService : Service() {

    // coroutine scope and job for background service tasks
    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private val webSocketManager = TableWebSocketManager()
    private val repository = CustomerRepository()

    // constants for foreground notification and intent extra
    companion object {
        private const val CHANNEL_ID = "order_service_channel"
        private const val NOTIFICATION_ID = 2001
        const val EXTRA_TABLE_NUMBER = "extra_table_number"
    }

    // binder is not used since this is a started service
    override fun onBind(intent: Intent?): IBinder? = null

    // invoked when the service is started with intent containing table number
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // stop service if no table number is provided, and tell android not to recreate it
        val tableNumber = intent?.getIntExtra(EXTRA_TABLE_NUMBER, -1) ?: -1
        if (tableNumber == -1) {
            stopSelf()
            return START_NOT_STICKY
        }

        // else, create notification channel and start foreground service
        createServiceNotificationChannel()
        startForeground(NOTIFICATION_ID, createServiceNotification(tableNumber))

        // start background websocket listener and check order status
        startBackgroundOrderListener(tableNumber)

        // return START_STICKY to ensure service is restarted with a clean slate if killed by system
        return START_STICKY
    }

    // creates notification channel for android 8.0+ service status
    private fun createServiceNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Order Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the connection alive to notify you when your Mini Munch order is ready."
            }
            val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    // builds ongoing notification displayed while background service is running
    private fun createServiceNotification(tableNumber: Int): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = getActivity(
            this,
            0,
            notificationIntent,
            FLAG_IMMUTABLE or FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentTitle("Mini Munch Active")
            .setContentText("Monitoring order for table $tableNumber... ☕")
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    // starts background websocket listener and checks order status when events occur, applies 3-second delay on reconnections
    private fun startBackgroundOrderListener(tableNumber: Int) {
        serviceScope.launch {
            while (isActive) {
                try {
                    webSocketManager.observeTableEvents(BuildConfig.API_WS_URL, tableNumber)
                        .collect { payload ->
                            if (payload.type == "order") {
                                try {
                                    val order = repository.getOrder(tableNumber)

                                    // check if order is ready and notify user, ensuring to update the last notified order id in shared preferences
                                    if (order.status == "READY") {
                                        val lastNotifiedId = getLastNotifiedOrderId(applicationContext)
                                        if (lastNotifiedId != order.id) {
                                            setLastNotifiedOrderId(applicationContext, order.id)
                                            showOrderReadyNotification(applicationContext, tableNumber)
                                        }
                                    }
                                } catch (e: Exception) {
                                    val errorCode = getErrorCode(e)

                                    // handle order not found and staff discarding the order, ensuring to clear the session state in shared preferences + cleanly stop the service
                                    if (errorCode == "ORDER_NOT_FOUND" || e.message?.contains("404") == true) {
                                        Log.i("OrderForegroundService", "Order discarded or not found. Stopping foreground service.")
                                        clearTableNumber(applicationContext)
                                        stopSelf()
                                        return@collect
                                    }
                                    Log.w("OrderForegroundService", "Failed to check order status from background websocket", e)
                                }
                            }
                        }
                } catch (e: Exception) {
                    Log.w("OrderForegroundService", "Background websocket connection lost. Reconnecting in 3 seconds...", e)
                    delay(3.seconds)
                }
            }
        }
    }

    // cleans up coroutines when service is destroyed
    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }
}
