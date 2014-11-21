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
    'id' => $model->getParentView()? \Chocolate\HTML\ChHtml::generateUniqueID('c'): uniqid('c'),
    'selectableRows' => 0,
    'dataProvider' => new CArrayDataProvider([]),
    'columns' => $model->getColumns(),
    'htmlOptions' => [
        'data-id' => 'user-grid',
        'id' => $model->getParentView() ? \Chocolate\HTML\ChHtml::generateUniqueID('g') : uniqid('g'),
    ]
]);
?>
<script>
    $(function () {
        Chocolate.init()
        chFunctions.initGrid(
            '<? echo json_encode($recordet->rawUrlEncode())?>',
            '<? echo json_encode($model->getPreview());?>',
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

