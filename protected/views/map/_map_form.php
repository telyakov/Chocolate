<?php
/**
 * @var $model GridForm
 * @var $parentViewID String
 * @var $this Controller
 */
?>
<?php
$formID = uniqid('f');
$gridID = uniqid('g');
$containerID = uniqid('c');
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
    <section data-id="map">
<!--        <input type="button" value="Развернуть/Cвернуть" id="toggler"/>-->
        <? $this->renderPartial('_yandex_map', ['model' => $model]); ?>
    </section>
<?php $this->endWidget(); ?>