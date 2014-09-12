<?
$currentDir = dirname(__FILE__);
/*
 * Yii loader
 */
require_once($currentDir . '/protected/vendor/yiisoft/yii/framework/YiiBase.php');
/**
 * Composer loader
 */
require_once($currentDir . '/protected/vendor/autoload.php');
//
class Yii extends YiiBase
{
    /**
     * @return WebApplication
     */
    public static function app()
    {
        return parent::app();
    }
}
// remove the following lines when in production mode
use Chocolate\Binding\BindingService;

class WebApplication extends CWebApplication
{
    /**
     * @var $erp Framework\DataBase\DataBaseAccessor
     */
    public $erp;
    /**
     * @var $user WebUser
     */
    public $user;
    /**
     * @var $bind BindingService
     */
    public $bind;
    /**
     * @var Chocolate\Cache\Cache
     */
    public $cache;
}

defined('YII_DEBUG') or define('YII_DEBUG', true);
define('CHOCOLATE_DEBUG', true);

// specify how many levels of call stack should be shown in each log message
defined('YII_TRACE_LEVEL') or define('YII_TRACE_LEVEL', 3);

Yii::createWebApplication($currentDir . '/protected/config/main.php')->run();
