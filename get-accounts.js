import login from './common.js';
import {gql, GraphQLClient} from "graphql-request";


async function getAccounts() {
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
        return data;
    } catch (error) {
        console.error(error);
        return null; // or handle the error as needed
    }
}

// Call the function
getAccounts().then((data) => {
    for (const account of data.accounts) {
        console.log(account.id, account.displayName);
    }
});
