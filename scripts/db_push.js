const { loadEnvConfig } = require('@next/env');
const { execSync } = require('child_process');

// Load environment variables using Next.js loader
const projectDir = process.cwd();
loadEnvConfig(projectDir);

console.log('Running prisma db push with Next.js loaded env...');
try {
    execSync('npx prisma db push', { stdio: 'inherit' });
} catch (e) {
    console.error('Migration failed');
    process.exit(1);
}
