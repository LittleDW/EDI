module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name: 'edi-socket',
      env: {
        NODE_ENV: "development",
        port: 6180
      },
      env_uat: {
        NODE_ENV: 'uat',
        port: 6180
      },
      env_egg: {
        NODE_ENV: 'development',
        port: 6180
      },
      env_production : {
        NODE_ENV: "production",
        port: 6180
      },
      "env_production-stlc" : {
        NODE_ENV: "production-stlc",
        port: 6180
      },
      env_staging : {
        NODE_ENV: "staging",
        port: 6180
      },
      script: "./server/socket.js", //程序入库
      cwd: "./",           //根目录
      watch:[
        "server"
      ],//需要监控的目录
      error_file:"./logs/pm2-socket-err.log",//错误输出日志
      out_file:"./logs/pm2-socket-out.log",  //日志
      log_date_format:"YYYY-MM-DD HH:mm Z", //日期格式,
    }
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
