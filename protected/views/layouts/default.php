<? /* @var $this SiteController */
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
    <title>Шоколад</title>
</head>
<body>
<header id="header">
    <?
    $navigations = User::getForms();
        $this->widget('Chocolate.Widgets.ChNavbar', [
            'brand' => '',
            'brandUrl' => '#',
            'fluid' => true,
            'collapse' => false, // requires bootstrap-responsive.css
            'items' => [
                '<input type="text" id="nav-search" placeholder="Быстрый поиск" tabindex="-1">',
                [
                    'class' => 'Chocolate.Widgets.ChMenu',
                    'items' => User::convertToTree($navigations)
                ],
            ],
        ]);
    ?>
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
    <!--    <aside id="sidebar">-->
    <!--    </aside>-->
    <div id="content">
        <? echo $content; ?>
    </div>
</div>
<footer id="footer">
    <?php
    if(isset( Yii::app()->user->fullName)){
        $userName = Yii::app()->user->fullName;
    }else{
        $userName = 'Нажмите выйти и войдите снова';
    }
    if(stripos(Yii::app()->request->getHostInfo(), 'bp')!== false){

        $taskUrl = Yii::app()->createUrl('grid/index', ['view' => 'tasks\tasksfortops.xml']);


    }else{
        $taskUrl = Yii::app()->createUrl('grid/index', ['view' => 'tasks.xml']);
    }
    if(Yii::app()->controller->action->getId() == 'default' && Yii::app()->request->getUserHost() =='localhost'){

    Yii::app()->clientScript->registerScript('autoOpen', <<<JS
  $(function(){Chocolate.openForm('$taskUrl');});
JS
        , CClientScript::POS_LOAD
    );
    }
    $this->widget('Chocolate.Widgets.ChNavbar', [
        'type' => 'inverse',
        'brand' => $userName,
        'brandUrl' =>  Yii::app()->createUrl('grid/index', ['view' => 'UserSettings.xml']),
        'brandOptions' => ['class' => 'link-profile'],
        'fluid' => true,
        'fixed' => 'bottom',
        'collapse' => false, // requires bootstrap-responsive.css
        'items' => [
            [
                'class' => 'Chocolate.Widgets.ChMenu',
                'items' => [
                    ['label' => 'Поручения', 'itemOptions' => ['class' => User::MENU_ITEM_CLASS], 'url' =>$taskUrl],
//                    ['label' => 'Профиль', 'itemOptions' => ['class' => 'link'],  'url' => ],
                    ['label' => 'Выйти', 'url' => Yii::app()->createUrl('site/logout')],
                ]
            ],
        ],
    ]);
    $data = json_encode(User::convertToAutocomplete($navigations));
    $roles = json_encode(User::getRoles());
    Yii::app()->clientScript->registerScript('authorization', <<<JS
        Chocolate.user.setIdentity('$userName', '$roles');
        chFunctions.menuAutocomplete('$data');

JS
        , CClientScript::POS_READY
    )
    ?>

</footer>
</body>
<script id="template-download" type="text/x-tmpl">
    {% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-download fade" data-id="{%=file.id%}">
        <td class="attachment-grid-menu"><?php ChControlsColumn::renderCardButton() ?></td>
        <td>
            <div class="table-td">
                <a class="attachment-file" href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}">{%=file.name%}</a>
            </div>
        </td>
        <td>
            <div class="table-td">
                <span class="attachment-td">{%=file.version%}</span>
            </div>
        </td>
        <td>
            <div class="table-td">
                <span class="attachment-td">{%=file.insusername%}</span>
            </div>
        </td>
        <td>
            <div class="table-td">
                <span class="attachment-td">{%=file.insdate%}</span>
            </div>
        </td>
    </tr>
    {% } %}

</script>
<script id="template-upload" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade" >
         <td class="attachment-grid-menu"><?php ChControlsColumn::renderCardButton() ?></td>
        <td>
            <div class="table-td">
                <span>{%=file.name%}</span>
            </div>
        </td>
        <td>
            <div class="table-td start">
                   <span>1</span>
                    <button style="display:none"> </button>
            </div>
        </td>
                <td>
            <div class="table-td">
            </div>
        </td>
        <td>
            <div class="table-td">
            </div>
        </td>
    </tr>
{% } %}
</script>
</html>