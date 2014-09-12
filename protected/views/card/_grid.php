<?
use \FrameWork\DataForm\DataFormModel\ColumnProperties;
/**
 * @var $this Controller
 * @var $model GridForm,
 * @var $parentViewID String
 * @var $sql $string
 */
?>
<section>
    <? if($model->hasHeader()):?>
    <section data-id="header" class="section-header">
        <?php
        $this->renderPartial('//grid/_header', array('model' => $model));
        ?>
    </section>
    <? endif; ?>
    <section data-id="grid-form" class="section-grid">
        <?php
        $this->renderPartial('//components/_lazy_grid_form',
            array(
                'model' => $model,
                'parentViewID' => $parentViewID,
                'sql' =>$sql
            ));?>
    </section>
</section>
