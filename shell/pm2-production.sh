#!/bin/bash
pm2 describe edi > /dev/null
RUNNING=$?

cd /data/node-mysql
git pull
yarn install
yarn build:prod
if [ "${RUNNING}" -ne 0 ]; then
  pm2 start ecosystem.config.js --env production
else
  pm2 reload edi --env production
fi;
