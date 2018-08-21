curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -

sudo yum -y install nodejs

sudo yum install -y gcc-c++ make

curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo

sudo yum install -y yarn

npm config set registry https://registry.npm.taobao.org

npm install pm2 -g

pm2 install pm2-intercom

cd /data/

git clone git@gitlab.dataengine.com:shiqifeng/node-mysql.git

cd node-mysql

yarn install
