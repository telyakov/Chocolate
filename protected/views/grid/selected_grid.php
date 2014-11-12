<?
/**
 * @var $model GridForm,
 * @var $this Controller
 * @var $parentViewID String|null
 */
?>
<? if($model->hasHeader()):?>
    <section class ='section-header' data-id="header">
        <?php $this->renderPartial('_header', ['model' => $model]); ?>
    </section>
<? endif; ?>

<? if ($model->hasFilters()) : ?>
    <section class='section-filters' data-id="filters">

        <?
        $this->renderPartial('//components/_filter_form', ['model' => $model]);
        ?>
    </section>
<? endif ?>

<?
if ($parentID = $model->getParentID()) {
    $parentAttribute = 'data-parent-id ="' . $parentID . '"';
} else {
    $parentAttribute = null;
}

?>
<section class='section-grid' data-id="grid-form" <?php echo $parentAttribute ?> >
    <?
    $formID = $model->getParentView() ?\Chocolate\HTML\ChHtml::generateUniqueID('ff'): uniqid('ff');

    $view = $model->getView();
    $form = $this->beginWidget('CActiveForm', [
        'action' => Yii::app()->createUrl('grid/save', ['view' => $view]),
        'htmlOptions' => [
            'data-id' => $view,
            'id' => $formID,
            'data-parent-id' => isset($parentViewID) ? $parentViewID : null,
            'data-ajax-add' => $model->isSupportCreateEmpty(),
            'data-tab-caption' => $model->getCardCollection()->getCaption(),
            'data-parent-pk' => $model->getParentID(),
            'data-card-support' => $model->isCardAllow()
        ]
    ]);
    $this->renderPartial('//components/_menu', ['model' => $model])
    ?>
    <section data-id="grid">
        <?
        $this->renderPartial('//components/_grid', [
            'model' => $model,
            'formID' => $formID,
        ]);
        ?>

    </section>
    <? $this->endWidget(); ?>
    <? $this->renderPartial('//grid/_selected_footer') ?>
</section>
<script>
    $(function(){
        mediator.publish(optionsModule.getChannel('reflowTab'));
    })
</script>