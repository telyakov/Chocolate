<?
use \FrameWork\DataForm\DataFormModel\DataFormModel;
use \Chocolate\HTML\ChHtml;

/**
 * @var $this Controller
 * @var $parentViewID string
 * @var $model GridForm
 */

$sectionID = ChHtml::generateUniqueID('s');
$formID = ChHtml::generateUniqueID('f');
$parentView = $model->getParentView();
$view = $model->getView();
$options = [
    'autoUpload' => false,
    'maxFileSize' => 50000000,
    'acceptFileTypes' => 'js:/(.*)$/i',
    'added' => 'js:function(e,data){chApp.getAttachment().addedHandler("' . $formID . '", data);}',
    'stop' => 'js:function(){chApp.getAttachment().stopHandler("' . $formID . '");}',
    'fail' => 'js:function(e,data){chApp.getAttachment().failHandler("' . $formID . '", data);}'
];
$isNewRow = DataFormModel::isNewRow($model->getParentID());
if (!$isNewRow) {
    $options['dropZone'] = 'js:$("#' . $sectionID . '")';
} else {
    $options['dropZone'] = false;
}
echo CHtml::openTag('section', [
    'id' => $sectionID,
    'class' => 'attachment-grid'
]);
$this->widget('Chocolate.Widgets.ChFileUpload', array(
    'url' => $this->createUrl("Attachment/upload", [
            'view' => $view,
            'ParentView' => $parentView,
            'ParentID' => ChHtml::ID_KEY
        ]),
    'model' => new FileModel(),
    'attribute' => 'files',
    'multiple' => true,
    'previewImages' => false,
    'imageProcessing' => false,
    'htmlOptions' => [
        'id' => $formID,
        'class' => 'grid-form',
        'data-id' => $view,
        'parent-data-id' => $parentView,
        'data-parent-id' => $parentViewID,
        'data-parent-pk' => ChHtml::ID_KEY,
        'data-is-new' => $isNewRow,
    ],
    'options' => $options
));
echo CHtml::closeTag('section');
?>
<script>
    chApp.getAttachment().initScript(
        '<? echo $sectionID?>',
        '<? echo $formID?>',
        '<? echo $isNewRow?>',
        '<? echo $model->defaultValuesToJS()?>'
    );
</script>
