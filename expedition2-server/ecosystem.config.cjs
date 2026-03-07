module.exports = {
  apps: [{
    name: 'ragnaros',
    script: 'src/index.js',
    cwd: '/opt/manaya-raid/expedition2-server',
    node_args: '--experimental-vm-modules',
    env: {
      NODE_ENV: 'production',
      PORT: 3007,
    },
    watch: false,
    max_memory_restart: '300M',
    error_file: '/opt/manaya-raid/expedition2-server/logs/error.log',
    out_file: '/opt/manaya-raid/expedition2-server/logs/output.log',
    merge_logs: true,
  }],
};
