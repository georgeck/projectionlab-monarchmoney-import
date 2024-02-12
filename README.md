# Introduction
Here are some scripts to help you import data from [Monarch Money](https://monarchmoney.com) into [ProjectionLab](https://projectionlab.com/).

### Step 1: Set up ProjectionLab to use the plugin API
1. Login to [ProjectionLab](https://projectionlab.com) and go to Account Settings on the top right.
2. Open [Plugins page](https://app.projectionlab.com/settings/plugins)
3. Enable the switch '**Enable Plugins**'.
4. Copy the value in the text box '**Plugin API Key**'. (From now on, this key will be referred to as `YOUR_PL_API_KEY`.)

### Step 2: Get the `accountId` of ProjectionLab accounts that you want to import
1. Open the Developer Console of your browser and run the following script that gives you the `id` and `name` of the accounts. 

‼️ **Remember to replace `YOUR_PL_API_KEY` with the key that you copied in step 1.4 above** ‼️ 
```javascript
const exportData = await window.projectionlabPluginAPI.exportData({ key: 'YOUR_PL_API_KEY' });

// Merge the list of savings accounts, investment accounts, assets and debts
const plAccounts = [...exportData.today.savingsAccounts, ...exportData.today.investmentAccounts,
                    ...exportData.today.assets, ...exportData.today.debts]

plAccounts.map(account => {
    console.log(account.id, account.name)
})
```

2. The browser console will display the id and name of your accounts in ProjectionLab.
3. Copy the list of `account.id` and `account.name` of those accounts.

### Step 2: Get the corresponding `accountId` from Monarch Money
‼️ **You need to do this step only once** ‼️ 
1. Open the file 'config.js' and replace `monarch_email` and `monarch_password` with your Monarch credentials.
2. Open terminal and install the node packages by running `npm install`.
3. Run `node get-monarch-accounts.js` in the terminal.
   
1. The terminal will display the list of Monarch accounts with their `id` and `name`. 
2. Copy the list of the `id`s of the accounts you want to import.

### Step 3: Update the mapping of Monarch ID and ProjectionLabs accountId `config.js` file
‼️ **You need to do this step only once** ‼️ 
1. Open the file 'config.js'
2. Replace `YOUR_PL_API_KEY` with the key that you copied in step 1.4 above.
3. Update the `accountMapping` array with the corresponding `id`s of Monarch accounts and ProjectLab accounts - Monarch id in `monarchAccountID` and ProjectionLabs id in `plAccountID`.

### Step 4: Get the script to import data into ProjectionLab
1. Run `node index.js` to get the script that you can use in ProjectionLab.
2. Copy the script from the terminal output
3. Open browser's developer console of the ProjectionLab browser and paste the above script and hit Enter

The accounts in the ProjectionLab will be updated with the new values. Congratulations! You did it!
