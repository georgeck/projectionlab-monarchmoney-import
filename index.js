import {projection_Labs_api_key, accountMapping, monarchCredentials} from './config.js'
import {createMonarchClient, login} from './common.js';
import {gql} from 'graphql-request';

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

async function fetchAndProcessData(client, accountMapping) {
    const data = await client.request(query);

    for (const accountTypeSummary of data.accountTypeSummaries) {
        for (const account of accountTypeSummary.accounts) {
            const mappedAccount = accountMapping.find(accountMap => accountMap.monarchAccountID === account.id);
            if (mappedAccount) {
                mappedAccount.balance = account.displayBalance;
            }
        }
    }
}

function createUpdateFunction(accountMapping) {
    for (const accountMappingElement of accountMapping) {
        if (accountMappingElement.balance !== null) {
            console.log(`await window.projectionlabPluginAPI.updateAccount('${accountMappingElement.plAccountID}', { balance: ${accountMappingElement.balance} }, { key: '${projection_Labs_api_key}' });`);
        }
    }
}

async function main() {
    const token = await login();
    const client = createMonarchClient(monarchCredentials, token);

    await fetchAndProcessData(client, accountMapping);
    createUpdateFunction(accountMapping);
}

main().catch(error => console.error('Error in main function:', error));
