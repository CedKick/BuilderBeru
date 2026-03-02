module.exports = {
  apps: [{
    name: 'expedition',
    script: 'src/index.js',
    cwd: '/opt/manaya-raid/expedition-server',
    node_args: '--experimental-vm-modules',
    env: {
      NODE_ENV: 'production',
      PORT: 3004,
    },
    watch: false,
    max_memory_restart: '500M',
    error_file: '/opt/manaya-raid/expedition-server/logs/error.log',
    out_file: '/opt/manaya-raid/expedition-server/logs/output.log',
    merge_logs: true,
  }],
};
