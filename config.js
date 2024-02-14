const projection_Labs_api_key = "YOUR_PL_API_KEY";

const monarchCredentials = {
    monarch_email: "MONARCH_EMAIL_GOES_HERE",
    monarch_password: "MONARCH_PASSWORD_GOES_HERE",
    monarch_mfa: null
};

// Create an object array to store ProjectionLab account, monarchAccountID,and balance
// Create a record for each account you want to update
let accountMapping = [
    {
        plAccountID: "PROJECTION_LABS_ACCOUNT_ID_GOES_HERE",
        monarchAccountID: "MONARCH_ACCOUNT_ID_GOES_HERE",
        balance: null
    },
    {
        plAccountID: "PROJECTION_LABS_ACCOUNT_ID_GOES_HERE",
        monarchAccountID: "MONARCH_ACCOUNT_ID_GOES_HERE",
        balance: null
    }
];

export { projection_Labs_api_key, monarchCredentials, accountMapping };