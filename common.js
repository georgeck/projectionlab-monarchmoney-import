import {monarchCredentials} from './config.js'
import {generate} from 'otplib';
import {gql, GraphQLClient} from "graphql-request";

const MONARCH_API_BASE_URL = 'https://api.monarch.com';
const MONARCH_GRAPHQL_ENDPOINT = `${MONARCH_API_BASE_URL}/graphql`;
const MONARCH_LOGIN_ENDPOINT = `${MONARCH_API_BASE_URL}/auth/login/`;
const MONARCH_USER_AGENT = 'ProjectionLabMonarchImport/1.0 (+https://github.com/georgeck/projectionlab-monarchmoney-import)';

function buildMonarchHeaders(creds, includeAuth = false, token = null) {
    const headers = {
        "accept": "application/json",
        "client-platform": "web",
        "content-type": "application/json"
    };

    if (creds?.device_uuid) {
        headers["device-uuid"] = creds.device_uuid;
    }

    if (includeAuth && token) {
        headers.authorization = token;
    }

    return headers;
}

async function login(creds) {
    const c = creds || monarchCredentials;
    let totp = null;

    if (c.monarch_mfa) {
        try {
            totp = await generate({secret: c.monarch_mfa});
        } catch (error) {
            throw new Error(`Failed to generate Monarch MFA token: ${error.message}`);
        }
    }

    const response = await fetch(MONARCH_LOGIN_ENDPOINT, {
        headers: buildMonarchHeaders(c),
        body: JSON.stringify({
            username: c.monarch_email,
            password: c.monarch_password,
            device_uuid: c.device_uuid || null,
            trusted_device: false,
            supports_mfa: true,
            totp
        }),
        method: "POST",
    });
    if (response.ok) {
        const data = await response.json();
        return "Token " + data.token;
    } else {
        let errorDetail;
        try {
            errorDetail = JSON.stringify(await response.json());
        } catch {
            errorDetail = await response.text();
        }
        throw new Error(`Monarch login failed: status=${response.status} ${response.statusText}. ${errorDetail}`);
    }
}

function createMonarchClient(creds, token) {
    const c = creds || monarchCredentials;
    return new GraphQLClient(MONARCH_GRAPHQL_ENDPOINT, {
        headers: buildMonarchHeaders(c, true, token)
    });
}

async function getMonarchAccounts(creds) {
    const c = creds || monarchCredentials;
    const token = await login(c);
    const client = createMonarchClient(c, token);

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

export {createMonarchClient, getMonarchAccounts, login};
