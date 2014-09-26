<?
use Chocolate\HTML\ChHtml;

/**
 * @var $model GridForm
 */
?>
<menu class='menu' type="toolbar">
    <?
    if ($model->isAllowCreate()):
        echo CHtml::htmlButton(
            '<span class="menu-border-green"></span><span>Создать</span>',
            [
                'class' => 'active menu-button menu-button-add',
                'title' => 'Создать',
            ]
        );
    endif;

    if ($model->isAllowSave()):
        echo CHtml::htmlButton(
            '<span>Сохранить</span>',
            [
                'class' => 'menu-button menu-button-save',
                'title' => 'Сохранить',
            ]
        );
    endif;

    if ($model->isAllowRefresh()) :
        echo CHtml::htmlButton(
            '<span>Обновить</span>',
            [
                'class' => 'active menu-button menu-button-refresh',
                'title' => 'Обновить',
            ]
        );
    endif;
    echo CHtml::htmlButton(
        '<span class="fa-file-excel-o"></span>',
        [
            'class' => 'active menu-button menu-button-excel small-button',
            'title' => 'Экспорт в Excel',
        ]
    );
    if ($model->isAllowPrintActions()):
        $printID = ChHtml::generateUniqueID('print');
        echo CHtml::htmlButton(
            '<span class="fa fa-print"></span>',
            [
                'class' => 'active menu-button menu-button-print small-button',
                'title' => 'Печать',
                'id' => $printID
            ]
        );
        $printActions = json_encode($model->getDataFormProperties()->getPrintActions()->getActions());
        Yii::app()->clientScript->registerScript($printID, <<<JS
    chFunctions.initPrintActions('$printID', '$printActions');
JS
            , CClientScript::POS_LOAD);
    endif;


    echo CHtml::htmlButton(
        '<span class="fa-wrench"></span>',
        [
            'class' => 'active menu-button menu-button-settings small-button',
            'title' => 'Настройки',
        ]
    );

    if ($model->isAllowAudit()) {
        $sysColsID = ChHtml::generateUniqueID('us');
        echo CHtml::htmlButton(
            '<span class="fa-user"></span>',
            [
                'class' => 'active menu-button menu-button-toggle small-button',
                'title' => 'Показать системные поля',
                'id' => $sysColsID
            ]
        );
        Yii::app()->clientScript->registerScript($sysColsID, <<<JS
    chFunctions.systemColsInit('$sysColsID');
JS
            , CClientScript::POS_LOAD);
    }

    $actionID = ChHtml::generateUniqueID('actions');
    echo CHtml::htmlButton(
        '<span class="fa-level-down"></span>',
        [
            'class' => 'active menu-button menu-button-action  small-button',
            'title' => 'Действия',
            'id' => $actionID
        ]
    );
    $actions = json_encode($model->getActionPropertiesCollection()->getData());
    Yii::app()->clientScript->registerScript($actionID, <<<JS
    chFunctions.initActions('$actionID', '$actions');
JS
        , CClientScript::POS_LOAD);
    ?>

    <?
    if(count($model->getColumns())>10){
     echo CHtml::tag('input',[
        'type' => 'search',
        'class' => 'grid-column-search',
        'placeholder' => 'Поиск колонки'
     ]);
    }
    ?>
    <div class="messages-container"></div>
</menu>
