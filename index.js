import {projection_Labs_api_key, accountMapping, monarchCredentials} from './config.js'
import {generateSyncCommands} from './common.js';

async function main() {
    const commands = await generateSyncCommands(projection_Labs_api_key, monarchCredentials, accountMapping);
    commands.forEach(cmd => console.log(cmd));
}

main().catch(error => console.error('Error in main function:', error));
