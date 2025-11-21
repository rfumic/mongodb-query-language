# MongoDB Query Language
A lightweight domain-specific language for writing MongoDB queries inside URL parameters.
Designed to be simple, readable, and easy to use in REST APIs.

This library lets you write expressions like:
```sql
age >= 18 AND verified == true
```
and automatically converts them into valid MongoDB query objects.

It removes the need for JSON in URLs whilte keeping full support for common MongoDB operators.

## Installation

```sh
npm install @rfumic/mongodb-query-language
```

## REST API Example

```javascript
app.get("/api/users", async (req, res) => {
    try {
        const query = GetMongoQuery(req.query.q || "");
        const users = await db.collection("users").find(query).toArray();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: "Invalid query: " + err.message });
    }
});
```

## Language Reference

Below is every operator and feature supported by the language.
For more details on specific operators check the [MongoDB docs](https://www.mongodb.com/docs/manual/reference/mql/query-predicates/).

### Comparison operators
| Expression    | MongoDB |
| --- | --- |
| =  | $eq |
| != | $ne |
| <, <= | $lt, $lte |
| >, >= | $gt, $gte |

Example:
```sql
age = 30
price >= 99.99
rating != 4
```

### IN / NOT IN
| Expression    | MongoDB |
| --- | --- |
| IN | $in |
| NOT IN | $nin |

Example:
```sql
age IN (22, 29, 36)
```

### Logical operators
| Expression    | MongoDB |
| --- | --- |
| AND | $and |
| OR | $or |
| NOR | $nor |
| NOT _expr_ | $not |

Example:
```sql
age > 18 AND verified = true
NOT (status = "inactive")
```

### Field existence and type
| Expression    | MongoDB |
| --- | --- |
| HAS _field_ | $exists |
| _field_ IS _type_ | $not |

Example:
```sql
HAS email
age IS number
```

### Regex matching
| Keyword    | MongoDB |
| --- | --- |
| MATCHES | $regex |

Example:
```sql
email MATCHES "/@gmail.com$/" "i"
```
> NOTE: The second string is for optional regex options.

### Modulo
```sql
age MOD 2 = 0
```
is equivalent to:
```javascript
{ age: { $mod: [2, 0] } }
```

### Array operators
| Expression | MongoDB |
| --- | --- |
| CONTAINS (_values_) | $all |
| ANY _condition_ | $elemMatch |
| SIZE _n_ | $size |

Example:
```sql
languages CONTAINS ('en', 'fr')
scores ANY >= 2.5
tags SIZE 3
```

### Bitwise operators

| Expression | MongoDB |
| --- | --- |
| BIT ALL_SET | $bitsAllSet |
| BIT ANY_SET | $bitsAnySet |
| BIT ALL_CLEAR | $bitsAllClear |
| BIT ANY_CLEAR | $bitsAnyClear |


Example:
```sql
permissions BIT ALL_SET 5
permissions BIT ANY_CLEAR (1, 3)
```
> NOTE: Bits may be a number or a list


### Field name escaping
Use `[` and `]` if a field name contains keywords:
```sql
[AND] = 10
```

### Numeric formats
The language supports:
    - regular integers: `123`
    - floats: `12.5`
    - binary: `0b10110`
    - hexadecimal: `0xFF`

All convert correctly to JavaScript numbers.
