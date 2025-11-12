module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      ignore_watch: ['node_modules', '.env', '.git'],
      error_file: '.pm2/logs/backend-error.log',
      out_file: '.pm2/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
