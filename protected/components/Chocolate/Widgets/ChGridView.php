<?php
/**
 * Переработано под шоколад 'bootstrap.widgets.TbExtendedGridView' затем 'bootstrap.widgets.TbGridView' затем  CGridView
 */
Yii::import('zii.widgets.CBaseListView');
Yii::import('zii.widgets.grid.CDataColumn');
Yii::import('zii.widgets.grid.CLinkColumn');
Yii::import('zii.widgets.grid.CButtonColumn');
Yii::import('zii.widgets.grid.CCheckBoxColumn');
class ChGridView extends CBaseListView
{
    /**
     * @var string the CSS class name for the pager container. Defaults to 'pagination'.
     */
    public $pagerCssClass = 'pagination';
    /**
     * @var array the configuration for the pager.
     * Defaults to <code>array('class'=>'ext.bootstrap.widgets.TbPager')</code>.
     */
    public $pager = array('class' => 'bootstrap.widgets.TbPager');
    /**
     * @var array grid column configuration. Each array element represents the configuration
     * for one particular grid column which can be either a string or an array.
     *
     * When a column is specified as a string, it should be in the format of "name:type:header",
     * where "type" and "header" are optional. A {@link CDataColumn} instance will be created in this case,
     * whose {@link CDataColumn::name}, {@link CDataColumn::type} and {@link CDataColumn::header}
     * properties will be initialized accordingly.
     *
     * When a column is specified as an array, it will be used to create a grid column instance, where
     * the 'class' element specifies the column class name (defaults to {@link CDataColumn} if absent).
     * Currently, these official column classes are provided: {@link CDataColumn},
     * {@link CLinkColumn}, {@link CButtonColumn} and {@link CCheckBoxColumn}.
     */
    public $columns = array();
    /**
     * @var integer the number of table body rows that can be selected. If 0, it means rows cannot be selected.
     * If 1, only one row can be selected. If 2 or any other number, it means multiple rows can be selected.
     * A selected row will have a CSS class named 'selected'. You may also call the JavaScript function
     * <code>$(gridID).yiiGridView('getSelection')</code> to retrieve the key values of the currently selected
     * rows (gridID is the DOM selector of the grid).
     */
    public $selectableRows = 1;
    /**
     * @var string the text to be displayed in a data cell when a data value is null. This property will NOT be HTML-encoded
     * when rendering. Defaults to an HTML blank.
     */
    public $nullDisplay = '&nbsp;';
    /**
     * @var string the text to be displayed in an empty grid cell. This property will NOT be HTML-encoded when rendering. Defaults to an HTML blank.
     * This differs from {@link nullDisplay} in that {@link nullDisplay} is only used by {@link CDataColumn} to render
     * null data values.
     * @since 1.1.7
     */
    public $blankDisplay = '&nbsp;';
    /**
     * @var string the CSS class name that will be assigned to the widget container element
     * when the widget is updating its content via AJAX. Defaults to 'grid-view-loading'.
     * @since 1.1.1
     */
    public $loadingCssClass = 'grid-view-loading';

    public function init()
    {
        if(isset($this->htmlOptions['id']))
            $this->id=$this->htmlOptions['id'];
        else
            $this->htmlOptions['id']=$this->id;

        if (!isset($this->htmlOptions['class']))
            $this->htmlOptions['class'] = 'grid-view';
        $this->initColumns();
    }


    /**
     * Creates column objects and initializes them.
     */
    protected function initColumns()
    {
        $id = $this->getId();
        foreach ($this->columns as $i => $column) {
            $column = Yii::createComponent($column, $this);
            if ($column->id === null)
                $column->id = $id . '_c' . $i;
            $this->columns[$i] = $column;
        }
    }

    public function renderContent()
    {
        parent::renderContent();
        $id = $this->htmlOptions['id'];
        $script = <<<JS
            ChObjectStorage.create($('#$id>table'), 'ChTable').initScript();
JS;
        \Yii::app()->clientScript->registerScript($id, $script, CClientScript::POS_READY);
    }

    public function renderKeys()
    {
        return false;
    }

    /**
     * Registers necessary client scripts.
     */
    public function registerClientScript()
    {
        $this->doNothing();
    }

    protected function doNothing()
    {
        //заглушка
    }

    public function renderItems()
    {
        echo "<table tabindex=0 class=\"{$this->itemsCssClass}\"><thead><tr>";
        /**
         * @var $column CDataColumn
         */
        foreach ($this->columns as $column){
            $column->renderHeaderCell();
            $column->renderDataCell(0);
        }

        echo '</tr></thead><tbody>';
        //затычка для инициализации скриптов,  НЕ УДАЛЯТЬ
        echo CHtml::openTag('tr', ['style' => 'display:none']);
        echo '</tr></tbody></table>';

    }
}