<?php

class ChEditable extends CWidget
{
    //note: only most usefull options are on first level of config.

    // --- start of X-editable options ----
    /**
     * @var string type of editable widget. Can be `text`, `textarea`, `select`, `date`, `checklist`, etc.
     * @see x-editable
     */
    public $type = null;
    /**
     * @var string url to submit value. Can be string or array containing Yii route, e.g. `array('site/updateUser')`
     * @see x-editable
     */
    public $url = null;
    /**
     * @var mixed primary key
     * @see x-editable
     */
    public $pk = null;

    /**
     * @var string name of field
     * @see x-editable
     */

    public $name = null;
    /**
     * @var array additional params to send on server
     * @see x-editable
     */
    public $params = null;
    /**
     * @var string css class of input. If `null` - default X-editable value is used: `input-medium`
     * @see x-editable
     */
    public $inputclass = null;
    /**
     * @var string mode of input: `inline` | `popup`. If not set - default X-editable value is used: `popup`.
     * @see x-editable
     */
    public $mode = null;
    /**
     * @var string text to be shown as element content
     */
    public $text = null;
    /**
     * @var mixed initial value. If not set - will be taken from text
     * @see x-editable
     */
    public $value = null;
    /**
     * @var string placement of popup. Can be `left`, `top`, `right`, `bottom`. If `null` - default X-editable value is used: `top`
     * @see x-editable
     */
    public $placement = null;

    /**
     * @var string text shown on empty field. If `null` - default X-editable value is used: `Empty`
     * @see x-editable
     */
    public $emptytext = null;

    /**
     * @var string visibility of buttons. Can be boolean `false|true` or string `bottom`.
     * @see x-editable
     */
    public $showbuttons = null;

    /**
     * @var boolean will editable be initially disabled. It means editable plugin will be applied to element,
     * but you should call `.editable('enable')` method to activate it.
     * To totally disable applying 'editable' to element use **apply** option.
     * @see x-editable
     */
    public $disabled = false;

    //list
    /**
     * @var mixed source data for **select**, **checklist**. Can be string (url) or array in format:
     * array( array("value" => 1, "text" => "abc"), ...)
     * @package list
     * @see x-editable
     */
    public $source = null;

    //date
    /**
     * @var string format to send date on server. If `null` - default X-editable value is used: `yyyy-mm-dd`.
     * @package date
     * @see x-editable
     */
    public $format = null;
    /**
     * @var string format to display date in element. If `null` - equals to **format** option.
     * @package date
     * @see x-editable
     */
    public $viewformat = null;
    /**
     * @var string template for **combodate** input. For details see http://vitalets.github.com/x-editable/docs.html#combodate.
     * @package combodate
     * @see x-editable
     */
    public $template = null;
    /**
     * @var array full config for **combodate** input. For details see http://vitalets.github.com/combodate/#docs
     * @package combodate
     * @see x-editable
     */
    public $combodate = null;
    /**
     * @var string separator used to display tags.
     * @package select2
     * @see x-editable
     */
    public $viewseparator = null;
    /**
     * @var array full config for **select2** input. For details see http://ivaynberg.github.com/select2
     * @package select2
     * @see x-editable
     */
    public $select2 = null;

    //methods
    /**
     * A javascript function that will be invoked to validate value.
     * Example:
     * <pre>
     * 'validate' => 'js: function(value) {
     *     if($.trim(value) == "") return "This field is required";
     * }'
     * </pre>
     *
     * @var string
     * @package callback
     * @see x-editable
     * @example
     */
    public $validate = null;
    /**
     * A javascript function that will be invoked to process successful server response.
     * Example:
     * <pre>
     * 'success' => 'js: function(response, newValue) {
     *     if(!response.success) return response.msg;
     * }'
     * </pre>
     *
     * @var string
     * @package callback
     * @see x-editable
     */
    public $success = null;
    /**
     * A javascript function that will be invoked to custom display value.
     * Example:
     * <pre>
     * 'display' => 'js: function(value, sourceData) {
     *      var escapedValue = $("&lt;div&gt;").text(value).html();
     *      $(this).html("&lt;b&gt;"+escapedValue+"&lt;/b&gt;");
     * }'
     * </pre>
     *
     * @var string
     * @package callback
     * @see x-editable
     */
    public $display = null;


    // --- X-editable events ---
    /**
     * A javascript function that will be invoked when editable element is initialized
     * @var string
     * @package event
     * @see x-editable
     */
    public $onInit;
    /**
     * A javascript function that will be invoked when editable form is shown
     * Example:
     * <pre>
     * 'onShown' => 'js: function() {
     *     var $tip = $(this).data("editableContainer").tip();
     *     $tip.find("input").val("overwriting value of input.");
     * }'
     * </pre>
     *
     * @var string
     * @package event
     * @see x-editable
     */
    public $onShown;
    /**
     * A javascript function that will be invoked when new value is saved
     * Example:
     * <pre>
     * 'onSave' => 'js: function(e, params) {
     *     alert("Saved value: " + params.newValue);
     * }'
     * </pre>
     *
     * @var string
     * @package event
     * @see x-editable
     */
    public $onSave;
    /**
     * A javascript function that will be invoked when editable form is hidden
     * Example:
     * <pre>
     * 'onHidden' => 'js: function(e, reason) {
     *    if(reason === "save" || reason === "cancel") {
     *        //auto-open next editable
     *        $(this).closest("tr").next().find(".editable").editable("show");
     *    }
     * }'
     * </pre>
     *
     * @var string
     * @package event
     * @see x-editable
     */
    public $onHidden;

    /**
     * @var array all config options of x-editable. See full list <a href="http://vitalets.github.com/x-editable/docs.html#editable">here</a>.
     */
    public $options = array();

    /**
     * @var array HTML options of element
     */
    public $htmlOptions = array();

    /**
     * @var boolean whether to HTML encode text on output
     */
    public $encode = true;

    /**
     * @var boolean whether to apply 'editable' js plugin to element.
     * Only **safe** attributes become editable.
     */
    public $apply = null;

    /**
     * @var string title of popup. If `null` - will be generated automatically from attribute label.
     * Can have token {label} inside that will be replaced with actual attribute label.
     */
    public $title = null;

    //themeUrl, theme and cssFile copied from CJuiWidget to allow include custom theme for jQuery UI
    /**
     * @var string for jQuery UI only. The root URL that contains JUI theme folders.
     * If not set, default Yii's theme will be used.
     */
    public $themeUrl;
    /**
     * @var string for jQuery UI only. The JUI theme name.
     */
    public $theme='base';
    /**
     * @var mixed for jQuery UI only. The theme CSS file name. By default Yii's jquery UI css used.
     */
    public $cssFile='jquery-ui.css';

    protected $_prepareToAutotext = false;

    /**
     * initialization of widget
     *
     */
    public function init()
    {
        parent::init();

        if (!$this->name) {
            throw new CException('Parameter "name" should be provided for Editable widget');
        }

        /*
        If set this flag to true --> element content will stay empty 
        and value will be rendered to data-value attribute to apply autotext after.
        */
        $this->_prepareToAutotext = self::isAutotext($this->options, $this->type);
    }

    public function buildHtmlOptions()
    {
//        $this->htmlOptions['rel'] = $this->getSelector();
        //if input type assumes autotext (e.g. select) we define value directly in data-value 
        //and do not fill element contents
        if ($this->_prepareToAutotext) {
            //for date we use 'format' to put it into value (if text not defined)
            if ($this->type == 'date') {
                //if date comes as object, format it to string
                if($this->value instanceOf DateTime || is_long($this->value)) {
                    /*
                    * unfortunatly datepicker's format does not match Yii locale dateFormat,
                    * we need replacements below to convert date correctly
                    */
                    $count = 0;
                    $format = str_replace('MM', 'MMMM', $this->format, $count);
                    if(!$count) $format = str_replace('M', 'MMM', $format, $count);
                    if(!$count) $format = str_replace('m', 'M', $format);

                    if($this->value instanceof DateTime) {
                        $timestamp = $this->value->getTimestamp();
                    } else {
                        $timestamp = $this->value;
                    }

                    $this->value = Yii::app()->dateFormatter->format($format, $timestamp);
                }
            }

            $this->htmlOptions['data-value'] = $this->value;
        }
    }

    public function buildJsOptions()
    {
        //normalize url from array
        $this->url = CHtml::normalizeUrl($this->url);

        $options = array(
            'name'  => $this->name,
            'title' => CHtml::encode($this->title),
        );

        //support of CSRF out of box, see https://github.com/vitalets/x-editable-yii/issues/38
//        if (Yii::app()->request->enableCsrfValidation) {
//            $csrfTokenName = Yii::app()->request->csrfTokenName;
//            $csrfToken = Yii::app()->request->csrfToken;
//            if(!isset($this->params[$csrfTokenName])) {
//                $this->params[$csrfTokenName] = $csrfToken;
//            }
//        }

        //simple options set directly from config
        foreach(array('url', 'type', 'mode', 'placement', 'emptytext', 'params', 'inputclass', 'format', 'viewformat', 'template',
                    'combodate', 'select2', 'viewseparator', 'showbuttons'
                ) as $option) {
            if ($this->$option !== null) {
                $options[$option] = $this->$option;
            }
        }

        if ($this->source) {
            //if source is array --> convert it to x-editable format.
            //Since 1.1.0 source as array with one element is NOT treated as Yii route!
            if(is_array($this->source)) {
                //if first elem is array assume it's normal x-editable format, so just pass it
                if(isset($this->source[0]) && is_array($this->source[0])) {
                    $options['source'] = $this->source;
                } else { //else convert to x-editable source format {value: 1, text: 'abc'}
                    $options['source'] = array();
                    foreach($this->source as $value => $text) {
                        $options['source'][] = array('value' => $value, 'text' => $text);
                    }
                }
            } else { //source is url string (or js function)
                $options['source'] = CHtml::normalizeUrl($this->source);
            }
        }

        //TODO: language for datepicker: use yii config's value if not defined directly

        /*
         unfortunatly datepicker's format does not match Yii locale dateFormat
         so we cannot take format from application locale

         see http://www.unicode.org/reports/tr35/#Date_Format_Patterns

        if($this->type == 'date' && $this->format === null) {
            $this->format = Yii::app()->locale->getDateFormat();
        }
        */
        /*
        if (isset($this->options['datepicker']) && !$this->options['datepicker']['language'] && yii::app()->language) {
            $this->options['datepicker']['language'] = yii::app()->language;
        }
        */

        //callbacks
        foreach(array('validate', 'success', 'display') as $method) {
            if(isset($this->$method)) {
                $options[$method]=(strpos($this->$method, 'js:') !== 0 ? 'js:' : '') . $this->$method;
            }
        }

        //merging options
        $this->options = CMap::mergeArray($this->options, $options);
    }

    public function registerClientScript()
    {
        $script = "\$cnt.find('[rel^=\"{$this->htmlOptions['rel']}\"]')";
        foreach(['init', 'shown', 'save', 'hidden'] as $event) {
            $eventName = 'on'.ucfirst($event);
            if (isset($this->$eventName)) {
                // CJavaScriptExpression appeared only in 1.1.11, will turn to it later
                //$event = ($this->onInit instanceof CJavaScriptExpression) ? $this->onInit : new CJavaScriptExpression($this->onInit);
//                $eventJs = (strpos($this->$eventName, 'js:') !== 0 ? 'js:' : '') . $this->$eventName;
                $script .= '.on("' . $event . '",' . CJavaScript::encode($this->$eventName) . ')';
            }
        }
        //apply editable
        $options = CJavaScript::encode($this->options);
        $script .= ".editable($options);";
        $r =$this->name;
        $id = $this->htmlOptions['identity'];
        $script = <<<JS
        ChEditableCallback.add(function (\$cnt){setTimeout(function(){ $script}, 0)}, '$id');

JS;
        Yii::app()->getClientScript()->registerScript(__CLASS__ . '#' . $this->id, $script);

    }

    public function registerAssets()
    {
//        $am = Yii::app()->getAssetManager();
//        $cs = Yii::app()->getClientScript();
//        $form = yii::app()->editable->form;
//        $mode = $this->mode ? $this->mode : yii::app()->editable->defaults['mode'];
//
//        // bootstrap
//        if($form === EditableConfig::FORM_BOOTSTRAP) {
//            if (($bootstrap = yii::app()->getComponent('bootstrap'))) {
//                $bootstrap->registerCoreCss();
//                $bootstrap->registerCoreScripts();
//            } else {
//                throw new CException('You need to setup Yii-bootstrap extension first.');
//            }
//
//            $assetsUrl = $am->publish(Yii::getPathOfAlias('editable.assets.bootstrap-editable'));
//            $js = 'bootstrap-editable.js';
//            $css = 'bootstrap-editable.css';
//            // jqueryui
//        } elseif($form === EditableConfig::FORM_JQUERYUI) {
//            if($mode === EditableConfig::POPUP && Yii::getVersion() < '1.1.13' ) {
//                throw new CException('jQuery UI editable popup supported from Yii 1.1.13+');
//            }
//
//            //register jquery ui
//            $this->registerJQueryUI();
//
//            $assetsUrl = $am->publish(Yii::getPathOfAlias('editable.assets.jqueryui-editable'));
//            $js = 'jqueryui-editable.js';
//            $css = 'jqueryui-editable.css';
//            // plain jQuery
//        } else {
//            $assetsUrl = $am->publish(Yii::getPathOfAlias('editable.assets.jquery-editable'));
//            $js = 'jquery-editable-poshytip.js';
//            $css = 'jquery-editable.css';
//
//            //publish & register poshytip for popup version
//            if($mode === EditableConfig::POPUP) {
//                $poshytipUrl = $am->publish(Yii::getPathOfAlias('editable.assets.poshytip'));
//                $cs->registerScriptFile($poshytipUrl . '/jquery.poshytip.js');
//                $cs->registerCssFile($poshytipUrl . '/tip-yellowsimple/tip-yellowsimple.css');
//            }
//
//            //register jquery ui for datepicker
//            if($this->type == 'date' || $this->type == 'dateui') {
//                $this->registerJQueryUI();
//            }
//        }
//
//        //register assets
//        $cs->registerCssFile($assetsUrl.'/css/'.$css);
//        $cs->registerScriptFile($assetsUrl.'/js/'.$js, CClientScript::POS_END);
//
//        //include moment.js for combodate
//        if($this->type == 'combodate') {
//            $momentUrl = $am->publish(Yii::getPathOfAlias('editable.assets.moment'));
//            $cs->registerScriptFile($momentUrl.'/moment.min.js');
//        }
//
//        //include select2 lib for select2 type
//        if($this->type == 'select2') {
//            $select2Url = $am->publish(Yii::getPathOfAlias('editable.assets.select2'));
//            $cs->registerScriptFile($select2Url.'/select2.min.js');
//            $cs->registerCssFile($select2Url.'/select2.css');
//        }
//
//        //include bootstrap-datetimepicker
//        if($this->type == 'datetime') {
////            $url = $am->publish(Yii::getPathOfAlias('editable.assets.bootstrap-datetimepicker'));
////            $cs->registerScriptFile($url.'/js/bootstrap-datetimepicker.js');
////            $cs->registerCssFile($url.'/css/datetimepicker.css');
//        }
//
//        //TODO: include locale for datepicker
//        //may be do it manually?
//        /*
//        if ($this->type == 'date' && $this->language && substr($this->language, 0, 2) != 'en') {
//             //todo: check compare dp locale name with yii's
//             $localesUrl = Yii::app()->getAssetManager()->publish(Yii::getPathOfAlias('ext.editable.assets.js.locales'));
//             Yii::app()->clientScript->registerScriptFile($localesUrl . '/bootstrap-datepicker.'. str_replace('_', '-', $this->language).'.js', CClientScript::POS_END);
//        }
//        */
    }

    public function run()
    {
        if($this->apply !== false) {
            $this->buildHtmlOptions();
            $this->buildJsOptions();
            $this->registerAssets();

            $this->registerClientScript();
            $this->renderLink();
        } else {
            $this->renderText();
        }
    }

    /**
     * Добавлегн блочный контейнер для ячейки
     */
    public function renderLink()
    {
        echo '<div class="table-td">'.CHtml::openTag('a', $this->htmlOptions);
        $this->renderText();
        echo CHtml::closeTag('a').'</div>';
    }

    public function renderText()
    {
        $encodedText = $this->encode ? CHtml::encode($this->text) : $this->text;
        if($this->type == 'textarea') {
            $encodedText = preg_replace('/\r?\n/', '<br>', $encodedText);
        }
        echo $encodedText;
    }

    public function getSelector()
    {
        $pk = $this->pk;
        if($pk === null) {
            $pk = 'new';
        } else {
            //support of composite keys: convert to string: e.g. 'id-1_lang-ru'
            if(is_array($pk)) {
                //below not works in PHP < 5.3, see https://github.com/vitalets/x-editable-yii/issues/39
                //$pk = join('_', array_map(function($k, $v) { return $k.'-'.$v; }, array_keys($pk), $pk));
                $buffer = array();
                foreach($pk as $k => $v) {
                    $buffer[] = $k.'-'.$v;
                }
                $pk = join('_', $buffer);
            }
        }

        return $this->name.'_'.$pk;
    }

    /**
     * Returns is autotext should be applied to widget
     *
     * @param mixed $options
     * @param mixed $type
     */
    public static function isAutotext($options, $type)
    {
        return (!isset($options['autotext']) || $options['autotext'] !== 'never')
            && in_array($type, array(
                'select',
                'checklist',
                'date',
                'datetime',
                'dateui',
                'combodate',
                'select2'
            ));
    }

    /**
     * Returns php-array as valid x-editable source in format:
     * [{value: 1, text: 'text1'}, {...}]
     *
     * See https://github.com/vitalets/x-editable-yii/issues/37
     *
     * @param mixed $models
     * @param mixed $valueField
     * @param mixed $textField
     * @param mixed $groupField
     * @param mixed $groupTextField
     */
    public static function source($models, $valueField='', $textField='', $groupField='', $groupTextField='')
    {
        $listData=array();

        $first = reset($models);

        //simple 1-dimensional array: 0 => 'text 0', 1 => 'text 1'
        if($first && (is_string($first) || is_numeric($first))) {
            foreach($models as $key => $text) {
                $listData[] = array('value' => $key, 'text' => $text);
            }
            return $listData;
        }

        // 2-dimensional array or dataset
        if($groupField === '') {
            foreach($models as $model) {
                $value = CHtml::value($model, $valueField);
                $text = CHtml::value($model, $textField);
                $listData[] = array('value' => $value, 'text' => $text);
            }
        } else {
            if(!$groupTextField) {
                $groupTextField = $groupField;
            }
            $groups = array();
            foreach($models as $model) {
                $group=CHtml::value($model,$groupField);
                $groupText=CHtml::value($model,$groupTextField);
                $value=CHtml::value($model,$valueField);
                $text=CHtml::value($model,$textField);
                if($group === null) {
                    $listData[] = array('value' => $value, 'text' => $text);
                } else {
                    if(!isset($groups[$group])) {
                        $groups[$group] = array('value' => $group, 'text' => $groupText, 'children' => array(), 'index' => count($listData));
                        $listData[] = 'group'; //placeholder, will be replaced in future
                    }
                    $groups[$group]['children'][] = array('value' => $value, 'text' => $text);
                }
            }

            //fill placeholders with group data           
            foreach($groups as $group) {
                $index = $group['index'];
                unset($group['index']);
                $listData[$index] = $group;
            }
        }

        return $listData;
    }



    /**
     * method to register jQuery UI with build-in or custom theme
     *
     */
    protected function registerJQueryUI()
    {
        $cs=Yii::app()->getClientScript();
        if($this->themeUrl===null) {
            $this->themeUrl=$cs->getCoreScriptUrl().'/jui/css';
        }
        $cs->registerCssFile($this->themeUrl.'/'.$this->theme.'/'.$this->cssFile);
        $cs->registerPackage('jquery.ui');
    }
}
