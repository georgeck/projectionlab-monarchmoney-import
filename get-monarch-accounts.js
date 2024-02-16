import login from './common.js';
import { gql, GraphQLClient } from "graphql-request";

// API endpoint - /api/get-monarch-accounts
async function getMonarchAccounts() {
    const token = await login();

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

    getMonarchAccounts().then((accounts) => {
        for (const account of accounts) {
            console.log(account.id, account.displayName);
        }
    });
}

export default getMonarchAccounts;