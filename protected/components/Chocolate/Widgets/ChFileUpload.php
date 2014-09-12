<?php
/**
 * ChFileUpload.php
 *
 * Модифицированная версия TbFileUpload.
 */
Yii::import('zii.widgets.jui.CJuiInputWidget');
class ChFileUpload extends CJuiInputWidget
{
    /**
     * the url to the upload handler
     * @var string
     */
    public $url;

    /**
     * set to true to use multiple file upload
     * @var boolean
     */
    public $multiple = false;

    /**
     * The upload template id to display files available for upload
     * defaults to null, meaning using the built-in template
     */
    public $uploadTemplate;

    /**
     * The template id to display files available for download
     * defaults to null, meaning using the built-in template
     */
    public $downloadTemplate;

    /**
     * Wheter or not to preview image files before upload
     */
    public $previewImages = true;

    /**
     * Whether or not to add the image processing pluing
     */
    public $imageProcessing = true;

    /**
     * @var string name of the form view to be rendered
     */
    public $formView = 'application.views.attachments.form';

    /**
     * @var string name of the upload view to be rendered
     */
//    public $uploadView = 'bootstrap.views.fileupload.upload';

    /**
     * @var string name of the download view to be rendered
     */
//    public $downloadView = 'bootstrap.views.fileupload.download';

    /**
     * @var string name of the view to display images at bootstrap-slideshow
     */
//    public $previewImagesView = '//attachments/FileUploadTemplate';

    /**
     * Widget initialization
     */
    public function init()
    {
        if ($this->uploadTemplate === null) {
            $this->uploadTemplate = "#template-upload";
        }

        if ($this->downloadTemplate === null) {
            $this->downloadTemplate = "#template-download";
        }

        if (!isset($this->htmlOptions['enctype'])) {
            $this->htmlOptions['enctype'] = 'multipart/form-data';
        }

        parent::init();
    }

    /**
     * Generates the required HTML and Javascript
     */
    public function run()
    {

        list($name, $id) = $this->resolveNameID();

        $this->options['url'] = $this->url;

        // if acceptFileTypes is not set as option, try getting it from models rules
        if (!isset($this->options['acceptFileTypes'])) {
            $fileTypes = $this->getFileValidatorProperty($this->model, $this->attribute, 'types');
            if (isset($fileTypes)) {
                $fileTypes = (preg_match(':jpg:', $fileTypes) && !preg_match(':jpe:', $fileTypes) ? preg_replace(
                    ':jpg:',
                    'jpe?g',
                    $fileTypes
                ) : $fileTypes);
                $this->options['acceptFileTypes'] = 'js:/(\.)(' . preg_replace(':,:', '|', $fileTypes) . ')$/i';
            }
        }

        // if maxFileSize is not set as option, try getting it from models rules
        if (!isset($this->options['maxFileSize'])) {
            $fileSize = $this->getFileValidatorProperty($this->model, $this->attribute, 'maxSize');
            if (isset($fileSize)) {
                $this->options['maxFileSize'] = $fileSize;
            }
        }

        if ($this->multiple) {
            $this->htmlOptions["multiple"] = true;
        }

//        $this->render($this->uploadView);
//        $this->render($this->downloadView);
        $this->render($this->formView, array('name' => $name, 'htmlOptions' => $this->htmlOptions, 'controller'=>$this));

//        if ($this->previewImages || $this->imageProcessing) {
//            $this->render($this->previewImagesView);
//        }

        $this->registerClientScript($this->htmlOptions['id']);
    }

    /**
     * Registers and publishes required scripts
     *
     * @param string $id
     */
    public function registerClientScript($id)
    {
        //        Yii::app()->bootstrap->registerAssetJs('fileupload/vendor/jquery.ui.widget.js');
        //        Yii::app()->bootstrap->registerAssetJs("fileupload/tmpl.min.js", CClientScript::POS_END);
        //        Yii::app()->bootstrap->registerAssetJs('fileupload/jquery.iframe-transport.js');
        //??     Yii::app()->bootstrap->registerAssetJs('fileupload/jquery.fileupload-locale.js');


        if ($this->previewImages || $this->imageProcessing) {
            Yii::app()->bootstrap->registerAssetJs("fileupload/load-image.min.js", CClientScript::POS_END);
            Yii::app()->bootstrap->registerAssetJs("fileupload/canvas-to-blob.min.js", CClientScript::POS_END);
            // gallery :)
            Yii::app()->bootstrap->registerAssetCss("bootstrap-image-gallery.min.css");
            Yii::app()->bootstrap->registerAssetJs("bootstrap-image-gallery.min.js", CClientScript::POS_END);
        }
        if ($this->imageProcessing) {
            Yii::app()->bootstrap->registerAssetJs('fileupload/jquery.fileupload-ip.js');
        }
        // The File Upload file processing plugin
        if ($this->previewImages) {
            Yii::app()->bootstrap->registerAssetJs('fileupload/jquery.fileupload-fp.js');
        }
//        Yii::app()->bootstrap->registerAssetJs('fileupload/jquery.fileupload-ui.js');

        $options = CJavaScript::encode($this->options);
        Yii::app()->clientScript->registerScript(__CLASS__ . '#' . $id, "jQuery('#{$id}').fileupload({$options});", CClientScript::POS_END);


        // @todo remove when jquery.ui 1.9+ is fully integrated into stable Yii versions







    }

    /**
     * Check for a property of CFileValidator
     *
     * @param CModel $model
     * @param string $attribute
     * @param null $property
     *
     * @return string property's value or null
     */
    private function getFileValidatorProperty($model = null, $attribute = null, $property = null)
    {
        if (!isset($model, $attribute, $property)) {
            return null;
        }

        foreach ($model->getValidators($attribute) as $validator) {
            if ($validator instanceof CFileValidator) {
                $ret = $validator->$property;
            }
        }
        return isset($ret) ? $ret : null;
    }
}
