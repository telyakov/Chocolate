<?php

// uncomment the following to define a path alias
// Yii::setPathOfAlias('local','path/to/local-folder');
//Yii::setPathOfAlias('bootstrap', dirname(__FILE__).'/../extensions/bootstrap');
Yii::setPathOfAlias('FrameWork', dirname(__FILE__) . '/../components/FrameWork');
Yii::setPathOfAlias('Chocolate', dirname(__FILE__) . '/../components/Chocolate');
Yii::setPathOfAlias('ClassModules', dirname(__FILE__) . '/../components/ClassModules');
Yii::setPathOfAlias('Rmk', dirname(__FILE__) . '/../vendor/rmk135/Rmk-Framework/library/Rmk');
Yii::setPathOfAlias('editable', dirname(__FILE__) . '/../extensions/x-editable');
//Yii::setPathOfAlias('dynatree', dirname(__FILE__) . '/../extensions/dynatree');

// This is the main Web application configuration. Any writable
// CWebApplication properties can be configured here.

return CMap::mergeArray(
    array(
        'basePath' => dirname(__FILE__) . DIRECTORY_SEPARATOR . '..',

        'name' => 'Шоколад',
        'sourceLanguage' => 'ru',
        // preloading 'log' component
        'preload' => array(
            'log',
            'booster'
        ),

        // autoloading model and component classes
        'import' => array(
            'application.models.*',
            'application.components.*',
        ),

        'theme' => 'bootstrap', // requires you to copy the theme under your themes directory
        'components' => array(
            'user' => array(
                'class' => 'WebUser',
                // enable cookie-based authentication
                'allowAutoLogin' => true,
            ),
            'booster' => array(
                'class' => 'application.vendor.clevertech.yii-booster.src.components.Booster',
            ),
            'erp' => array(
                'class' => '\FrameWork\DataBase\DataBaseAccessor',
            ),
            'session' => array(
                'autoStart' => true,
                'cookieMode' => 'allow',
                'cookieParams' => array(
                    'httponly' => true,
                    'sdl' => true
                ),
            ),
            'clientScript' => array(
                'scriptMap' => array(
                    'jquery.min.js' => false,
                    'jquery-ui.min.js' => false,
                    'select2.js' => false,
                    'select2.min.js' => false,
                    'bootstrap.min.js' => false,
                    'jquery.ba-bbq.min.js' => false,
                    'bootstrap-datetimepicker.js' => false,
                    'bootstrap-datetimepicker.min.js' => false, //??
                    'jquery.toggle.buttons.js' => false,
                    'jquery.yiigridview.js' => false,
                    'bootstrap-editable.js' => false,
                    'bootstrap-editable.min.js' => false,
                    'select2.css' => false,
                    'bootstrap-yii.css' => false,
                    'bootstrap-editable.css' => false,
                    'bootstrap.min.css' => false,
                    'jquery-ui-bootstrap.css' => false,
                    'bootstrap-noconflict.js' => false,
                    'bootbox.min.js' => false,
                    'notify.min.js' => false,
                    'bootstrap-toggle-buttons.css' => false,
                    'jquery.fileupload-ui.css' => false,
                    'datetimepicker.css' => false,
                    'jquery-ui.css' => false

                ),
            ),

            'urlManager' => array(
                'urlFormat' => 'path',
                'showScriptName' => false,
                'rules' => array(
                    '/' => 'site/index',
                    '<controller:\w+>/<id:\d+>' => '<controller>/view',
                    '<controller:\w+>/<action:\w+>/<id:\d+>' => '<controller>/<action>',
                    '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
                ),
            ),
            'errorHandler' => array(
                // use 'site/error' action to display errors
                'errorAction' => 'site/error',
            ),
            'log' => array(
                'class' => 'CLogRouter',
                'routes' => array(
                    array(
                        'class' => 'CFileLogRoute',
                        'levels' => 'error, warning, trace, info,profile',
                    ),
                    array(
                        'class' => 'CEmailLogRoute',
                        'levels' => 'error, warning',
                        'emails' => 'web_sem@mail.ru',
                    ),
                    array(
                        'class' => 'CFileLogRoute',
                        'categories' => 'webservice',
                        'levels' => 'error, warning, trace, info,profile',
                        'logFile' => 'db.log',
                    ),
                    // uncomment the following to show log messages on web pages

//				array(
//					'class'=>'CWebLogRoute',
//				),

                ),
            ),
        ),

        // application-level parameters that can be accessed
        // using Yii::app()->params['paramName']
        'params' => array(
            'adminEmail' => 'tselishchev@78stroy.ru',
            'date_form_soap_format' => 'd.m.Y H:i:s',

        ),
    ),
    require(dirname(__FILE__) . '/main_production.php'));