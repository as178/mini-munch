# TablesApi

All URIs are relative to *http://localhost:5001*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**apiTablesTableNumberGet**](TablesApi.md#apiTablesTableNumberGet) | **GET** /api/tables/{tableNumber} | Retrieve a table by its number (in use by the android client for table status checking) |
| [**apiTablesTableNumberOccupyPatch**](TablesApi.md#apiTablesTableNumberOccupyPatch) | **PATCH** /api/tables/{tableNumber}/occupy | Occupy a table by its number |
| [**apiTablesTableNumberReleasePatch**](TablesApi.md#apiTablesTableNumberReleasePatch) | **PATCH** /api/tables/{tableNumber}/release | Release a table from being occupied by its number |


<a id="apiTablesTableNumberGet"></a>
# **apiTablesTableNumberGet**
> ApiTablesTableNumberGet200Response apiTablesTableNumberGet(tableNumber)

Retrieve a table by its number (in use by the android client for table status checking)

Retrieves the table document which includes the table ID, table number, and availability status, if successful.

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = TablesApi()
val tableNumber : kotlin.Int = 56 // kotlin.Int | The number of the table to retrieve.
try {
    val result : ApiTablesTableNumberGet200Response = apiInstance.apiTablesTableNumberGet(tableNumber)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TablesApi#apiTablesTableNumberGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TablesApi#apiTablesTableNumberGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **tableNumber** | **kotlin.Int**| The number of the table to retrieve. | |

### Return type

[**ApiTablesTableNumberGet200Response**](ApiTablesTableNumberGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiTablesTableNumberOccupyPatch"></a>
# **apiTablesTableNumberOccupyPatch**
> ApiTablesTableNumberGet200Response apiTablesTableNumberOccupyPatch(tableNumber)

Occupy a table by its number

Checks table availability and occupies the table if it is available. If successful, returns the updated table document (consisting of the table ID, table number, and availability status).

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = TablesApi()
val tableNumber : kotlin.Int = 56 // kotlin.Int | The number of the table to occupy.
try {
    val result : ApiTablesTableNumberGet200Response = apiInstance.apiTablesTableNumberOccupyPatch(tableNumber)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TablesApi#apiTablesTableNumberOccupyPatch")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TablesApi#apiTablesTableNumberOccupyPatch")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **tableNumber** | **kotlin.Int**| The number of the table to occupy. | |

### Return type

[**ApiTablesTableNumberGet200Response**](ApiTablesTableNumberGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="apiTablesTableNumberReleasePatch"></a>
# **apiTablesTableNumberReleasePatch**
> ApiTablesTableNumberGet200Response apiTablesTableNumberReleasePatch(tableNumber)

Release a table from being occupied by its number

Checks table availability and releases the table if it is occupied. If successful, returns the updated table document (consisting of the table ID, table number, and availability status).

### Example
```kotlin
// Import classes:
//import com.example.mini_munch_android.generated_services.infrastructure.*
//import com.example.mini_munch_android.generated_services.models.*

val apiInstance = TablesApi()
val tableNumber : kotlin.Int = 56 // kotlin.Int | The number of the table to release.
try {
    val result : ApiTablesTableNumberGet200Response = apiInstance.apiTablesTableNumberReleasePatch(tableNumber)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TablesApi#apiTablesTableNumberReleasePatch")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TablesApi#apiTablesTableNumberReleasePatch")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **tableNumber** | **kotlin.Int**| The number of the table to release. | |

### Return type

[**ApiTablesTableNumberGet200Response**](ApiTablesTableNumberGet200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

