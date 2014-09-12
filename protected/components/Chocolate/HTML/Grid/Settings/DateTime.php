<?
namespace Chocolate\HTML\Grid\Settings;

use Chocolate\HTML\Grid\Traits\DateInitFunction;
use Chocolate\HTML\Grid\Traits\DateSaveFunction;
use FrameWork\DataForm\DataFormModel\GridColumnType;

class DateTime extends XEditableSettings {
    use DateSaveFunction;
    use DateInitFunction;

    public function getData()
    {
        $name = $this->getName();
        $isAllowEdit = $this->getAllowEdit();
        $options = [
            'header' => $this->getHeader(),
            'name' =>$name,
            'htmlOptions' => $this->getHtmlOptions(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' =>[
                'mode' => 'inline',
                'options' => [
                    'onblur' => 'submit',
                    'datetimepicker' => [
                        'language' => 'ru',
                        'todayBtn' => true,
                        'weekStart' => 1
                    ],
                ],
                'showbuttons' => false,
                'format'      => \Yii::app()->params['soap_date_format'],
                'viewformat'  => \Yii::app()->params['editable_date_time_format'],
                'onSave' => $this->createSaveFunction($isAllowEdit,$name),
                'onInit' => $this->createInitFunction($isAllowEdit)
            ]
        ];
        if($this->columnProperties->getGridEditType()==GridColumnType::Date){
           $options['editable']['type'] = 'date';
           $options['editable']['inputclass'] = 'input-medium';
        }else{
            $options['editable']['type'] = 'datetime';
        }
        return $options;
    }
}