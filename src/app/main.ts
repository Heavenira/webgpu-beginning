import * as gameOfLife from './gameOfLife';
import * as initial from './initializeShader';

async function main() {
    await gameOfLife.gameOfLife();
}

main(); 