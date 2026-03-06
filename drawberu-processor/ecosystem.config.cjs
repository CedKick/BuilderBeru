module.exports = {
  apps: [{
    name: 'drawberu-processor',
    script: '/opt/drawberu-processor/venv/bin/gunicorn',
    args: '--bind 0.0.0.0:3006 --workers 2 --timeout 120 --max-requests 100 app:app',
    cwd: '/opt/drawberu-processor',
    interpreter: 'none',
    env: {
      PORT: 3006,
    },
    max_memory_restart: '512M',
    restart_delay: 5000,
  }]
};
