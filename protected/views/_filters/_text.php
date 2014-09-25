<?
use Chocolate\HTML\Filter\Settings\Text;

/**
 * @var $form ChActiveForm
 * @var $model CModel
 * @var $settings Text
 */
?>
<div class="text-filter" title="<? echo $settings->getName() ?>">
    <?

    echo CHtml::activeLabel($model, $settings->getAttribute(),[
        'for' => $settings->getInputName()
    ]);
    echo $form->searchField(
        $model,
        $settings->getAttribute(),
        $settings->toArray()
    );
    ?>
</div>