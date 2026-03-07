import crypto from 'crypto';
import {monarchCredentials} from './config.js'
import {generate} from 'otplib';
import {gql, GraphQLClient} from "graphql-request";

const MONARCH_API_BASE_URL = 'https://api.monarch.com';
const MONARCH_GRAPHQL_ENDPOINT = `${MONARCH_API_BASE_URL}/graphql`;
const MONARCH_LOGIN_ENDPOINT = `${MONARCH_API_BASE_URL}/auth/login/`;

function buildMonarchHeaders(creds, includeAuth = false, token = null) {
    const headers = {
        "accept": "application/json",
        "client-platform": "web",
        "content-type": "application/json",
        "Origin": "https://app.monarchmoney.com",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    };

    headers["device-uuid"] = creds?.device_uuid || crypto.randomUUID();

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
            trusted_device: true,
            supports_mfa: true,
            supports_email_otp: true,
            supports_recaptcha: true,
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

async function generateSyncCommands(apiKey, creds, accountMapping) {
    const c = creds || monarchCredentials;
    const token = await login(c);
    const client = createMonarchClient(c, token);

    const query = gql`
        query GetAccountBalances {
            accountTypeSummaries {
                accounts {
                    id
                    displayBalance
                }
            }
        }
    `;

    const data = await client.request(query);

    // Match Monarch balances to mapped accounts
    const mappingWithBalances = accountMapping.map(m => ({...m, balance: null}));
    for (const summary of data.accountTypeSummaries) {
        for (const account of summary.accounts) {
            const mapped = mappingWithBalances.find(m => m.monarchAccountID === account.id);
            if (mapped) {
                mapped.balance = account.displayBalance;
            }
        }
    }

    // Generate updateAccount commands
    return mappingWithBalances
        .filter(m => m.balance !== null)
        .map(m => `await window.projectionlabPluginAPI.updateAccount('${m.plAccountID}', { balance: ${m.balance} }, { key: '${apiKey}' });`);
}

export {createMonarchClient, generateSyncCommands, getMonarchAccounts, login};
