module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name: 'edi-fund',
      env: {
        NODE_ENV: "development",
        port: 80
      },
      env_uat: {
        NODE_ENV: 'uat',
        port: 8081
      },
      env_egg: {
        NODE_ENV: 'development',
        port: 8083
      },
      env_production : {
        NODE_ENV: "production"
      },
      env_staging : {
        NODE_ENV: "staging"
      },
      script: "./server/index.js", //程序入库
      cwd: "./",           //根目录
      watch:[
        "server"
      ],//需要监控的目录
      error_file:"./logs/pm2-err.log",//错误输出日志
      out_file:"./logs/pm2-out.log",  //日志
      log_date_format:"YYYY-MM-DD HH:mm Z", //日期格式,
      instances  : "max",
      exec_mode  : "cluster"
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'root',
      host : '101.201.77.131',
      ref  : 'origin/master',
      repo : 'git@gitlab.dataengine.com:shiqifeng/node-mysql.git',
      path : '/data/node-mysql',
      'post-deploy' : 'yarn install && pm2 reload ecosystem.config.js --env production'
    },
    uat : {
      user : 'root',
      host : '59.110.18.30',
      ref  : 'origin/dev',
      repo : 'git@gitlab.dataengine.com:shiqifeng/node-mysql.git',
      path : '/data/node-edi',
      'post-deploy' : 'yarn install && pm2 reload ecosystem.config.js --env uat',
      env  : {
        NODE_ENV: 'uat'
      }
    }
  }
};
