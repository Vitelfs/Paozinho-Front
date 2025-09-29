module.exports = {
  apps: [
    {
      name: 'paozinho-frontend-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/vitel/sistema-paozinho/Paozinho-Front',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5175
      },
      log_file: '/home/vitel/logs/paozinho-frontend-dev.log',
      out_file: '/home/vitel/logs/paozinho-frontend-dev-out.log',
      error_file: '/home/vitel/logs/paozinho-frontend-dev-error.log',
      time: true
    }
  ]
};
