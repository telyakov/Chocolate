<?
use Chocolate\HTML\Filter\Settings\Fast;

/**
 * @var $form ChActiveForm
 * @var $model CModel
 * @var $settings Fast
 * @var $parentID int/null
 */
if($settings->isMultiSelect()){

echo $form->checkBoxListInlineRow(
    $model,
    $settings->getAttribute(),
    $settings->getData($parentID),
    [
        'template' => '<span class="{labelCssClass}">{input}{label}</span>',
        'label' => false,
    ]
);
}else{
    echo $form->radioButtonListInlineRow(
        $model,
        $settings->getAttribute(),
        $settings->getData($parentID),
        [
            'template' => '<span class="{labelCssClass}">{input}{label}</span>',
            'label' => false
        ]
    );
}
?>
