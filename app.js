import express from 'express';
import path from 'path';
import {URL} from 'url';
import {getMonarchAccounts} from "./common.js";
import fs from 'fs/promises';

const app = express();
const port = process.env.PORT || 3000;

// Add JSON body parser middleware
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    // res.send('Hello World!');
    const currentDir = new URL('.', import.meta.url).pathname;
    res.sendFile(path.join(currentDir, '/index.html'));
});

app.post('/api/get-monarch-accounts', async (req, res) => {
    try {
        const accounts = await getMonarchAccounts();
        res.send(accounts);
    } catch (error) {
        console.error(`getMonarchAccounts() returned error ${error}`);
        res.status(400).send({errorDetail: error.message});
    }
});

// Get current config values
app.get('/api/get-config', async (req, res) => {
    try {
        const configPath = new URL('config.js', import.meta.url).pathname;
        const configContent = await fs.readFile(configPath, 'utf8');

        // Parse values from the config file (simple approach)
        const apiKeyMatch = configContent.match(/const projection_Labs_api_key = "(.*?)"/);
        const emailMatch = configContent.match(/monarch_email: "(.*?)"/);
        const passwordMatch = configContent.match(/monarch_password: "(.*?)"/);
        const mfaMatch = configContent.match(/monarch_mfa: "(.*?)"/);
        const deviceUuidMatch = configContent.match(/device_uuid: "(.*?)"/);

        const config = {
            projection_Labs_api_key: apiKeyMatch ? apiKeyMatch[1] : '',
            monarchCredentials: {
                monarch_email: emailMatch ? emailMatch[1] : '',
                monarch_password: passwordMatch ? passwordMatch[1] : '',
                monarch_mfa: mfaMatch ? mfaMatch[1] : '',
                device_uuid: deviceUuidMatch ? deviceUuidMatch[1] : ''
            }
        };

        res.json(config);
    } catch (error) {
        console.error('Error reading config:', error);
        res.status(500).json({ message: 'Failed to read configuration' });
    }
});

// Update config values
app.post('/api/update-config', async (req, res) => {
    try {
        const {projection_Labs_api_key, monarchCredentials} = req.body;

        if (!projection_Labs_api_key || !monarchCredentials) {
            return res.status(400).json({message: 'Missing required configuration values'});
        }

        const configPath = new URL('config.js', import.meta.url).pathname;
        const configContent = await fs.readFile(configPath, 'utf8');

        // Create a backup of the original config file
        await fs.writeFile(`${configPath}.backup`, configContent, 'utf8');

        // Generate the updated config file content
        const updatedConfig = `const projection_Labs_api_key = "${projection_Labs_api_key}";

        const monarchCredentials = {
            monarch_email: "${monarchCredentials.monarch_email}",
            monarch_password: "${monarchCredentials.monarch_password}",
            monarch_mfa: "${monarchCredentials.monarch_mfa}",
            device_uuid: "${monarchCredentials.device_uuid}"
        }

        // Preserve the existing accountMapping section
        ${configContent.substring(configContent.indexOf('// Create an object array'))}`;

        // Write the updated content back to config.js
        await fs.writeFile(configPath, updatedConfig, 'utf8');

        res.json({message: 'Configuration updated successfully'});
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({message: 'Failed to update configuration: ' + error.message});
    }
});

app.post('/api/get-pl-accounts', async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ message: 'API key is required' });
        }

        // Here you would typically call the ProjectionLab API
        // For now, we'll return a mock response
        // You'd need to implement this with actual API calls

        // Mock data for demonstration
        const mockAccounts = [
            { id: '3579286d-4257-4c88-9170-e4d01ea66ee9', name: 'Intuit RSU ESPP - George' },
            { id: 'a76fc99e-9230-466d-8138-bd8273f1ad46', name: 'Intuit RSU ESPP - Ann' },
            { id: '7693896b-0b33-4c32-9fdf-e0dc6dc018d0', name: 'Individual eTrade - George' }
            // Add more mock accounts as needed
        ];

        res.json(mockAccounts);
    } catch (error) {
        console.error('Error getting ProjectionLab accounts:', error);
        res.status(500).json({ message: 'Failed to get ProjectionLab accounts: ' + error.message });
    }
});

// Save complete configuration
app.post('/api/save-complete-config', async (req, res) => {
    try {
        const { projection_Labs_api_key, monarchCredentials, accountMapping } = req.body;

        if (!projection_Labs_api_key || !monarchCredentials || !accountMapping) {
            return res.status(400).json({ message: 'Missing required configuration values' });
        }

        const configPath = new URL('config.js', import.meta.url).pathname;

        // Create a backup of the existing config
        try {
            const existingConfig = await fs.readFile(configPath, 'utf8');
            await fs.writeFile(`${configPath}.backup`, existingConfig, 'utf8');
        } catch (err) {
            console.log('No existing config to backup');
        }

        // Generate the new config file content
        let configContent = `const projection_Labs_api_key = "${projection_Labs_api_key}";\n\n`;

        configContent += `const monarchCredentials = {
    monarch_email: "${monarchCredentials.monarch_email}",
    monarch_password: "${monarchCredentials.monarch_password}",
    monarch_mfa: "${monarchCredentials.monarch_mfa}",
    device_uuid: "${monarchCredentials.device_uuid}"
}\n\n`;

        configContent += `// Create an object array to store ProjectionLab account, monarchAccountID,and balance
// Create a record for each account you want to update
let accountMapping = [\n`;

        accountMapping.forEach(mapping => {
            configContent += `    {
        plAccountID: "${mapping.plAccountID}",
        monarchAccountID: "${mapping.monarchAccountID}",
        plDisplayName: "${mapping.plDisplayName}"
    },\n`;
        });

        configContent += `];\n\nexport {projection_Labs_api_key, monarchCredentials, accountMapping};`;

        // Write the new config file
        await fs.writeFile(configPath, configContent, 'utf8');

        // Also save as JSON for reference
        const jsonConfig = JSON.stringify({
            projection_Labs_api_key,
            monarchCredentials,
            accountMapping
        }, null, 2);

        await fs.writeFile('config.json', jsonConfig, 'utf8');

        res.json({ message: 'Configuration saved successfully!' });
    } catch (error) {
        console.error('Error saving configuration:', error);
        res.status(500).json({ message: 'Failed to save configuration: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
})