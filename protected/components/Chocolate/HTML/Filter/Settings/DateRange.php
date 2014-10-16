<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 15:08
 */

namespace Chocolate\HTML\Filter\Settings;

class DateRange extends EditableFilterSettings{

    const CURRENT_MONTH = 'currentmonth';
    public function getAttributeFrom(){
        return $this->getAttribute();
    }

    public static function getAttributeTo($attrFrom){
        return str_replace('from', 'to', $attrFrom);
    }

    public function render(\CModel $model, \ChFilterForm $form)
    {
        if($default= $this->filter->getDefaultValue()){
                    $nameFrom =$this->filter->getName();
                    $nameTo =self::getAttributeTo($nameFrom);
            switch($default){
                case self::CURRENT_MONTH:
                    $from = date('Y.m.01');
                    $to = date('Y.m.t');
                    $model->filters[$nameFrom] = $from;
                    $model->filters[$nameTo] =$to;
                    break;
                default:
                    break;

            }
        }
//        $model->filters[$]
        $id = uniqid();
        echo \CHtml::openTag('li', [
            'class' => 'filter-item',
            'id' => $id
        ]);
        \Yii::app()->controller->renderPartial('//_filters/_date_range', [
            'form' => $form,
            'model' => $model,
            'settings' => $this
        ]);
        return $id;

    }

}