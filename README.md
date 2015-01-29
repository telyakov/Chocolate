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

