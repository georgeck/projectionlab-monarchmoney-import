# Introduction
Here are some scripts to help you import data from [Monarch Money](https://monarchmoney.com) into [ProjectionLab](https://projectionlab.com/).

### Step 1: Find out the `accountId` of ProjectionLab accounts that you want to import
1. Go to [ProjectionLab](https://projectionlab.com)
2. Go to Account Settings -> [plugins](https://app.projectionlab.com/settings/plugins)
3. Ensure 'Enable plugins' is checked 
4. Copy the 'Plugin API Key'
5. Open the browser console and run the following command to get the `accountId` of the accounts you want to import: 

‼️ **Remember to replace `API_KEY` with the key that you copied in step 4** ‼️ 
```javascript
const exportData = await window.projectionlabPluginAPI.exportData({ key: 'API_KEY' });

// Get the list of savings accounts
for (let acct of exportData.today.savingsAccounts) {
    console.log(acct.id, acct.name)
}

// Get the list of investment accounts
for (let acct of exportData.today.investmentAccounts) {
    console.log(acct.id, acct.name)
}

// Get the list of assets accounts
for (let acct of exportData.today.assets) {
    console.log(acct.id, acct.name)
}

// get the list of liabilities accounts
for (let acct of exportData.today.debts) {
    console.log(acct.id, acct.name)
}
```

Copy the list of `accountId` and `accountName` for the accounts you want to import from the browser console.

### Step 2: Get the corresponding `accountId` from Monarch Money
‼️ **You need to do this step only once** ‼️ 
1. Install the node packages by running `npm install` in the terminal.
2. Open 'config.js' and replace `email` and `password` with your Monarch credentials.
3. In the 'config.js' file, replace `projection_Labs_api_key` with the key that you copied in step 4 above.
3. Run `node get-accounts.js` in the terminal.

Copy the list of Monarch `id` for the accounts you want to import.

### Step 3: Update the mapping of Monarch ID and ProjectionLabs accountId `config.js` file
‼️ **You need to do this step only once** ‼️ 
1. Open 'config.js' and update the `accountMapping` object with the Monarch `monarchAccountID` and ProjectionLabs `plAccountID` that you want to import.

### Step 4: Get the script to import data into ProjectionLab
1. Run `node index.js` to get script that you can use in ProjectionLab.
2. Copy the script and paste it in the browser console of ProjectionLab.