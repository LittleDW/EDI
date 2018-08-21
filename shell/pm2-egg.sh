#!/bin/bash
pm2 describe edi > /dev/null
RUNNING=$?

cd /data/edi
git pull
yarn install
yarn build:dev
if [ "${RUNNING}" -ne 0 ]; then
  pm2 start ecosystem.config.js --env egg
else
  pm2 reload edi --env egg
fi;
