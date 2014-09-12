<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 05.09.13
 * Time: 15:03
 */
Yii::import('zii.widgets.grid.CDataColumn');
class ChControlsColumn  extends CDataColumn{
    public $delete;
    public $card;
    public $link;

    public static function getOptions(){
        return [
            'name' => '',
            'class' => 'ChControlsColumn',
            'card' => true,
            'headerHtmlOptions' => ['data-id'=>'chocolate-control-column']
        ];
    }
    protected function renderDataCellContent($row, $data)
    {
        if (isset($this->delete)) {
            self::renderDeleteButton();
        }

        if(isset($this->card)){
            self::renderCardButton();
        }
    }

    protected function getItemValue($row, $data)
    {
        if (!empty($this->value))
            return $this->evaluateExpression($this->value, array('data' => $data, 'row' => $row));
        elseif (!empty($this->name))
            return CHtml::value($data, $this->name);
        return null;
    }

    public function renderDataCell($row)
    {

    }
    public static function renderDeleteButton(){
        echo '<span class="delete-button" title="Удалить карточку"></i></span>';
    }

    public static function renderCardButton(){

        echo '<span class="card-button" data-id = "card-button" title="Открыть карточку"></span>';
    }

}