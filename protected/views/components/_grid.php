<?
use Chocolate\HTML\ImageAdapter;

/**
 * @var $this Controller
 * @var $formID
 * @var $model GridForm
 *
 */
$recordet = $model->loadData();
//$start = microtime(1);
$this->widget('Chocolate.Widgets.ChGridView', [
    'itemsCssClass' => 'table-bordered items',
    'summaryText' => '',
    'id' => uniqid('c'),
    'selectableRows' => 0,
    'dataProvider' => new CArrayDataProvider([]),
    'columns' => $model->getColumns(),
    'htmlOptions' => [
        'data-id' => 'user-grid',
        'id' => uniqid('g'),
    ]
]);
//$end = microtime(1) - $start;
//$tt = '';
//$start = microtime(1);
?>
<script>
    $(function () {
        chFunctions.initGrid(
            '<? echo json_encode($recordet->rawUrlEncode())?>',
            '<? echo $model->previewDataToJS($recordet)?>',
            '<? echo $model->defaultValuesToJS()?>',
            '<? echo $model->requiredFieldsToJS()?>',
            '<? echo $model->gridPropertiesToJS()?>',
            '<? echo $formID ?>',
            '<? echo $model->getCardCollection()->getHeader() ?>',
            '<? echo ImageAdapter::getHtml($model->getCardCollection()->getHeaderImage())?>',
            '<? echo $model->cardCollectionToJs() ?>',
            '<? echo json_encode($recordet->getOrder())?>'
        )
    })
</script>

