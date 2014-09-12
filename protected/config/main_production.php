<?php
return array(
    'params' => array(
//        'soapService' => 'http://localhost:52282/Directory.asmx?WSDL',
        'soapSecurityKey' => 'test6543210',
        'soapService' => 'http://192.168.0.21:7001/Directory.asmx?WSDL',
//        'proxy' => [],
        'proxy' => [
//            'proxy_host'     => "192.168.0.10",
//            'proxy_port'     => 3128
        ],
    ),
    'modules' => array(
        'gii' => array(
            'class' => 'system.gii.GiiModule',
            'password' => '1',
            // 'ipFilters'=>array(…список IP…),
            // 'newDirMode'=>0777,
        ),
    ),
);

