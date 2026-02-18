import express from 'express';
import path from 'path';
import {URL} from 'url';
import {getMonarchAccounts} from "./common.js";
import fs from 'fs/promises';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    const currentDir = new URL('.', import.meta.url).pathname;
    res.sendFile(path.join(currentDir, '/index.html'));
});

app.post('/api/get-monarch-accounts', async (req, res) => {
    try {
        const {monarchCredentials} = req.body;
        const accounts = await getMonarchAccounts(monarchCredentials);
        res.json(accounts);
    } catch (error) {
        console.error(`getMonarchAccounts() returned error ${error}`);
        res.status(400).json({errorDetail: error.message});
    }
});

app.get('/api/get-config', async (req, res) => {
    try {
        const configPath = new URL('config.js', import.meta.url).pathname;
        const configContent = await fs.readFile(configPath, 'utf8');

        const apiKeyMatch = configContent.match(/const projection_Labs_api_key = "(.*?)"/);
        const emailMatch = configContent.match(/monarch_email: "(.*?)"/);
        const passwordMatch = configContent.match(/monarch_password: "(.*?)"/);
        const mfaMatch = configContent.match(/monarch_mfa: "(.*?)"/);
        const deviceUuidMatch = configContent.match(/device_uuid: "(.*?)"/);

        // Parse accountMapping entries from config.js
        const accountMapping = [];
        const mappingRegex = /plAccountID:\s*"(.*?)"[\s\S]*?monarchAccountID:\s*"(.*?)"[\s\S]*?plDisplayName:\s*"(.*?)"/g;
        let match;
        while ((match = mappingRegex.exec(configContent)) !== null) {
            accountMapping.push({
                plAccountID: match[1],
                monarchAccountID: match[2],
                plDisplayName: match[3]
            });
        }

        res.json({
            projection_Labs_api_key: apiKeyMatch ? apiKeyMatch[1] : '',
            monarchCredentials: {
                monarch_email: emailMatch ? emailMatch[1] : '',
                monarch_password: passwordMatch ? passwordMatch[1] : '',
                monarch_mfa: mfaMatch ? mfaMatch[1] : '',
                device_uuid: deviceUuidMatch ? deviceUuidMatch[1] : ''
            },
            accountMapping
        });
    } catch (error) {
        console.error('Error reading config:', error);
        res.status(500).json({message: 'Failed to read configuration'});
    }
});

app.post('/api/save-complete-config', async (req, res) => {
    try {
        const {projection_Labs_api_key, monarchCredentials, accountMapping} = req.body;

        if (!projection_Labs_api_key || !monarchCredentials || !accountMapping) {
            return res.status(400).json({message: 'Missing required configuration values'});
        }

        const configPath = new URL('config.js', import.meta.url).pathname;

        // Backup existing config
        try {
            const existingConfig = await fs.readFile(configPath, 'utf8');
            await fs.writeFile(`${configPath}.backup`, existingConfig, 'utf8');
        } catch {
            console.log('No existing config to backup');
        }

        // Parse existing mapping order from config.js so we can preserve it
        const existingEntries = [];
        try {
            const existingContent = await fs.readFile(configPath, 'utf8');
            const entryRegex = /plAccountID:\s*"(.*?)"[\s\S]*?monarchAccountID:\s*"(.*?)"/g;
            let m;
            while ((m = entryRegex.exec(existingContent)) !== null) {
                existingEntries.push({plAccountID: m[1], monarchAccountID: m[2]});
            }
        } catch {
            // No existing config, order doesn't matter
        }

        // Sort: existing entries keep their position, new entries go to the end
        // Match by monarchAccountID first, fall back to plAccountID (handles re-linked accounts)
        const orderedMapping = [];
        const used = new Set();

        for (const existing of existingEntries) {
            const match = accountMapping.find(m =>
                !used.has(m) &&
                (m.monarchAccountID === existing.monarchAccountID || m.plAccountID === existing.plAccountID)
            );
            if (match) {
                orderedMapping.push(match);
                used.add(match);
            }
        }
        for (const mapping of accountMapping) {
            if (!used.has(mapping)) {
                orderedMapping.push(mapping);
            }
        }

        // Generate config.js
        let configContent = `const projection_Labs_api_key = "${projection_Labs_api_key}";\n\n`;

        configContent += `const monarchCredentials = {\n`;
        configContent += `    monarch_email: "${monarchCredentials.monarch_email}",\n`;
        configContent += `    monarch_password: "${monarchCredentials.monarch_password}",\n`;
        configContent += `    monarch_mfa: "${monarchCredentials.monarch_mfa}",\n`;
        configContent += `    device_uuid: "${monarchCredentials.device_uuid}"\n`;
        configContent += `}\n\n`;

        configContent += `// Create an object array to store ProjectionLab account, monarchAccountID,and balance\n`;
        configContent += `// Create a record for each account you want to update\n`;
        configContent += `let accountMapping = [\n`;

        orderedMapping.forEach(mapping => {
            configContent += `    {\n`;
            configContent += `        plAccountID: "${mapping.plAccountID}",\n`;
            configContent += `        monarchAccountID: "${mapping.monarchAccountID}",\n`;
            configContent += `        plDisplayName: "${mapping.plDisplayName}"\n`;
            configContent += `    },\n`;
        });

        configContent += `];\n\nexport {projection_Labs_api_key, monarchCredentials, accountMapping};\n`;

        await fs.writeFile(configPath, configContent, 'utf8');

        res.json({message: 'Configuration saved successfully!'});
    } catch (error) {
        console.error('Error saving configuration:', error);
        res.status(500).json({message: 'Failed to save configuration: ' + error.message});
    }
});

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
});
