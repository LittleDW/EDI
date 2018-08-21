#!/bin/bash
pm2 describe edi > /dev/null
RUNNING=$?

cd /data/node-edi
git pull
yarn install
yarn build:uat
if [ "${RUNNING}" -ne 0 ]; then
  pm2 start ecosystem.config.js --env uat
else
  pm2 reload edi --env uat
fi;
