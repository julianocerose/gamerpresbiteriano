import fs from 'fs';
import path from 'path';

const inputPath = path.resolve('path_xy_corrigido.txt');
const outputPath = path.resolve('src/utils/pathData.ts');

try {
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: ${inputPath} not found.`);
        process.exit(1);
    }

    console.log(`Reading from ${inputPath}...`);
    const input = fs.readFileSync(inputPath, 'utf8');
    const lines = input.trim().split('\n');

    const maxScore = 1000;
    const pathData = new Array(maxScore + 1).fill(null);

    lines.forEach(line => {
        const parts = line.trim().split(',');
        if (parts.length >= 3) {
            const score = parseInt(parts[0], 10);
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);

            if (!isNaN(score) && score >= 0 && score <= maxScore) {
                pathData[score] = [x, y];
            }
        }
    });

    // Simple linear interpolation for missing scores
    for (let i = 0; i <= maxScore; i++) {
        if (pathData[i] === null) {
            pathData[i] = i > 0 ? pathData[i - 1] : [0, 0];
        }
    }

    const fileContent = `// Auto-generated from path_xy_corrigido.txt
export const PATH_DATA: [number, number][] = ${JSON.stringify(pathData, null, 2)};
`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully updated ${outputPath}`);

} catch (err) {
    console.error('Failed to update path data:', err);
    process.exit(1);
}
