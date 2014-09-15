<?php
return array(
    'params' => array(
//        'soapService' => 'http://localhost:52282/Directory.asmx?WSDL',
        'soapSecurityKey' => 'protected_password',
        'soapService' => 'http://93.153.204.246:7001/Directory.asmx?WSDL',
//        'soapService' => 'http://192.168.0.21:7001/Directory.asmx?WSDL',
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

