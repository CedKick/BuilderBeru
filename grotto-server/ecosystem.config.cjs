module.exports = {
  apps: [{
    name: 'grotto',
    script: 'src/index.js',
    cwd: '/opt/manaya-raid/grotto-server',
    env: {
      NODE_ENV: 'production',
      PORT: 3006,
    },
    watch: false,
    max_memory_restart: '400M',
    error_file: '/opt/manaya-raid/grotto-server/logs/error.log',
    out_file: '/opt/manaya-raid/grotto-server/logs/output.log',
    merge_logs: true,
  }],
};
