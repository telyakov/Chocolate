<h1>TroubleShooting</h1>
(1). Не работает WebSocket Server
WebSocket = milkyWay(https://github.com/tselishev-semen/MilkyWay)
Подключение через ssh 192.168.0.34 (~centos7)
login: root
password: 000000

# cd /websocket
# mvn clean install - компилирует java сервер
# mvn exec:exec (перед запуском подождать ~ 30сек) - запускает
нажать ctrl+z - остановить процесс

Две команды для запуска во внешнем потоке
# disown -h %1 - где 1 id запущенного процесса, обычно 1.
# bg 1 - где 1 id запущенного процесса, обычно 1.

(2). Как перезагрузить WebSocket Server
# ps aux (найти id процесса с  java -classpath /websocket/target (2 столбце слева))
# sudo kill -9 id  (id - id найденного процесса)
Повторить шаги из (1):

Возможные проблемы:
Занят 3000 порт - просто подождать


(3) Упал nginx + php-fm Сервер или требуется его перезапуск
sudo /etc/init.d/php-fpm restart - перезапустить PHP
sudo service nginx restart - запустить nginx

http://www.phphighload.com/2012/08/blog-post.html
http://vladimir-stupin.blogspot.ru/2014/08/nginx-php5-fpm-uwsgi.html
http://pektop.net/2013/09/sovety-po-nastrojke-i-optimizacii-nginx-i-php-fpm/
http://tweaked.io/guide/nginx/

http://otvety.google.ru/otvety/thread?tid=790bc4491da13a6f

ВАЖНО  http://www.cyberciti.biz/tips/linux-unix-bsd-nginx-webserver-security.html
https://code.google.com/p/sna/wiki/NginxWithPHPFPM
