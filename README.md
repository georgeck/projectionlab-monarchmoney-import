## Import your Monarch Money account data into ProjectionLab
Updates your [ProjectionLab](https://projectionlab.com/) account balances with the latest data from [Monarch Money](https://monarch.com).

### How it Works
1. **Connects to APIs**: Scripts communicate with both Monarch Money and ProjectionLab's Plugin API.
2. **Fetches Monarch Data**: Your Monarch Money account balances are directly downloaded to your machine.
3. **Updates ProjectionLab**: The project updates your ProjectionLab account information using the `updateAccount()` [Plugin API](https://app.projectionlab.com/docs/module-PluginAPI.html#.updateAccount).

There are two ways to use this project:
- **Web UI** (recommended) — a guided setup wizard that walks you through configuration and account mapping
- **CLI** — run scripts directly from the terminal

### Getting Started

#### Prerequisites
- [Node.js](https://nodejs.org/) installed
- Your Monarch Money account credentials
- Your ProjectionLab Plugin API key
- Basic familiarity with your browser's developer console

#### Installation
```bash
git clone https://github.com/georgeck/projectionlab-monarchmoney-import.git
cd projectionlab-monarchmoney-import
npm install
cp config.example.js config.js
```

### Option A: Web UI (Recommended)

The web UI guides you through a 3-step wizard to configure credentials, fetch accounts, and map them.

```bash
npm start
```

Open http://localhost:3000 in your browser. The wizard will walk you through:

#### Step 1: ProjectionLab Setup
1. Enter your ProjectionLab Plugin API key (Account Settings > Plugins > Plugin API Key).
2. Copy the generated browser console snippet.
3. Open [ProjectionLab](https://app.projectionlab.com) in your browser, open the developer console (F12), paste the snippet and press Enter. Your accounts will be copied to your clipboard.
4. Paste the JSON result back into the text area and click **Load Accounts**.

#### Step 2: Monarch Credentials
1. Enter your Monarch Money email and password.
2. If you use MFA, enter the TOTP secret (the 30+ character code shown when you set up MFA, not the 6-digit code).
3. Enter a Device UUID (or click **Generate UUID** to create one).
4. Click **Fetch Monarch Accounts** to verify your credentials and retrieve your accounts.

#### Step 3: Account Mapping
1. For each Monarch account, select the corresponding ProjectionLab account from the dropdown (or select "— Skip —" to exclude it).
2. Click **Save Configuration** to write your `config.js` file.

#### Syncing Balances
Once configured, sync your balances anytime by running:
```bash
npm run get-latest
```
This prints a set of JavaScript commands. Copy the output, open ProjectionLab's browser developer console (F12), paste it and press Enter. Your account balances will be updated.

![Browser Developer Console](images/developer-console.png)

---

### Option B: CLI Setup

If you prefer to configure everything manually without the web UI:

#### Step 0: Backup your current data in ProjectionLab
Since this will modify ProjectionLab's application data, back up first (Account Settings > Export Data).

#### Step 1: Set up ProjectionLab to use the Plugin API
1. Login to [ProjectionLab](https://projectionlab.com) and go to Account Settings.
2. Open Plugins page (Account Settings > Plugins).
3. Enable the switch **Enable Plugins**.
4. Copy the **Plugin API Key**.

#### Step 2: Configure your credentials
1. Copy `config.example.js` to `config.js` (if you haven't already).
2. Open `config.js` and fill in your Monarch credentials (`monarch_email`, `monarch_password`).
3. If you use MFA, set `monarch_mfa` to your TOTP secret.
4. Set `device_uuid` to any valid UUID.
5. Set `projection_Labs_api_key` to the Plugin API key from step 1.

#### Step 3: Get your ProjectionLab account IDs
Open the ProjectionLab developer console and run:
```javascript
const exportData = await window.projectionlabPluginAPI.exportData({ key: 'YOUR_PL_API_KEY' });
const plAccounts = [...exportData.today.savingsAccounts, ...exportData.today.investmentAccounts,
                    ...exportData.today.assets, ...exportData.today.debts];
plAccounts.forEach(account => console.log(account.id, account.name));
```

#### Step 4: Get your Monarch Money account IDs
```bash
npm run getMonarchAccounts
```

#### Step 5: Update the account mapping in `config.js`
Add entries to the `accountMapping` array pairing each Monarch account ID with its ProjectionLab account ID:
```javascript
let accountMapping = [
    {
        plAccountID: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        monarchAccountID: "123456789012345678",
        plDisplayName: "My Account Name"
    },
];
```

#### Step 6: Sync balances
```bash
npm run get-latest
```
Copy the output, paste it into ProjectionLab's browser developer console (F12) and press Enter. Each time you want to update balances, just repeat this step.

![Browser Developer Console](images/developer-console.png)

---

### Security
- `config.js` contains your credentials and is **gitignored** — it will never be committed.
- `config.example.js` is the committed template with placeholder values.
- If you use the web UI, a backup (`config.js.backup`) is created before each save.

### Contributing
Contributions are welcome!
