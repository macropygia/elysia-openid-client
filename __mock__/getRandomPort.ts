export function getRandomPort() {
  const server = Bun.serve({
    fetch() {
      return new Response("Bun!");
    },
    port: 0,
  });
  const currentPort = server.port;
  server.stop();
  return currentPort;
}
