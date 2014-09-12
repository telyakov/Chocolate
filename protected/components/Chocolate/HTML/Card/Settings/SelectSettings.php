<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 12:45
 */

namespace Chocolate\HTML\Card\Settings;
use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\Card\Traits\DefaultSaveFunction;
use Chocolate\HTML\Card\Traits\DefaultValidateFunction;
use Chocolate\HTML\Card\Traits\SelectInitFunction;
use Chocolate\HTML\ChHtml;
use Chocolate\HTML\Traits\SelectGetSource;

class SelectSettings extends EditableCardElementSettings {
    use DefaultValidateFunction;
    use DefaultSaveFunction;
    use SelectInitFunction;
    use SelectGetSource;
    use DefaultHidden;
    public function render( $pk, $view,$formID, $tabIndex)
    {
//        return '';
        $name =  $this->getName();
        $isAllowEdit = $this->getAllowEdit();
        $options = [
            'type' => 'select',
            'name' => $name,
            'pk' => ChHtml::ID_KEY,
            'source' => $this->getSource($this->columnProperties,$this->model),
            'onSave' => $this->createSaveFunction($name, $isAllowEdit),
            'title' => $this->getCaption(),
            'showbuttons' => false,
            'mode' => 'inline',
            'htmlOptions' => [
                'tabIndex' => $tabIndex
            ],
            'options' => [
                'onblur' => 'submit',
//                'toggle' => 'mouseenter'
            ],
//            'emptytext' =>'',
            'onHidden' => $this->createHiddenFunction(),
            'inputclass'=> 'chocolate-select',
            'onInit' =>$this->createInitFunction($name, $isAllowEdit),
            'validate'=> $this->createValidateFunction($isAllowEdit, $this->isRequired())
        ];

        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable', $options, true);
    }
}