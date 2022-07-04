# SmartEarners Backend Features

## INTERNAL TRANSFER

### check user

Confirm the correct receiver before transfering to them

post request
 ```
    /transfer/check-user

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "accountNumber": "02000741401",
        "amount": 5000
    }

    R: {
        "status": true,
        "msg": "confirmed",
        "data": {
            "username": "user3",
            "email": "user3",
            "accountNumber": "02000741401",
            "amount": "5000.00000000",
            "currency": "SEC"
        }
    }
```


### pay user

post request
 ```
    /transfer/pay-user

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "accountNumber": "02000741401",
        "amount": 5000
    }

    R: {
        "status": true,
        "msg": "Transaction successful",
        "data": {
            "_id": "62c22f18b8993953ac390dd3",
            "senderId": {
                "_id": "62c1a5701d3aecef92ab70e5",
                "username": "user1",
                "email": "user1"
            },
            "receiverId": {
                "_id": "62c1a5821d3aecef92ab70f1",
                "username": "user3",
                "email": "user3"
            },
            "accountNumber": "02000741401",
            "amount": 5000,
            "currency": "SEC",
            "createdAt": "2022-07-04T00:06:48.110Z",
            "updatedAt": "2022-07-04T00:06:48.110Z",
            "__v": 0
        }
    }

    E: {
        "status": false,
        "msg": "Invalid account number"
    }
```

### get all transactions

Admin gets all the transactions
Non admin authorized users only get their own transactions (both sent and received transactions if available) otherwise gets empty array
Response is sorted in descending order (more recent has index 0)

get request
```
    /transfer/get-all-transactions

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Successful",
        "data": [
            {
                "_id": "62c2335d6d9792dcaa9fa313",
                "senderId": {
                    "_id": "62c1a5701d3aecef92ab70e5",
                    "username": "user1",
                    "email": "user1"
                },
                "receiverId": {
                    "_id": "62c1a53e1d3aecef92ab70df",
                    "username": "mozey",
                    "email": "mozey"
                },
                "accountNumber": "02512177402",
                "amount": 10000,
                "currency": "SEC",
                "createdAt": "2022-07-04T00:25:01.823Z",
                "updatedAt": "2022-07-04T00:25:01.823Z",
                "__v": 0
            },
        ]
    }
```

### get a transactions

Admin gets any transaction that the id is provided
Non admin logged in user only gets his own transaction whose id is provided
Data is an object of a single transaction
If a user tries to get someone else's transaction, he gets an Access deneid error

get request
```
    /transfer/get-transaction/62c22e0ba9ca694d23a569db

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Successful",
        "data": {
            "_id": "62c22e0ba9ca694d23a569db",
            "senderId": {
                "_id": "62c1a5701d3aecef92ab70e5",
                "username": "user1",
                "email": "user1"
            },
            "receiverId": {
                "_id": "62c1a5821d3aecef92ab70f1",
                "username": "user3",
                "email": "user3"
            },
            "accountNumber": "02000741401",
            "amount": 5000,
            "currency": "SEC",
            "createdAt": "2022-07-04T00:02:19.079Z",
            "updatedAt": "2022-07-04T00:02:19.079Z",
            "__v": 0
        }
}
```

## INVESTMENT

### set plan
Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master

post request
 ```
    /investment/set-plan/

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "type": "Master",
        "amount": 200000,
        "lifespan": "20",
        "returnPercentage": "3"
    }

    R: {
        "status": true,
        "msg": "successful",
        "data": {
            "type": "MASTER",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "20",
            "returnPercentage": "3",
            "_id": "62c2381294b90298d3d8c241",
            "createdAt": "2022-07-04T00:45:06.169Z",
            "updatedAt": "2022-07-04T00:45:06.169Z",
            "__v": 0
        }
    }

    E: {
        "status": false,
        "msg": "Plan already exist"
    }
```

### update plan

Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master
lifespan is in seconds

post request
 ```
    /investment/update-plan/

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    D: {
        "type": "Master",
        "amount": 200000,
        "lifespan": "20",
        "returnPercentage": "16575"
    }

    R: {
        "status": true,
        "msg": "successful",
        "data": {
            "type": "MASTER",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "16575",
            "returnPercentage": "3",
            "_id": "62c2381294b90298d3d8c241",
            "createdAt": "2022-07-04T00:45:06.169Z",
            "updatedAt": "2022-07-04T00:45:06.169Z",
            "__v": 0
        }
    }
```


### delete plan

get request
 ```
    /investment/delete-plan/62c23a36aa49b1ade23878e7

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Plan deleted",
        "data": {
            "_id": "62c23a36aa49b1ade23878e7",
            "type": "Master",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": "20",
            "returnPercentage": "3",
            "createdAt": "2022-07-04T00:54:14.339Z",
            "updatedAt": "2022-07-04T00:54:14.339Z",
            "__v": 0
        }
    }
```