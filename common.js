import {monarchCredentials} from './config.js'
import {authenticator} from 'otplib';
import {gql, GraphQLClient} from "graphql-request";

async function login() {
    let response = await fetch("https://api.monarch.com/auth/login/", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "client-platform": "web",
            "content-type": "application/json",
        },
        "referrerPolicy": "no-referrer",
        "body": JSON.stringify({
            username: monarchCredentials.monarch_email,
            password: monarchCredentials.monarch_password,
            trusted_device: false,
            supports_mfa: !!monarchCredentials.monarch_mfa,
            totp: monarchCredentials.monarch_mfa ? authenticator.generate(monarchCredentials.monarch_mfa) : null
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });
    if (response.ok) {
        let data = await response.json();
        return "Token " + data.token;
    } else {
        const data = await response.text();
        const error = new Error(`Monarch login failed with server error: status=${response.status} ${response.statusText}. JSON=${JSON.stringify(data)}`);
        console.error(error);
        throw error;
    }
}

async function getMonarchAccounts() {

    const endpoint = 'https://api.monarch.com/graphql';

    let token = null;
    try {
        token = await login();
    } catch (error) {
        throw error;
    }

    // Create a GraphQLClient instance
    const client = new GraphQLClient(endpoint, {
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": token,
            "client-platform": "web",
            "content-type": "application/json",
            "device-uuid": monarchCredentials.device_uuid
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

export {getMonarchAccounts, login};