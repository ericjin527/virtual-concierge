// Worker stub — Week 1 only.
// Redis and BullMQ are NOT wired up yet.
// Background jobs are handled synchronously via the API with a jobs table placeholder.

console.log('Worker starting (stub mode — no queue wired up in week 1)');

process.on('SIGTERM', () => {
  console.log('Worker shutting down');
  process.exit(0);
});
