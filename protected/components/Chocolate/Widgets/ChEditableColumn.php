<?php
/**
 * За основу взят EditableColumn. Используется в качества столбца для сетки.
 */
Yii::import('editable.EditableField');
Yii::import('zii.widgets.grid.CDataColumn');


class ChEditableColumn extends CDataColumn
{
    /**
     * @var array editable config options.
     * @see EditableField config
     */
    public $editable = array();

    //flag to render client script only once for all column cells

    public function init()
    {
        if (!$this->name) {
            throw new CException('You should provide name for EditableColumn');
        }

        parent::init();
    }

    public function renderDataCell($row)
    {
        $this->editable['name'] = $this->name;
        /**
         * @var $widget ChEditable
         */
        $widget = $this->grid->controller->createWidget('Chocolate.Widgets.ChEditable', $this->editable);
        $widget->buildHtmlOptions();
        $widget->buildJsOptions();
        $widget->htmlOptions['rel'] = $this->grid->id . '_' . $this->name;
        $widget->htmlOptions['identity'] = $this->grid->id;
        $widget->registerClientScript();
    }

    protected function renderDataCellContent()
    {
        $this->editable['name'] = $this->name;
        /**
         * @var $widget ChEditable
         */
        $widget = $this->grid->controller->createWidget('Chocolate.Widgets.ChEditable', $this->editable);
        $widget->buildHtmlOptions();
        $widget->buildJsOptions();
        $widget->htmlOptions['rel'] = $this->grid->id . '_' . $this->name;
        $widget->registerClientScript();
    }

    /*
    Require this overwrite to show bootstrap filter field
    */

    protected function renderHeaderCellContent()
    {
        if (yii::app()->editable->form != EditableConfig::FORM_BOOTSTRAP) {
            parent::renderHeaderCellContent();
            return;
        }

        if ($this->grid->enableSorting && $this->sortable && $this->name !== null) {
            $sort = $this->grid->dataProvider->getSort();
            $label = isset($this->header) ? $this->header : $sort->resolveLabel($this->name);

            if ($sort->resolveAttribute($this->name) !== false)
                $label .= '<span class="caret"></span>';

            echo $sort->link($this->name, $label, array('class' => 'sort-link'));
        } else {
            if ($this->name !== null && $this->header === null) {
                if ($this->grid->dataProvider instanceof CActiveDataProvider)
                    echo CHtml::encode($this->grid->dataProvider->model->getAttributeLabel($this->name));
                else
                    echo CHtml::encode($this->name);
            } else
                parent::renderHeaderCellContent();
        }
    }
} 