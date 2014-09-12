<?
use Chocolate\HTML\Filter\Settings\CheckBox;

/**
 * @var $form ChFilterForm
 * @var $model CModel
 * @var $settings CheckBox
 */
?>
<div class="checkbox-filter" title="<? echo $settings->getToolTip() ?>">
    <?
    echo $form->toggleButtonRow(
        $model,
        $settings->getAttribute(),
        [
            'id' => uniqid(),
            'options' =>
                [
                    'enabledLabel' => 'Да',
                    'disabledLabel' => 'Нет',
                    'height' => 24,
                    'width' => 75,
                    'enabledStyle' => 'checkbox-filter-enabled',
                    'disabledStyle' => 'checkbox-filter-disabled',
                ],
        ]
    );
    ?>
</div>
