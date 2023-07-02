import { getPartTwo } from './partTwo';
import { initializeShader } from './initializeShader';

async function main() {
    initializeShader();
    const { encoder } = await getPartTwo();
    // Follow up with the actions you need to do 
}

main();