<?php
/**
 * @var $model GridForm,
 * @var $this Controller
 * @var $parentViewID String|null
 */
?>
<?php $tabID = uniqid('tb'); ?>
<div id='<?php echo $tabID ?>'>
    <section class='section-header' data-id="header">
        <?php $this->renderPartial('//grid/_header', ['model' => $model]); ?>
    </section>

    <? if ($model->hasFilters()) : ?>
    <section class='section-filters' data-id="filters">

    <? $this->renderPartial('//components/_filter_form', ['model' => $model]); ?>
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
        $this->renderPartial('_map_form',
            [
                'model' => $model,
                'parentViewID' => isset($parentViewID)? $parentViewID: null,
            ]
        );?>

    </section>
</div>
<script>
    $(function () {
        Chocolate.tab.addAndSetActive(
            '<? echo $tabID ?>',
            '<? echo $model->getDataFormProperties()->getWindowCaption()?>'
        );
    })
</script>







