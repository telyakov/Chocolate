<?
use \Chocolate\HTML\ImageAdapter;
use \Chocolate\HTML\ChHtml;

/**
 * @var $this Controller
 * @var $formID
 * @var $model GridForm
 * @var $sql String
 *
 */
$this->widget('Chocolate.Widgets.ChGridView', [
    'itemsCssClass' => 'table-bordered items',
    'summaryText' =>'',
    'id' => ChHtml::generateUniqueID('yy'),
    'selectableRows' => 0,
    'dataProvider' => new CArrayDataProvider([]),
    'columns' => $model->getColumns(),
    'htmlOptions' =>[
        'data-id' => 'user-grid',
        'id' => ChHtml::generateUniqueID('g'),
    ]
]);
?>
<script>
    chFunctions.initCardGrid(
        '<? echo $model->defaultValuesToJS()?>',
        '<? echo $model->requiredFieldsToJS()?>',
        '<? echo $model->gridPropertiesToJS()?>',
        '<? echo $formID?>',
        '<? echo $model->getCardCollection()->getHeader() ?>',
        '<? echo ImageAdapter::getHtml($model->getCardCollection()->getHeaderImage())?>',
        '<? echo $model->cardCollectionToJs() ?>',
        '<? echo $model->getView()?>',
        '<? echo $model->getParentView()?>',
        '<? echo ChHtml::ID_KEY ?>',
        '<? echo $sql?>',
        '<? echo json_encode($model->getPreview())?>'
    );
</script>