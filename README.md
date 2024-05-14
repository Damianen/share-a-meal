# share a meal assignment

To strengthen social connections among people, the idea emerged to facilitate the sharing of meals together. To keep such a project feasible and explore its potential, the decision was made to start on a small scale.
Users can register in the system and then offer one or more meals. A meal is offered on a specific date and time, and includes various details such as a description, an image, and information regarding whether it's vegetarian or vegan. Other users interested can then sign up to participate in the meal for a small fee.

## Technologies used:

- Node.js
- Express
- mysql

# deployed web server

[web-server](https://share-a-meal-damian-buskens.azurewebsites.net/)

## How to use

1. use a program like postman to get the data from the database through the api.

## Use Cases

### UC-101: Login

- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Parameters:** `emailAddress`, `password`
- **Response:** User data and assigned token

### UC-102: Retrieving System Information

- **Method:** `GET`
- **Endpoint:** `/api/info`
- **Response:**
  - `studentName`
  - `studentNumber`
  - `description`

### UC-201: Registering as a New User

- **Method:** `POST`
- **Endpoint:** `/api/user`
- **Parameters:** All mandatory user data fields
- **Response:** User data and assigned userId

### UC-202: Retrieving Overview of Users

- **Method:** `GET`
- **Endpoint:** `/api/user`
- **Response:** List of user data

### UC-202: Retrieving Overview of Users (Filtered)

- **Method:** `GET`
- **Endpoint:** `/api/user?field1=:value1&field2=:value2`
- **Response:** List of user data filtered by `field1` and `field2`

### UC-203: Retrieving User Profile

- **Method:** `GET`
- **Endpoint:** `/api/user/profile`
- **Response:** User data and userId

### UC-204: Retrieving User Data by ID

- **Method:** `GET`
- **Endpoint:** `/api/user/:userId`
- **Response:** User data (with password if owner) by userId

### UC-205: Modifying User Data

- **Method:** `PUT`
- **Endpoint:** `/api/user/:userId`
- **Parameters:** All mandatory fields + updated user data
- **Response:** Entire updated user data

### UC-206: Deleting User

- **Method:** `DELETE`
- **Endpoint:** `/api/user/:userId`
- **Response:** Message confirming user deletion

### UC-301: Adding Meals

- **Method:** `POST`
- **Endpoint:** `/api/meal`
- **Parameters:** All mandatory meal fields (user id comes from header)
- **Response:** Entire meal data including assigned mealId

### UC-302: Modifying Meal

- **Method:** `PUT`
- **Endpoint:** `/api/meal/:mealId`
- **Parameters:** All mandatory meal fields + updated meal data
- **Response:** Entire updated meal data including assigned mealId

### UC-303: Retrieving All Meals

- **Method:** `GET`
- **Endpoint:** `/api/meal`
- **Response:** List of all meals (excluding cook and participants' passwords)

### UC-304: Retrieving Meal by ID

- **Method:** `GET`
- **Endpoint:** `/api/meal/:mealId`
- **Response:** Entire meal information by mealId (excluding cook and participants' passwords)

### UC-305: Deleting Meal

- **Method:** `DELETE`
- **Endpoint:** `/api/meal/:mealId`
- **Response:** Message confirming meal deletion

### UC-401: Signing Up for Meal

- **Method:** `POST`
- **Endpoint:** `/api/meal/:mealId/participate`
- **Parameters:** (user id comes from header)
- **Response:** Result object where the content of the message is ‘User with ID #userId has signed up for meal with ID #mealId’.

### UC-402: Cancelling Participation in Meal

- **Method:** `DELETE`
- **Endpoint:** `/api/meal/:mealId/participate`
- **Parameters:** (user id comes from header)
- **Response:** Result object where the content of the message is ‘User with ID #userId has cancelled participation in meal with ID #mealId’.

### UC-403: Retrieving Participants

- **Method:** `GET`
- **Endpoint:** `/api/meal/:mealId/participants`
- **Response:** List of participants (excluding passwords)

### UC-404: Retrieving Participant Details

- **Method:** `GET`
- **Endpoint:** `/api/meal/:mealId/participants/:participantId`
- **Response:** Participant detail information (excluding password)
