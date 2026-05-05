# DermaSol Verification and Validation Test Cases

## Testing Objective
The objective of testing is to verify that DermaSol works correctly, handles errors safely, and supports the main user flow including authentication, skin analysis, consultation history, and backend API access.

## API Testing

| Test Case ID | Module | Endpoint | Method | Test Scenario | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|---|---|
| API-01 | Backend | /docs | GET | Verify Swagger API documentation loads | Swagger UI should open and display DermaSol API endpoints | Swagger UI opened successfully | Pass | API-01_Swagger_Docs_Loaded.jpg |
| API-02 | Auth | /auth/signup | POST | Verify signup with a new user | New user account should be created successfully | Signup API returned successful response | Pass | API-02_Signup_Success.jpg |
| API-03 | Auth | /auth/login | POST | Verify login with valid credentials | User should login successfully and receive authentication response | Login API returned successful response | Pass | API-03_Login_Success.jpg |
| API-04 | Users | /users/me | GET | Verify logged-in user profile retrieval | API should return current authenticated user details | Current user details returned successfully | Pass | API-04_Get_Current_User.jpg |
| API-05 | Consultations | /consultations/ | GET | Verify consultation history retrieval | API should return the authenticated user's consultation history list | Consultation history API returned successfully | Pass | API-05_List_Consultations.jpg |
| API-06 | Consultations | /consultations/{consultation_id} | GET | Verify system response for non-existing consultation ID | API should return a safe error message instead of crashing | API returned 404 with message: Consultation not found | Pass | API-06_Invalid_Consultation_ID.jpg |
| API-07 | Consultations | /consultations/ | POST | Verify consultation creation with symptoms and skin image | API should create a consultation and return analysis/details | Consultation created successfully | Pass | API-07_Create_Consultation.jpg |
| API-08 | Consultations | /consultations/ | GET | Verify consultation appears in history after creation | API should return the newly created consultation in the user's consultation list | Newly created consultation appeared in consultation list | Pass | API-08_List_Consultations_After_Create.jpg |
| API-09 | Consultations | /consultations/{consultation_id} | GET | Verify consultation detail retrieval using real consultation ID | API should return complete detail of the selected consultation | Consultation detail returned successfully | Pass | API-09_Get_Consultation_Detail.jpg |
API-10_Ping_Backend_Health.jpg

## UI/System Testing

| Test Case ID | Module | Test Scenario | Steps | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|---|
| UI-01 | Home | Verify home page loads | Open frontend application | Home page should load successfully | Pending | Pending | Pending |


## Testing Conclusion

The DermaSol backend APIs were tested using FastAPI Swagger UI. Authentication, user profile retrieval, consultation creation, consultation history, consultation detail retrieval, invalid consultation handling, and backend health were verified successfully. The system returned appropriate success responses for valid requests and safe error responses for invalid requests. Screenshot evidence was collected for each test case to support verification and validation during the final evaluation.