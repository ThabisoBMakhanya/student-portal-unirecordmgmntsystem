const { createServer } = require('vite');
async function main() {
  const server = await createServer({
    configFile: './vite.config.ts',
    root: '.',
    server: { port: 3001, host: true }
  });
  await server.listen();
  console.log('Vite dev server running on http://localhost:3001');
}
main().catch(e => { console.error(e); process.exit(1); });
