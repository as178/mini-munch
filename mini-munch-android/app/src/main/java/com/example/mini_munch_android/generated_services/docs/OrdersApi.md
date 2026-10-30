# OrdersApi

All URIs are relative to *http://localhost:5001*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**apiOrdersGet**](OrdersApi.md#apiOrdersGet) | **GET** /api/orders | Get all orders for the staff dashboard |
| [**apiOrdersIdDelete**](OrdersApi.md#apiOrdersIdDelete) | **DELETE** /api/orders/{id} | Delete an order |
| [**apiOrdersIdItemsMenuItemIdDelete**](OrdersApi.md#apiOrdersIdItemsMenuItemIdDelete) | **DELETE** /api/orders/{id}/items/{menuItemId} | Remove an order item from a DRAFT status order |
| [**apiOrdersIdItemsMenuItemIdPatch**](OrdersApi.md#apiOrdersIdItemsMenuItemIdPatch) | **PATCH** /api/orders/{id}/items/{menuItemId} | Change an order item quantity |
| [**apiOrdersIdItemsPost**](OrdersApi.md#apiOrdersIdItemsPost) | **POST** /api/orders/{id}/items | Add an order item to a DRAFT status order |
| [**apiOrdersIdStatusPatch**](OrdersApi.md#apiOrdersIdStatusPatch) | **PATCH** /api/orders/{id}/status | Update an order status |
| [**apiOrdersPost**](OrdersApi.md#apiOrdersPost) | **POST** /api/orders | Create a DRAFT status order |
| [**apiOrdersTableTableNumberGet**](OrdersApi.md#apiOrdersTableTableNumberGet) | **GET** /api/orders/table/{tableNumber} | Get the order for a table |


<a id="apiOrdersGet"></a>
# **apiOrdersGet**
> ApiOrdersGet200Response apiOrdersGet()

Get all orders for the staff dashboard

If successful, returns all SUBMITTED, PREPARING, and READY orders for the staff dashboard (an array of order documents, each including the table reference, order items, total, status and creation timestamp), or an empty array if no such orders exist.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
try {
    val result : ApiOrdersGet200Response = apiInstance.apiOrdersGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ApiOrdersGet200Response**](ApiOrdersGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiOrdersIdDelete"></a>
# **apiOrdersIdDelete**
> apiOrdersIdDelete(id)

Delete an order

Deletes a DRAFT or READY status order. If successful, returns a success response with no content.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.apiOrdersIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="apiOrdersIdItemsMenuItemIdDelete"></a>
# **apiOrdersIdItemsMenuItemIdDelete**
> apiOrdersIdItemsMenuItemIdDelete(id, menuItemId)

Remove an order item from a DRAFT status order

Removes an order item by menu item ID (even if it has been removed from the menu). If successful, returns a success response with no content.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val id : kotlin.String = id_example // kotlin.String | 
val menuItemId : kotlin.String = menuItemId_example // kotlin.String | 
try {
    apiInstance.apiOrdersIdItemsMenuItemIdDelete(id, menuItemId)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersIdItemsMenuItemIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersIdItemsMenuItemIdDelete")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |
| **menuItemId** | **kotlin.String**|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="apiOrdersIdItemsMenuItemIdPatch"></a>
# **apiOrdersIdItemsMenuItemIdPatch**
> ApiOrdersPost201Response apiOrdersIdItemsMenuItemIdPatch(id, menuItemId, apiOrdersIdItemsMenuItemIdPatchRequest)

Change an order item quantity

Changes the quantity of an existing order item in a DRAFT order. If successful, returns the updated order document (which includes the table reference, order items, total, status and creation timestamp) with the updated order item quality. The item can remain in the order even if it has been removed from the menu.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val id : kotlin.String = id_example // kotlin.String | 
val menuItemId : kotlin.String = menuItemId_example // kotlin.String | 
val apiOrdersIdItemsMenuItemIdPatchRequest : ApiOrdersIdItemsMenuItemIdPatchRequest =  // ApiOrdersIdItemsMenuItemIdPatchRequest | 
try {
    val result : ApiOrdersPost201Response = apiInstance.apiOrdersIdItemsMenuItemIdPatch(id, menuItemId, apiOrdersIdItemsMenuItemIdPatchRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersIdItemsMenuItemIdPatch")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersIdItemsMenuItemIdPatch")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |
| **menuItemId** | **kotlin.String**|  | |
| **apiOrdersIdItemsMenuItemIdPatchRequest** | [**ApiOrdersIdItemsMenuItemIdPatchRequest**](ApiOrdersIdItemsMenuItemIdPatchRequest.md)|  | |

### Return type

[**ApiOrdersPost201Response**](ApiOrdersPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="apiOrdersIdItemsPost"></a>
# **apiOrdersIdItemsPost**
> ApiOrdersPost201Response apiOrdersIdItemsPost(id, apiOrdersIdItemsPostRequest)

Add an order item to a DRAFT status order

Adds an existing menu item to the order and stores its current name and price as a snapshot. If successful, returns the updated order document (which includes the table reference, order items, total, status and creation timestamp) with the added menu item included. Deleted menu items cannot be added to new orders.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val id : kotlin.String = id_example // kotlin.String | 
val apiOrdersIdItemsPostRequest : ApiOrdersIdItemsPostRequest =  // ApiOrdersIdItemsPostRequest | 
try {
    val result : ApiOrdersPost201Response = apiInstance.apiOrdersIdItemsPost(id, apiOrdersIdItemsPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersIdItemsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersIdItemsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |
| **apiOrdersIdItemsPostRequest** | [**ApiOrdersIdItemsPostRequest**](ApiOrdersIdItemsPostRequest.md)|  | |

### Return type

[**ApiOrdersPost201Response**](ApiOrdersPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="apiOrdersIdStatusPatch"></a>
# **apiOrdersIdStatusPatch**
> ApiOrdersPost201Response apiOrdersIdStatusPatch(id, apiOrdersIdStatusPatchRequest)

Update an order status

Updates an order through the valid workflow transitions DRAFT to SUBMITTED, SUBMITTED to PREPARING, and PREPARING to READY. If successful, returns the updated order document (which includes the table reference, order items, total, status and creation timestamp) with the updated order status.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val id : kotlin.String = id_example // kotlin.String | 
val apiOrdersIdStatusPatchRequest : ApiOrdersIdStatusPatchRequest =  // ApiOrdersIdStatusPatchRequest | 
try {
    val result : ApiOrdersPost201Response = apiInstance.apiOrdersIdStatusPatch(id, apiOrdersIdStatusPatchRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersIdStatusPatch")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersIdStatusPatch")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |
| **apiOrdersIdStatusPatchRequest** | [**ApiOrdersIdStatusPatchRequest**](ApiOrdersIdStatusPatchRequest.md)|  | |

### Return type

[**ApiOrdersPost201Response**](ApiOrdersPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="apiOrdersPost"></a>
# **apiOrdersPost**
> ApiOrdersPost201Response apiOrdersPost(apiOrdersPostRequest)

Create a DRAFT status order

Creates an empty DRAFT status order for an occupied table. If successful, returns the created order document (consisting of the table reference, order items, total, preset DRAFT status and creation timestamp).

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val apiOrdersPostRequest : ApiOrdersPostRequest =  // ApiOrdersPostRequest | 
try {
    val result : ApiOrdersPost201Response = apiInstance.apiOrdersPost(apiOrdersPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **apiOrdersPostRequest** | [**ApiOrdersPostRequest**](ApiOrdersPostRequest.md)|  | |

### Return type

[**ApiOrdersPost201Response**](ApiOrdersPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="apiOrdersTableTableNumberGet"></a>
# **apiOrdersTableTableNumberGet**
> ApiOrdersPost201Response apiOrdersTableTableNumberGet(tableNumber)

Get the order for a table

Retrieves the current order document for a table, which includes the table reference, order items, total, status and creation timestamp. Each table can have at most one order while it is occupied.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = OrdersApi()
val tableNumber : kotlin.Int = 56 // kotlin.Int | 
try {
    val result : ApiOrdersPost201Response = apiInstance.apiOrdersTableTableNumberGet(tableNumber)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling OrdersApi#apiOrdersTableTableNumberGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling OrdersApi#apiOrdersTableTableNumberGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **tableNumber** | **kotlin.Int**|  | |

### Return type

[**ApiOrdersPost201Response**](ApiOrdersPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

