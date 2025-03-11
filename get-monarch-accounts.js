import {getMonarchAccounts} from './common.js';

try {
    const accounts = await getMonarchAccounts()
    for (const account of accounts) {
        console.log(account.id, account.displayName);
    }
} catch (error) {
    console.error(error);
}