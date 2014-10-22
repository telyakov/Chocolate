<?
namespace Chocolate\HTML\Card\Settings;

use Chocolate\HTML\Card\Traits\DateInitFunction;
use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\Card\Traits\DefaultSaveFunction;
use Chocolate\HTML\Card\Traits\DefaultValidateFunction;
use Chocolate\HTML\ChHtml;

class DateSettings extends EditableCardElementSettings {
    use DefaultValidateFunction;
    use DefaultSaveFunction;
    use DateInitFunction;
    use DefaultHidden;
    public function render($pk, $view,$formID, $tabIndex)
    {
        $name = $this->getName();
        $isAllowEdit = $this->getAllowEdit();
        $options = [
            'type' => 'date',
            'name' => $name,
            'pk' => ChHtml::ID_KEY,
            'format'      =>   \Yii::app()->params['soap_date_format'],
            'viewformat'  =>  \Yii::app()->params['editable_date_format'],
            'onSave' => $this->createSaveFunction($name, $isAllowEdit),
            'title' => $this->getCaption(),
            'mode' =>'inline',
            'onInit' => $this->createInitFunction($name, $isAllowEdit),
            'onHidden' => $this->createHiddenFunction(),
            'validate' => $this->createValidateFunction($isAllowEdit, $this->isRequired()),
            'htmlOptions' => [
                'tabIndex' => $tabIndex,
                'id' => ChHtml::generateUniqueID()
            ],
            'options' =>[
                'onblur' => 'submit',
                'datetimepicker' => [
                    'weekStart' => 1
//                    'language' => 'ru',
//                    'todayBtn' => true,
                ],
            ]
        ];

        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable',
            $options, true);
    }
}
