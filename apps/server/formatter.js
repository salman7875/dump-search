import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const inputPath = path.join(__dirname, 'sherlock-holmes.txt');
    const outputPath = path.join(__dirname, 'sherlock-holmes_formated.txt');

    const data = await fs.readFile(inputPath, 'utf-8');

    const cleanedData = data.replace(/(\r?\n){2,}/g, '\n\n');

    await fs.writeFile(outputPath, cleanedData, 'utf-8');

    console.log('Elementary! The spacing has been fixed.');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();
