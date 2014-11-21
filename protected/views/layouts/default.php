<?
/* @var $this SiteController */
use \ClassModules\User\User;

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
    <?
    $userName = Yii::app()->user->fullName;
    if (stripos(Yii::app()->request->getHostInfo(), 'bp') !== false) {

        $taskUrl = Yii::app()->createUrl('grid/index', ['view' => 'tasks\tasksfortops.xml']);
    } else {
        $taskUrl = Yii::app()->createUrl('grid/index', ['view' => 'tasks.xml']);
    }
    if (Yii::app()->controller->action->getId() == 'default' && $_SERVER['HTTP_HOST'] != '10.0.5.2') {

        Yii::app()->clientScript->registerScript('autoOpen', <<<JS
  $(function(){
  Chocolate.openForm('$taskUrl');});
JS
            , CClientScript::POS_LOAD
        );
    }
    $this->widget('Chocolate.Widgets.ChNavbar', [
        'type' => 'inverse',
        'brand' => $userName,
        'brandUrl' => Yii::app()->createUrl('grid/index', ['view' => 'UserSettings.xml']),
        'brandOptions' => ['class' => 'link-profile'],
        'fluid' => true,
        'fixed' => 'bottom',
        'collapse' => false,
        'items' => [
            [
                'class' => 'Chocolate.Widgets.ChMenu',
                'items' => [
                    ['label' => 'Поручения', 'itemOptions' => ['class' => User::MENU_ITEM_CLASS], 'url' => $taskUrl],
                    ['label' => 'Выйти', 'url' => Yii::app()->createUrl('site/logout')],
                ]
            ],
        ],
    ]);

    $userID = Yii::app()->user->id;
    Yii::app()->clientScript->registerScript('start', <<<JS
    facade.startApp('$userID', '$userName');
JS
        , CClientScript::POS_READY
    )
    ?>

</footer>
</body>
</html>