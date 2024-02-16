import express from 'express';
import getMonarchAccounts from './get-monarch-accounts.js';

import path from 'path';
import { URL } from 'url';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // res.send('Hello World!');
    const currentDir = new URL('.', import.meta.url).pathname;
    res.sendFile(path.join(currentDir, '/index.html'));
});

app.post('/api/get-monarch-accounts', async (req, res) => {

    const accounts = await getMonarchAccounts();
    console.log(accounts);
    res.send(accounts);
});

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
})