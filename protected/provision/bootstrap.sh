#!/bin/sh
#for empty centos7
#sudo yum install -y wget
#sudo yum groupinstall "Development tools"

#nginx install from source
wget http://nginx.org/download/nginx-1.7.4.tar.gz
tar zxvf nginx-1.7.4.tar.gz
sudo yum install -y pcre-devel.x86_64
cd nginx-1.7.4
sudo yum install -y openssl-devel
./configure --user=nginx                \
--group=nginx                         \
--prefix=/etc/nginx                   \
--sbin-path=/usr/sbin/nginx           \
--conf-path=/etc/nginx/nginx.conf     \
--pid-path=/var/run/nginx.pid         \
--lock-path=/var/run/nginx.lock       \
--error-log-path=/var/log/nginx/error.log \
--http-log-path=/var/log/nginx/access.log \
--with-http_gzip_static_module        \
--with-http_stub_status_module        \
--with-http_ssl_module                \
--with-pcre                           \
--with-file-aio                       \
--with-http_realip_module             \
--without-http_scgi_module            \
--without-http_uwsgi_module
sudo make && sudo make install

#ngings settings
sudo useradd -r nginx
sudo cp /vagrant/protected/provision/nginx /etc/init.d/nginx
sudo chmod +x /etc/init.d/nginx
sudo chkconfig --add nginx
sudo chkconfig --level 345 nginx on
sudo cp  /vagrant/protected/provision/nginx.conf /etc/nginx/nginx.conf

#install php dependencies
sudo yum install -y \   http://dl.fedoraproject.org/pub/epel/beta/7/x86_64/epel-release-7-1.noarch.rpm
sudo yum install -y libxml2 libxml2-devel curl-devel libXpm-devel libc-client-devel bzip2 bzip2-devel bison re2c freetype-devel libmcrypt libmcrypt-devel

#for empty centos7
#mkdir /home/vagrant

php install from source
wget -O /home/vagrant/php-5.6.0.tar.gz http://ru2.php.net/get/php-5.6.0.tar.gz/from/this/mirror
sudo tar zxvf /home/vagrant/php-5.6.0.tar.gz
cd /home/vagrant/php-5.6.0
sudo ./configure --prefix=/opt/php-5.6.0 --with-openssl --with-zlib-dir \
--with-freetype-dir --enable-mbstring --with-libxml-dir=/usr --enable-soap \
--with-curl --with-mcrypt   \
--disable-rpath --enable-inline-optimization --enable-sockets \
--enable-sysvsem --enable-sysvshm --enable-pcntl --enable-mbregex \
--with-pcre-regex \
--with-fpm-group=www-data --with-libdir=/lib/x86_64-linux-gnu \
--enable-opcache --enable-fpm --enable-maintainer-zts
cd /home/vagrant/php-5.6.0
sudo make clean
sudo make && sudo make install

#php settings
sudo mkdir -p /etc/php
sudo cp /vagrant/protected/provision/php.ini /opt/php-5.6.0/lib/php.ini
sudo cp  /home/vagrant/php-5.6.0/sapi/fpm/init.d.php-fpm /etc/init.d/php-fpm
sudo chmod +x /etc/init.d/php-fpm
sudo chkconfig  php-fpm  on
sudo cp /vagrant/protected/provision/php-fpm.conf /opt/php-5.6.0/etc/php-fpm.conf
sudo groupadd www-data
sudo systemctl stop firewalld
sudo systemctl disable firewalld

#install Xdebug
sudo wget http://xdebug.org/files/xdebug-2.2.5.tgz
sudo tar -xzf xdebug-2.2.5.tgz
cd xdebug-2.2.5
sudo /opt/php-5.6.0/bin/phpize
sudo ./configure --enable-xdebug --with-php-config=/opt/php-5.6.0/bin/php-config
sudo make && sudo make install

#install SPL_Types
sudo wget http://pecl.php.net/get/SPL_Types-0.4.0.tgz
sudo tar -xzf SPL_Types-0.4.0.tgz
cd SPL_Types-0.4.0
sudo /opt/php-5.6.0/bin/phpize
sudo ./configure --with-php-config=/opt/php-5.6.0/bin/php-config
sudo make && sudo make install

#install pthreads
sudo /opt/php-5.6.0/bin/pecl install pthreads

#install memcached dependencies
sudo wget https://launchpad.net/libmemcached/1.0/1.0.16/+download/libmemcached-1.0.16.tar.gz
sudo tar xvzf libmemcached-1.0.16.tar.gz
cd libmemcached-1.0.16
sudo ./configure
sudo make && sudo make install

#instal php memcache module
sudo wget http://pecl.php.net/get/memcache-3.0.8.tgz
sudo tar -xzf memcache-3.0.8.tgz
cd memcache-3.0.8
sudo /opt/php-5.6.0/bin/phpize
sudo ./configure --with-php-config=/opt/php-5.6.0/bin/php-config
sudo make && sudo make install

#memcached service install && setting
sudo  yum install -y memcached
memcached -u memcached -d -m 30 -l 127.0.0.1 -p 11211
sudo chkconfig memcached on

#fixed for buzy port
#sudo fuser -k 80/tcp

#nginx + php-fpm start
sudo /etc/init.d/php-fpm restart
sudo service nginx restart

##Install development tools(nodejs, npm)
sudo yum install -y nodejs npm

#Install composer
curl -sS https://getcomposer.org/installer | /opt/php-5.6.0/bin/php
sudo mv composer.phar /usr/local/bin/composer
sudo npm install -g forever

install npm & composer dependencies
cd /vagrant/protected
sudo npm install --production
composer install --no-dev
forever start app.js

#comment in production
sudo yum install -y ruby
sudo gem install sass

#Install dependencies nodejs for grunt
sudo yum install-y freetype fontconfig
sudo npm install -g grunt-cli bower phantomjs
sudo yum install -y java-1.6.0*

#Initialize project
cd /vagrant/protected
sudo npm install
cd /vagrant/protected
sudo grunt bower
grunt --force



#maven install
sudo yum install -y java-1.7.0-openjdk-devel
cd
TEMPORARY_DIRECTORY="$(mktemp -d)"
DOWNLOAD_TO="$TEMPORARY_DIRECTORY/maven.tgz"
sudo wget -O "$DOWNLOAD_TO" http://www.eng.lsu.edu/mirrors/apache/maven/maven-3/3.1.1/binaries/apache-maven-3.1.1-bin.tar.gz
sudo tar xzf $DOWNLOAD_TO -C $TEMPORARY_DIRECTORY
sudo rm $DOWNLOAD_TO
sudo mv $TEMPORARY_DIRECTORY/apache-maven-* /usr/local/maven
sudo cp  /vagrant/protected/provision/maven.sh  /etc/profile.d/maven.sh
source /etc/profile.d/maven.sh
sudo rm -r "$TEMPORARY_DIRECTORY"

##
# cd /
# mkdir websoket


## MilkyWay install
cd /websocket
mvn clean install
mvn compile
mvn exec:exec
