# MenuItemsApi

All URIs are relative to *http://localhost:5001*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**apiMenuGet**](MenuItemsApi.md#apiMenuGet) | **GET** /api/menu | Retrieve all menu items |
| [**apiMenuIdDelete**](MenuItemsApi.md#apiMenuIdDelete) | **DELETE** /api/menu/{id} | Delete an existing menu item |
| [**apiMenuIdGet**](MenuItemsApi.md#apiMenuIdGet) | **GET** /api/menu/{id} | Retrieve a menu item by its ID (currently not in use by the frontend client) |
| [**apiMenuPost**](MenuItemsApi.md#apiMenuPost) | **POST** /api/menu | Create a new menu item |


<a id="apiMenuGet"></a>
# **apiMenuGet**
> ApiMenuGet200Response apiMenuGet()

Retrieve all menu items

If successful, retrieves all menu item documents (or an empty array if no menu items exist) consisting of an array menu items, each containing the menu item ID, name, description, and price.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = MenuItemsApi()
try {
    val result : ApiMenuGet200Response = apiInstance.apiMenuGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling MenuItemsApi#apiMenuGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling MenuItemsApi#apiMenuGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ApiMenuGet200Response**](ApiMenuGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiMenuIdDelete"></a>
# **apiMenuIdDelete**
> apiMenuIdDelete(id)

Delete an existing menu item

Deletes an existing menu item document by its ID. If successful, returns a success response with no content.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = MenuItemsApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    apiInstance.apiMenuIdDelete(id)
} catch (e: ClientException) {
    println("4xx response calling MenuItemsApi#apiMenuIdDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling MenuItemsApi#apiMenuIdDelete")
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

<a id="apiMenuIdGet"></a>
# **apiMenuIdGet**
> ApiMenuPost201Response apiMenuIdGet(id)

Retrieve a menu item by its ID (currently not in use by the frontend client)

Retrieves the menu item document which includes the menu item ID, name, description, and price, if successful.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = MenuItemsApi()
val id : kotlin.String = id_example // kotlin.String | 
try {
    val result : ApiMenuPost201Response = apiInstance.apiMenuIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling MenuItemsApi#apiMenuIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling MenuItemsApi#apiMenuIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **kotlin.String**|  | |

### Return type

[**ApiMenuPost201Response**](ApiMenuPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiMenuPost"></a>
# **apiMenuPost**
> ApiMenuPost201Response apiMenuPost(apiMenuPostRequest)

Create a new menu item

Creates a new menu item document with the provided name, description, and price. If successful, returns the created menu item document (consisting of the menu item ID, name, description, and price).

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = MenuItemsApi()
val apiMenuPostRequest : ApiMenuPostRequest =  // ApiMenuPostRequest | 
try {
    val result : ApiMenuPost201Response = apiInstance.apiMenuPost(apiMenuPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling MenuItemsApi#apiMenuPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling MenuItemsApi#apiMenuPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **apiMenuPostRequest** | [**ApiMenuPostRequest**](ApiMenuPostRequest.md)|  | |

### Return type

[**ApiMenuPost201Response**](ApiMenuPost201Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

