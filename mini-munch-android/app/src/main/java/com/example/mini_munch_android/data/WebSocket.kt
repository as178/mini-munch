package com.example.mini_munch_android.data

// models representing incoming and outgoing websocket messages matching the backend wssService

// outgoing subscription message sent to backend wssService to subscribe or unsubscribe from a table topic
data class WsSubscribeMessage(
    val type: String = "subscribe",
    val topic: String
)

// payload containing event type ('menu' or 'order') and optional error or status message
data class WsPayload(
    val type: String? = null,
    val message: String? = null
)

// outer wrapper for incoming server messages containing target table topic and payload data
data class WsIncomingMessage(
    val topic: String? = null,
    val payload: WsPayload? = null
)
