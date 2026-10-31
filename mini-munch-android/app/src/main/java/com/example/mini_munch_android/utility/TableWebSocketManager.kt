package com.example.mini_munch_android.utility

import android.util.Log
import com.example.mini_munch_android.data.WsIncomingMessage
import com.example.mini_munch_android.data.WsPayload
import com.example.mini_munch_android.data.WsSubscribeMessage
import com.google.gson.Gson
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

// manages websocket connections to receive real-time menu and order updates from the backend server
class TableWebSocketManager(
    private val client: OkHttpClient = OkHttpClient(),  // client instance used to establish and manage network socket connections
    private val gson: Gson = Gson()                     // parser instance used to serialize and deserialize json websocket messages
) {
    // connects to the websocket server and returns a reactive flow streaming incoming table event payloads
    // creates a cold flow stream that emits values received asynchronously from callbacks
    fun observeTableEvents(wsUrl: String, tableNumber: Int): Flow<WsPayload> = callbackFlow {
        // build request configured with the target websocket url
        val request = Request.Builder()
            .url(wsUrl)
            .build()

        // open new websocket connection and attach event listeners
        val webSocket = client.newWebSocket(request, object : WebSocketListener() {
            // invoked when the websocket connection is established
            override fun onOpen(webSocket: WebSocket, response: Response) {
                // format and send subscription json message matching backend wssService topic format
                val subscribeJson = gson.toJson(
                    WsSubscribeMessage(
                        type = "subscribe",
                        topic = tableNumber.toString()
                    )
                )
                webSocket.send(subscribeJson)
                // trigger an immediate order/status check upon connecting or reconnecting
                trySend(WsPayload(type = "order", message = "Connected"))
            }

            // invoked when a text frame message is received from the websocket server
            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    // deserialize incoming json
                    val incoming = gson.fromJson(text, WsIncomingMessage::class.java)
                    incoming.payload?.let { payload ->
                        trySend(payload)
                    }
                } catch (e: Exception) {
                    // log unparseable or unexpected websocket frame content
                    Log.w("TableWebSocketManager", "Received unparseable WebSocket message frame: $text", e)
                }
            }

            // invoked when a connection error occurs or network drops; closes the flow stream
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("TableWebSocketManager", "WebSocket connection failure on table $tableNumber", t)
                close(t)
            }
        })

        // invoked when the flow collector stops listening (e.g., when screen is left or viewmodel is cleared)
        awaitClose {
            try {
                // send unsubscribe message to server to clean up backend topic subscription
                val unsubscribeJson = gson.toJson(
                    WsSubscribeMessage(
                        type = "unsubscribe",
                        topic = tableNumber.toString()
                    )
                )
                webSocket.send(unsubscribeJson)
            } catch (e: Exception) {
                // log exception during cleanup
                Log.w("TableWebSocketManager", "Failed to send unsubscribe message during socket cleanup", e)
            }
            // gracefully close the websocket connection with status code 1000 (normal closure)
            webSocket.close(1000, "Screen disconnected")
        }
    }
}
