<?
use Chocolate\HTML\Filter\Settings\Tree;
/**
 * @var $form ChActiveForm
 * @var $model CModel
 * @var $settings Tree
 */
$properties = $settings->getProperties();
$form->widget('Chocolate.Widgets.ChDynaTree', [
    'model' => $model,
    'attribute' => $settings->getAttribute(),
    'sql' => $settings->getSql(),
    'descriptionData' => $properties->getDescriptionData(),
    'isRestoreState' => $properties->isRestoreState(),
    'isExpandNodes' => $properties->isExpandNodes(),
    'isSelectAll' => $properties->isSelectAll(),
    'isMultiSelect' => $settings->isMultiSelect(),
    'htmlOptions' => ['class' => 'tree-container'],
    'options' => []
]);
?>