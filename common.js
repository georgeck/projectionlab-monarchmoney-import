import {monarchCredentials} from './config.js'
import {authenticator} from 'otplib';
import {gql, GraphQLClient} from "graphql-request";

const MONARCH_GRAPHQL_ENDPOINT = 'https://api.monarch.com/graphql';

async function login(creds) {
    const c = creds || monarchCredentials;
    const response = await fetch("https://api.monarch.com/auth/login/", {
        headers: {
            "accept": "application/json",
            "client-platform": "web",
            "content-type": "application/json",
        },
        body: JSON.stringify({
            username: c.monarch_email,
            password: c.monarch_password,
            trusted_device: false,
            supports_mfa: !!c.monarch_mfa,
            totp: c.monarch_mfa ? authenticator.generate(c.monarch_mfa) : null
        }),
        method: "POST",
    });
    if (response.ok) {
        const data = await response.json();
        return "Token " + data.token;
    } else {
        const data = await response.text();
        throw new Error(`Monarch login failed: status=${response.status} ${response.statusText}. ${data}`);
    }
}

async function getMonarchAccounts(creds) {
    const c = creds || monarchCredentials;
    const token = await login(c);

    const client = new GraphQLClient(MONARCH_GRAPHQL_ENDPOINT, {
        headers: {
            "authorization": token,
            "client-platform": "web",
            "device-uuid": c.device_uuid
        }
    });

    const query = gql`
        query GetAccounts {
            accounts {
                id
                displayName
            }
        }
    `;

    const data = await client.request(query);
    return data.accounts;
}

export {getMonarchAccounts, login};
