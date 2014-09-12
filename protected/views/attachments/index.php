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
$parentID = $model->getParentID();
$view = $model->getView();
?>
<?
$options = [
    'autoUpload' => false,
    'maxFileSize' => 20000000,
    'acceptFileTypes' => 'js:/(.*)$/i',
    'added' => 'js:function (e, data) {
                var form_id ="'.$formID.'";
                ChAttachments.push(form_id,data.files)
                  var row_id = Chocolate.uniqueID();
                  data.context.attr("data-id", row_id);
                  data.context.find("td input[type=file]").attr("parent-id", row_id);
               $("#' . $formID . ' div[data-id=user-grid] table" ).trigger("update");
                 var ch_form = ChObjectStorage.create($("#' . $formID . '"), "ChGridForm");
                 ch_form.getSaveButton().addClass("active");

            }',
    'stop' => 'js:function(){
        var ch_form = ChObjectStorage.create($("#' . $formID . '"), "ChGridForm")
        ch_form.refresh();
    }',
    'done' => 'js:function(){
                return true;
            }',
];
$isNewRow = DataFormModel::isNewRow($parentID);
if(!$isNewRow):
    $options['dropZone'] = 'js:$("#' . $sectionID . '")';
else:
    $options['dropZone'] = false;
endif;
?>
<section id="<?php echo $sectionID ?>" class="attachment-grid">
    <?php
    $this->widget('Chocolate.Widgets.ChFileUpload', array(
        'url' => $this->createUrl("Attachment/upload", [
                'view' => $view,
                'ParentView' => $parentView,
                'ParentID' => ChHtml::ID_KEY
            ]),
        'model' => new FileModel(),
        'attribute' => 'files', // see the attribute?
        'multiple' => true,
        'previewImages' => false,
        'imageProcessing' => false,
        'htmlOptions' => [
            'id' => $formID,
            'class' => 'grid-form',
            'data-id' => $view,
            'parent-data-id' => $parentView,
            'data-parent-id' => $parentViewID,
//            'data-refresh-url' => Yii::app()->createUrl('grid/search', ['view' => $view]),
//            'data-save' => Yii::app()->createUrl('grid/save', ['view' => $view]),
            'data-parent-pk' => ChHtml::ID_KEY,
            'data-parent-pk2' => $parentID,
            'delUrl' => Yii::app()->createAbsoluteUrl('Attachment/RemoveRow'),
        ],
        'options' => $options
    ));
    ?>

</section>
<script>
    $(document).ready(function () {
        var $context = $('#' + '<?php echo $sectionID ?>').parent();
        var is_new_row = '<? echo $isNewRow?>';
        if(!$context.hasClass('card-grid')){
            ChocolateDraw.drawGrid($context)
        }
        if(!is_new_row){

            $('#' + '<?php echo $sectionID ?>').on('drop', function (e) {
                $(this).removeClass("attachment-dragover")
                e.preventDefault();
            })
                .on('dragover', function (e) {
                    $(this).addClass("attachment-dragover")
                    e.preventDefault();
                })
                .on('dragleave', function (e) {
                    $(this).removeClass("attachment-dragover")

                });
        }
        var formID = '<?php echo $formID ?>'
        var $form = $('#' + formID)
        /**
         *
         * @type {ChGridForm}
         */
        var ch_form = ChObjectStorage.create($form, 'ChGridForm');
        $form.on('fileuploadsubmit', function (e, data) {
            return false
        })
        var defaultValues = jQuery.parseJSON('<?php echo $model->defaultValuesToJS() ?>')
        ch_form.saveInStorage({}, {}, defaultValues, {}, {})
    })
</script>
