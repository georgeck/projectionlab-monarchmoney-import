import login from './common.js';
import { gql, GraphQLClient } from "graphql-request";

// API endpoint - /api/get-monarch-accounts
async function getMonarchAccounts() {

    let token = null;
    try {
        token = await login();
    } catch (error) {
        throw error;
    }

    // Define the GraphQL endpoint
    const endpoint = 'https://api.monarchmoney.com/graphql';

    // Create a GraphQLClient instance
    const client = new GraphQLClient(endpoint, {
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": token,
            "client-platform": "web",
            "content-type": "application/json",
        }
    });

    // Define the GraphQL query using gql tag
    const query = gql`
        query GetAccounts {
            accounts {
                ...AccountFields
            }
        }

        fragment AccountFields on Account {
            id
            displayName
        }
    `;

    // Execute the query
    try {
        const data = await client.request(query);
        return data.accounts;
    } catch (error) {
        console.error(error);
        return null; // or handle the error as needed
    }
}

// Call the function as a script
console.log(`command line args: length=${process.argv.length}. arg[2]=${process.argv[2]}`);
if (process.argv.length > 2 && process.argv[2] == 'script') {
    console.log(`Running getMonarchAccounts as script`);

    try {
        const accounts = await getMonarchAccounts()
        for (const account of accounts) {
            console.log(account.id, account.displayName);
        }
    } catch (error) {
        console.error(error);
    }
}

export default getMonarchAccounts;