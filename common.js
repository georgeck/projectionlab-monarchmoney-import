import {  monarchCredentials } from './config.js'

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
            supports_mfa: false
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    });
    if(response.ok) {
        let data = await response.json();
        return "Token " + data.token;
    }
}

export default login;