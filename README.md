# SmartEarners Backend Features

## INTERNAL TRANSFER

### check user
post request
 ```
    /transfer/check-user
 ```
- H: {
    "Authorization: Bearer <accesstoken>"
}

- D: {
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

### pay user
post request
 ```
    /transfer/check-user
 ```
- H: {
    "Authorization: Bearer <accesstoken>"
}

- D: {
    "accountNumber": "02000741401",
    "amount": 5000
}

R: {
    "status": true,
    "msg": "Transaction successful",
    "data": {
        "senderId": "62c1a5781d3aecef92ab70eb",
        "receiverId": "62c1a5821d3aecef92ab70f1",
        "accountNumber": "02000741401",
        "amount": 5000,
        "currency": "SEC",
        "_id": "62c1b4ecb857f58c51e10ed3",
        "createdAt": "2022-07-03T15:25:32.816Z",
        "updatedAt": "2022-07-03T15:25:32.816Z",
        "__v": 0
    }
}