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
        $this->renderPartial('//components/_grid_form',
            [
                'model' => $model,
                'parentViewID' => isset($parentViewID)?$parentViewID: null ,
            ]
        );

        ?>
    </section>
<script>
    $(function(){
        mediator.publish(optionsModule.getChannel('reflowTab'));
    })
</script>