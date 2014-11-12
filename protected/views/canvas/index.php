<?
/**
 * @var $model GridForm,
 * @var $this Controller
 * @var $parentViewID String|null
 */
?><?php $tabID = uniqid('tb'); ?>
<div id='<?php echo $tabID ?>'>
<!--<div style="overflow: scroll; height: 900px;width: 900px">-->
    <? if($model->hasHeader()):?>
    <section class ='section-header' data-id="header">
        <?php $this->renderPartial('//grid/_header', ['model' => $model]); ?>
    </section>
    <? endif; ?>
    <? if ($model->hasFilters()) : ?>
    <section class='section-filters canvas-filters' data-id="filters">
        <?$this->renderPartial('//components/_filter_form', ['model' => $model]); ?>
        </section>
    <? endif ?>
    <?php
    if ($parentID = $model->getParentID()) {
        $parentAttribute = 'data-parent-id ="' . $parentID . '"';
    } else {
        $parentAttribute = null;
    }
    ?>
    <section class='section-grid' data-id="grid-form" <?php echo $parentAttribute ?>>
        <?php
        $this->renderPartial('_canvas',
            [
                'model' => $model,
                'parentViewID' => $parentViewID,
            ]
        );?>

    </section>
</div>
<script>
    $(function () {
        facade.getTabsModule().addAndSetActive(
            '<? echo $tabID ?>',
            '<? echo $model->getDataFormProperties()->getWindowCaption()?>'
        );
        chApp.getDraw().reflowTab(facade.getTabsModule().getActiveChTab());
    })
</script>