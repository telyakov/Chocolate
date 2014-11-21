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
<header id="header">
    <div id="fadingBarsG">
        <div id="fadingBarsG_1" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_2" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_3" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_4" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_5" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_6" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_7" class="fadingBarsG">
        </div>
        <div id="fadingBarsG_8" class="fadingBarsG">
        </div>
    </div>
</header>

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
        'collapse' => false, // requires bootstrap-responsive.css
        'items' => [
            [
                'class' => 'Chocolate.Widgets.ChMenu',
                'items' => [
                    ['label' => 'Поручения', 'itemOptions' => ['class' => User::MENU_ITEM_CLASS], 'url' => $taskUrl],
//                    ['label' => 'Профиль', 'itemOptions' => ['class' => 'link'],  'url' => ],
                    ['label' => 'Выйти', 'url' => Yii::app()->createUrl('site/logout')],
                ]
            ],
        ],
    ]);

    $userID = Yii::app()->user->id;
    Yii::app()->clientScript->registerScript('authorization', <<<JS
        var appModel = new AppModel({
            userId: '$userID',
            userName: '$userName'
        });
        new AppView({
            model: appModel,
            el: $('body')
        });
JS
        , CClientScript::POS_READY
    )
    ?>

</footer>
</body>
</html>