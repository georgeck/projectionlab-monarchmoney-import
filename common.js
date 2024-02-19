import { monarchCredentials } from './config.js'
import { authenticator } from 'otplib';

async function login() {
    let response = await fetch("https://api.monarchmoney.com/auth/login/", {
        "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9",
            "client-platform": "web",
            "content-type": "application/json",
        },
        "referrerPolicy": "no-referrer",
        "body": JSON.stringify({
            username: monarchCredentials.monarch_email,
            password: monarchCredentials.monarch_password,
            trusted_device: false,
            supports_mfa: !!monarchCredentials.monarch_mfa,
            totp: monarchCredentials.monarch_mfa ? authenticator.generate(monarchCredentials.monarch_mfa) : null
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });
    if (response.ok) {
        let data = await response.json();
        return "Token " + data.token;
    } else {
        const data = await response.json();
        const error = new Error(`Monarch login failed with server error: status=${response.status} ${response.statusText}. JSON=${JSON.stringify(data)}`);
        console.error(error);
        throw error;
    }
}

export default login;