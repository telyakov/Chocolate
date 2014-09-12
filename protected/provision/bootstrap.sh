#!/usr/bin/env bash
# disable firewall
sudo chkconfig iptables off
sudo service iptables stop

sudo yum install -y httpd-2.2.15
sudo yum install -y git
sudo yum install -y vim

#apache settings
sudo rm -rf /var/www
sudo mkdir /var/www
sudo ln -fs /vagrant/ /var/www/
sudo cp /vagrant/protected/provision/httpd.conf /etc/httpd/conf/httpd.conf

#install php
sudo rpm -Uvh http://mirror.webtatic.com/yum/el6/latest.rpm
cd /etc/yum.repos.d
sudo wget http://rpms.famillecollet.com/enterprise/remi.repo
sudo yum --enablerepo=remi-php55 install -y php55w
sudo yum --enablerepo=remi-php55 install -y php-soap
sudo yum --enablerepo=remi-php55 install -y php-mbstring
sudo yum --enablerepo=remi-php55 install -y php-devel
sudo pecl install SPL_Types
sudo pecl install Xdebug
sudo cp /vagrant/protected/provision/php.ini /etc/php.ini

#restart apache
sudo chkconfig httpd on
sudo service httpd restart

#Install development tools(nodejs, composer, grunt, sass)
yum install -y \  http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
sudo yum install -y nodejs npm --enablerepo=epel
sudo gem install sass

#Install dependencies nodejs for grunt
sudo npm install -g grunt-cli
sudo npm install -g bower
sudo yum install-y freetype
sudo yum install-y fontconfig
sudo npm install -g phantomjs
sudo yum install -y java-1.6.0*

#Install composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

#Initialize project
cd /vagrant/protected
sudo npm install
cd /vagrant/protected
composer install --no-dev
cd /vagrant/protected
sudo grunt bower
grunt --force

