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

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
})