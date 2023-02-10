module.exports = {
  apps: [{
    name: "broadcast-daemon",
    script: "./index.js",
    cron_restart: '30 * * * * *',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}