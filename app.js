import express from 'express';
import getMonarchAccounts from './get-monarch-accounts.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/get-monarch-accounts', async (req, res) => {

    const accounts = await getMonarchAccounts();
    console.log(accounts);
    res.send(accounts);
});

app.listen(port, () => {
    console.log(`ProjectionLab-Monarch connector running at http://localhost:${port}`);
})