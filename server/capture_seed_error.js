
const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('npx', ['tsx', 'seed_tasks_pg.ts'], {
    shell: true,
    cwd: process.cwd()
});

const logStream = fs.createWriteStream('seed_error_full.txt');

child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
});
