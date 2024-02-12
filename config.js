const projection_Labs_api_key = "API_KEY_GOES_HERE";

const monarchCredentials = {
    email: "MONARCH_EMAIL_GOES_HERE",
    password: "MONARCH_PASSWORD_GOES_HERE"
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