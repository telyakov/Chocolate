<?php
/**
 * За основу взят DynaTree, радикально доработан мною:)
 */
class ChDynaTree extends CWidget
{
    public $columnID = 'id';
    public $columnParentID = 'parentid';
    public $columnTitle = 'name';
    public $rootID = 'root';
    public $separator = '|';
    public $url = null;
    public $descriptionData = [];
    public $isRestoreState = true;
    public $isExpandNodes = true;
    public $isSelectAll = false;
    public $isMultiSelect = false;
    public $data = [];
    public $form = 'form';
    public $attribute;
    /**
     * @var $model CModel
     */
    public $model;
    public $htmlOptions = [];
    public $options = [];
    protected $_buttonID;

    public function init()
    {
        $this->layoutTree();
        $this->registerClientScripts();
    }

    protected function layoutTree()
    {
        $id = uniqid('tree');
        $this->_buttonID = $id;
        ob_start();
        echo CHtml::openTag('div', $this->htmlOptions);
        echo CHtml::activeLabelEx($this->model, $this->attribute);
        echo CHtml::openTag('select');
        echo CHtml::closeTag('select');
        echo CHtml::button('', ['class' => 'tree-button', 'id' => $id, 'title'=>'Кликните, чтобы выбрать фильтр']);
        echo CHtml::activeHiddenField($this->model, $this->attribute);
        echo CHtml::closeTag('div');
        ob_end_flush();
    }

    protected function registerClientScripts()
    {
        $options = CJavaScript::encode(array_merge(
            $this->getDefaultOptions(),
            $this->options,
            [
                'children' => $this->data,
                'url' => $this->url,
                'expand_nodes' => $this->isExpandNodes,
                'select_all' => $this->isSelectAll,
                'restore_state' => $this->isRestoreState,
                'separator' => $this->separator,
                'root_id' => $this->rootID,
                'title' => $this->model->getAttributeLabel($this->attribute),
                'column_title' => $this->columnTitle,
                'column_id' => $this->columnID,
                'column_parent_id' => $this->columnParentID,
                'infoPanel' => true
            ]
        ));
        $script = $this->createTreeScript($options);

        Yii::app()->getClientScript()->registerScript($this->_buttonID,
            <<<JS
                $('#$this->_buttonID').on('click', function(){
                    $script
                })
JS
            , CClientScript::POS_LOAD);
    }

    protected function getDefaultOptions()
    {
        return [
            'debugLevel' => 0,
            'checkbox' => true,
            'selectMode' => $this->getSelectMode(),
            'onQuerySelect' => 'js:function(flag, node){chFunctions.treeOnQuerySelect(flag, node)}'
        ];
    }

    protected function getSelectMode()
    {
        if ($this->isMultiSelect) {
            return 2;
        }
        return 1;
    }

    protected function createTreeScript($options)
    {
        $script = <<<JS
        var dnt = facade.getFactoryModule().makeChDynatree($(this));
        dnt.build($options);
JS;
        return $script;
    }

}
?>
