import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [16, 48, 128];
const input = 'master-icon.png';
const publicIconsDir = 'public/icons';

// Ensure public/icons exists
if (!fs.existsSync(publicIconsDir)) {
    fs.mkdirSync(publicIconsDir, { recursive: true });
}

async function generate() {
    if (!fs.existsSync(input)) {
        console.error(`❌ Master icon not found at: ${input}`);
        process.exit(1);
    }

    console.log('🎨 Generating icons...');
    
    for (const size of sizes) {
        try {
            await sharp(input)
                .resize(size, size)
                .toFile(path.join(publicIconsDir, `icon${size}.png`));
            console.log(`✅ Generated ${size}x${size}`);
        } catch (err) {
            console.error(`❌ Error generating ${size}x${size}:`, err);
        }
    }
}

generate();
