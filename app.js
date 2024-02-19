import express from 'express';
import getMonarchAccounts from './get-monarch-accounts.js';

import path from 'path';
import {URL} from 'url';

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
})