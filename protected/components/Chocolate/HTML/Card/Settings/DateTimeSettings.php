<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 12:44
 */

namespace Chocolate\HTML\Card\Settings;
use Chocolate\HTML\Card\Traits\DateInitFunction;
use Chocolate\HTML\Card\Traits\DateSaveFunction;
use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\Card\Traits\DefaultSaveFunction;
use Chocolate\HTML\Card\Traits\DefaultValidateFunction;
use Chocolate\HTML\ChHtml;

class DateTimeSettings extends EditableCardElementSettings {
   use DefaultValidateFunction;
    use DateSaveFunction;
    use DateInitFunction;
    use DefaultHidden;
    public function render($pk, $view,$formID, $tabIndex)
    {
        $name =  $this->getName();
        $isAllowEdit = $this->getAllowEdit();

        $options = [
            'type' => 'datetime',
            'name' => $name,
            'pk' => ChHtml::ID_KEY,
            'format'      => \Yii::app()->params['soap_date_format'],
            'viewformat'  => \Yii::app()->params['editable_date_time_format'],
            'showbuttons' => false,
            'mode' =>'inline',
            'htmlOptions' => [
                'tabIndex' => $tabIndex
            ],
            'options' => [
                'onblur' => 'submit',
                'datetimepicker' => [
                    'language' => 'ru',
                    'todayBtn' => true,
                    'weekStart' => 1,
                ],
            ],
            'emptytext' =>'',
//            'source' => [],
            'onHidden' => $this->createHiddenFunction(),
//            'onShown' => 'js:function(e, editable){console.log(editable)}',
            'onSave' => $this->createSaveFunction($name, $isAllowEdit),
            'title' => $this->getCaption(),
            'onInit' => $this->createInitFunction($name, $isAllowEdit),
            'validate' => $this->createValidateFunction($isAllowEdit, $this->isRequired())
        ];

        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable',
            $options, true);
    }
} 