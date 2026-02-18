const projection_Labs_api_key = "YOUR_PROJECTIONLAB_API_KEY";

const monarchCredentials = {
    monarch_email: "YOUR_MONARCH_EMAIL",
    monarch_password: "YOUR_MONARCH_PASSWORD",
    monarch_mfa: "",
    device_uuid: ""
}

// Create an object array to store ProjectionLab account, monarchAccountID,and balance
// Create a record for each account you want to update
// Example:
// {
//     plAccountID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
//     monarchAccountID: "123456789012345678",
//     plDisplayName: "My Account Name"
// },
let accountMapping = [];

export {projection_Labs_api_key, monarchCredentials, accountMapping};
