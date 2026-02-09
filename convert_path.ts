import fs from 'fs';
import path from 'path';

try {
    const inputPath = path.resolve('path_xy.txt');
    const outputPath = path.resolve('src/utils/pathData.ts');

    console.log(`Reading from ${inputPath}`);
    const input = fs.readFileSync(inputPath, 'utf8');
    const lines = input.trim().split('\n');

    // Sort just in case, though file seems sorted
    // Parse lines: score,x,y
    // We want an array where index = score

    // Create an array of size 1001 filled with [0,0]
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

    // Fill gaps if any (though instructions say "Cada linha contém...", assuming complete)
    // Actually, "path_xy.txt" example: 0...1000.
    // If any are null, we might default to previous or 0,0. 
    // Let's assume completeness based on file preview.
    // Check for nulls
    for (let i = 0; i <= maxScore; i++) {
        if (pathData[i] === null) {
            console.warn(`Missing data for score ${i}, filling with 0,0 or previous`);
            pathData[i] = i > 0 ? pathData[i - 1] : [0, 0];
        }
    }

    const fileContent = `// Auto-generated from path_xy.txt
export const PATH_DATA: [number, number][] = ${JSON.stringify(pathData, null, 2)};
`;

    // Ensure dir exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully wrote ${outputPath}`);

} catch (err) {
    console.error('Error converting path data:', err);
    process.exit(1);
}
