<?
/**
 * @var $model GridForm,
 * @var $this Controller
 */
?>
<div class="filters-content">
    <?
    $this->widget('Chocolate.Widgets.ChFilterForm', [
        'action' => $this->createUrl('grid/search', ['view' => $model->getView()]),
        'method' => 'GET',
        'filters' => $model->getFilterSettingsCollection(),
        'model' => $model,
        'htmlOptions' => [
            'data-id' => 'filter-form',
            'id' => $model->getParentView()?\Chocolate\HTML\ChHtml::generateUniqueID('filter') : uniqid('filter'),
        ]
    ]); ?>

</div>