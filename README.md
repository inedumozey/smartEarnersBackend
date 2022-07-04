# SmartEarners Backend Features

## INTERNAL TRANSFER

### Check user

post request

Confirm the correct receiver before transfering to them

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


### Pay user

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

### Get all transactions

get request

Admin gets all the transactions
Non admin authorized users only get their own transactions (both sent and received transactions if available) otherwise gets empty array
Response is sorted in descending order (more recent has index 0)

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

### Get a transactions

get request

Admin gets any transaction that the id is provided
Non admin logged in user only gets his own transaction whose id is provided
Data is an object of a single transaction
If a user tries to get someone else's transaction, he gets an Access deneid error

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

### Set plan

post request

Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master

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

### Update plan

post request

Any plan can be set, all the fields are required
When a plan type is name master as in above, amount must be 200000, this amount is the minimum limit for master plan (It is a special package). When an amount is set to be 200000 or more, type must be set to masternotherwsie error
This minimun limit can be changed by the admin in the config but name is fixed to be master
lifespan is in seconds

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


### Delete plan

delete request

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

### Delete all plans

delete request

 ```
    /investment/delete-all-plans

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "All plans deleted",
        "data": []
    }
```

### Get all plans

get request

Response is sorted in ascending order of the plan amount (least amount has index 0)

 ```
    /investment/get-all-plans

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
    "status": true,
    "msg": "suucessful",
    "data": [
            {
                "_id": "62c23ee1aa49b1ade23878f7",
                "type": "Master",
                "amount": 200000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 3,
                "createdAt": "2022-07-04T01:14:09.888Z",
                "updatedAt": "2022-07-04T01:14:09.888Z",
                "__v": 0
            }
        ]
    }
```

### Get plan

get request

 ```
    /investment/get-plan/62c23ee1aa49b1ade23878f7

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R:{
        "status": false,
        "msg": "successful",
        "data": {
            "_id": "62c23fdbb6da8fb937df1e1b",
            "type": "Master",
            "amount": 200000,
            "currency": "SEC",
            "lifespan": 20,
            "returnPercentage": 40,
            "createdAt": "2022-07-04T01:18:19.601Z",
            "updatedAt": "2022-07-04T01:18:19.601Z",
            "__v": 0
        }
    }
```

### Invest

post request

Body is not required in any of the plan selected, except master plan that amount must be provided and must be equal to or more than the minimun amount for master plan

 ```
    /investment/get-plan/62c23ee1aa49b1ade23878f7

    D: {
        "amount" : 40000000
    }

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "You have started investment for undefined",
        "data": {
            "_id": "62c245938aaa9307eef65854",
            "planId": {
                "_id": "62c23fdbb6da8fb937df1e1b",
                "type": "Master",
                "amount": 200000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 40,
                "createdAt": "2022-07-04T01:18:19.601Z",
                "updatedAt": "2022-07-04T01:18:19.601Z",
                "__v": 0
            },
            "userId": "62c1a5701d3aecef92ab70e5",
            "amount": 40000000,
            "rewarded": false,
            "rewards": 0,
            "currency": "SEC",
            "isActive": true,
            "createdAt": "2022-07-04T01:42:43.296Z",
            "updatedAt": "2022-07-04T01:42:43.296Z",
            "__v": 0
        }
    }
```

A user cannot have more than two active plans
A user cannot have same plan active at same time

### Get all investments

get request

 ```
    /investment/get-all-investments

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
    "status": true,
    "msg": "Successful",
    "data": [
            {
                "_id": "62c24c515066e096da1967ea",
                "planId": {
                    "_id": "62c23fb3b6da8fb937df1e12",
                    "type": "Diamond",
                    "amount": 70000,
                    "currency": "SEC",
                    "lifespan": 20,
                    "returnPercentage": 40,
                    "createdAt": "2022-07-04T01:17:39.877Z",
                    "updatedAt": "2022-07-04T01:17:39.877Z",
                    "__v": 0
                },
                "userId": {
                    "_id": "62c24c075066e096da1967d6",
                    "username": "user4",
                    "email": "user4"
                },
                "amount": 70000,
                "rewarded": false,
                "rewards": 0,
                "currency": "SEC",
                "isActive": true,
                "createdAt": "2022-07-04T02:11:29.263Z",
                "updatedAt": "2022-07-04T02:11:29.263Z",
                "__v": 0
            },
        ]
    }
```

### Get an investment

get request

 ```
    /investment/get-all-investments/62c24c515066e096da1967ea

    H: {
        "Authorization: Bearer <accesstoken>"
    }

    R: {
        "status": true,
        "msg": "Success",
        "data": {
            "_id": "62c24c515066e096da1967ea",
            "planId": {
                "_id": "62c23fb3b6da8fb937df1e12",
                "type": "Diamond",
                "amount": 70000,
                "currency": "SEC",
                "lifespan": 20,
                "returnPercentage": 40,
                "createdAt": "2022-07-04T01:17:39.877Z",
                "updatedAt": "2022-07-04T01:17:39.877Z",
                "__v": 0
            },
            "userId": {
                "_id": "62c24c075066e096da1967d6",
                "username": "user4",
                "email": "user4"
            },
            "amount": 70000,
            "rewarded": false,
            "rewards": 0,
            "currency": "SEC",
            "isActive": true,
            "createdAt": "2022-07-04T02:11:29.263Z",
            "updatedAt": "2022-07-04T02:11:29.263Z",
            "__v": 0
        }
    }
```


### resolve

get request

 ```
    /investment/resolve

    R: {
        "status": true,
        "msg": "Success",
    }
```


## REFERRAL REWARDS

### resolve

get request

 ```
    /referralReward/resolve/

    R: {
        "status": true,
        "msg": "Success",
    }
```