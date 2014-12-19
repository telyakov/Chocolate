<?
/* @var $this SiteController */
?>
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8"/>
        <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible"/>
        <link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
        <link href="/css/libs/erp.css" rel="stylesheet">
        <link href="/css/main.css" rel="stylesheet">
        <? if (defined('CHOCOLATE_DEBUG')): ?>
            <script src="/js/erp.js"></script>
        <? else: ?>
            <script src="/js/erp.min.js"></script>
        <? endif; ?>
        <script src="/js/main.js"></script>
        <? echo CHtml::tag('title', [], Yii::app()->name) ?>
    </head>
    <body>
    <header id="header"></header>
    <div id="pagewrap">
        <ul id="gn-menu" class="gn-menu-main"></ul>
        <div id="content">
            <? echo $content; ?>
        </div>
    </div>
    <footer id="footer">
    </footer>
    </body>
    </html>
<?
$user = Yii::app()->user;
$name = $user->fullName;
$id = $user->id;
$employeeID = $user->employeeID;
Yii::app()->clientScript->registerScript('start', <<<JS
    facade.startApp('$id', '$name', '$employeeID');
JS
    , CClientScript::POS_READY
)
?>