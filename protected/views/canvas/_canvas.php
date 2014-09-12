<?
use \Chocolate\HTML\ChHtml;
/**
 * @var $model GridForm
 * @var $parentViewID String
 * @var $this Controller
 */
?>
<?php
$formID = uniqid('f');
$canvasID = ChHtml::generateUniqueID('canvas');
$view = $model->getView();

$form = $this->beginWidget('CActiveForm', [
    'action' => Yii::app()->createUrl('grid/save', ['view' => $view]),
    'htmlOptions' => [
        'data-id' => $view,
        'id' => $formID,
        'data-parent-id' => isset($parentViewID) ? $parentViewID : null,
//        'data-refresh-url' => Yii::app()->createUrl('grid/search', ['view' => $view]),
        'data-ajax-add' => $model->isSupportCreateEmpty(),
//        'data-save' => Yii::app()->createUrl('grid/save', ['view' => $view]),
        'data-tab-caption' => $model->getCardCollection()->getCaption(),
        'data-parent-pk' => $model->getParentID(),
        'data-card-support' => $model->isCardAllow()
    ]
]);
?>
<?php $this->renderPartial('//components/_menu', ['model' => $model]) ?>
<section class="canvas" data-id="canvas">
    <canvas class="chocolate-canvas"  id="<? echo $canvasID; ?>"></canvas>
</section>
<?php $this->endWidget(); ?>
<script>
    $(function () {
        /**
         * @type {ChGridForm}
         */
        var ch_form = ChObjectStorage.create($('#' +  '<? echo $formID ?>'), 'ChGridForm');
        var fmCardsCollection = new FmCardsCollection(
            '<? echo $model->getCardCollection()->getHeader()?>',
            '<? echo \Chocolate\HTML\ImageAdapter::getHtml($model->getCardCollection()->getHeaderImage()) ?>',
            json_parse('<? echo $model->cardCollectionToJs()?>', Chocolate.parse)
        )
        ch_form.setFmCardsCollection(fmCardsCollection);
    })
</script>