<?
/**
 * @var $model GridForm
 * @var $parentViewID String
 * @var $this Controller
 */

$formID = uniqid('f');

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
$this->renderPartial('//components/_menu', ['model' => $model])
?>
    <section data-id="grid">
        <?
//        $start = microtime(1);
        $this->renderPartial('//components/_grid', [
            'model' => $model,
            'formID' => $formID,
        ]);
//        $end = microtime(1) - $start;
//        $tt = '';
        ?>

    </section>
<? $this->endWidget(); ?>
<? $this->renderPartial('//grid/_footer') ?>