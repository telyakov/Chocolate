<?
/**
 * @var $model GridForm,
 * @var $this Controller
 * @var $parentViewID String|null
 */
//$start = microtime(1);

$tabID = uniqid('tb'); ?>
<div id='<?php echo $tabID ?>'>
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
        $this->renderPartial('//components/_grid_form',
            [
                'model' => $model,
                'parentViewID' => isset($parentViewID)?$parentViewID: null ,
            ]
        );

        ?>
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
<?
//$end = microtime(1) - $start;
//$tt = '';

?>





