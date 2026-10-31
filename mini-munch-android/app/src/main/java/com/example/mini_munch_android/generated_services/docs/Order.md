
# Order

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | **kotlin.String** |  |  |
| **table** | [**OrderTable**](OrderTable.md) |  |  |
| **items** | [**kotlin.collections.List&lt;OrderItem&gt;**](OrderItem.md) |  |  |
| **total** | [**java.math.BigDecimal**](java.math.BigDecimal.md) |  |  |
| **status** | [**inline**](#Status) |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | DRAFT, SUBMITTED, PREPARING, READY |



