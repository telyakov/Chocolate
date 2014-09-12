<?
use Chocolate\HTML\Filter\Settings\Text;

/**
 * @var $form ChActiveForm
 * @var $model CModel
 * @var $settings Text
 */
?>
<div class="text-filter" title="<? echo $settings->getToolTip() ?>">
    <?
    echo $form->textFieldRow(
        $model,
        $settings->getAttribute(),
        $settings->toArray()
    );
    ?>
</div>