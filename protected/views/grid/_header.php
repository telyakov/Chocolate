<?
use Chocolate\HTML\ImageAdapter;

/**
 * @var $model GridForm
 * @var $this Controller
 */
$dataFormProperties = $model->getDataFormProperties();
?>
<div class="top-header">
    <?
    echo CHtml::tag(
        'div',
        ['class' => 'left-header'],
        ImageAdapter::getHtml($dataFormProperties->getHeaderImage())
    );
    echo CHtml::tag(
        'div',
        ['class' => 'right-header'],
        empty($dataFormProperties->getHeaderText()) ?
            '' :
            $dataFormProperties->getHeaderText()
    );
    ?>
</div>
<?
echo CHtml::tag(
    'div',
    ['class' => 'bottom-header'],
    $model->getStateProcData()
)
?>