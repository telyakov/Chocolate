<?php
namespace Chocolate\HTML\Card\Settings;
use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\Card\Traits\DefaultSaveFunction;
use Chocolate\HTML\Card\Traits\DefaultValidateFunction;
use Chocolate\HTML\Card\Traits\TextAreaInitFunction;
use Chocolate\HTML\ChHtml;
use Chocolate\HTML\Traits\TextShownFunction;

class TextSettings extends EditableCardElementSettings{
    use TextAreaInitFunction;
    use DefaultSaveFunction;
    use DefaultValidateFunction;
    use TextShownFunction;
    use DefaultHidden;

    public function render($pk, $view,$formID, $tabIndex)
    {
        $name = $this->getName();
        $isAllowEdit = $this->getAllowEdit();
        $isMarkupSupport = $this->columnProperties->isMarkupSupport();
        $options = [
            'name' => $name,
            'pk' => ChHtml::ID_KEY,
            'onSave' => $this->createSaveFunction($name, $isAllowEdit),
            'title' => $this->getCaption(),
            'mode' => 'inline',
            'showbuttons' => false,
            'emptytext' =>'',
            'options' => [
                'onblur' => 'submit',
//                'toggle' => 'mouseenter'
            ],
            'htmlOptions' => [
                'tabIndex' => $tabIndex
            ],
            'inputclass' => 'chocolate-textarea',
//            'onHidden' => $this->createHiddenFunction(),
            'onInit' => $this->createInitFunction($name, $isAllowEdit, $this->getCaption(),  $this->columnProperties->isNeedFormat(), $isMarkupSupport),
            'validate'=> $this->createValidateFunction($isAllowEdit, $this->isRequired())
        ];

        if($isMarkupSupport){
            $options['type'] = 'wysihtml5';
            $options['onShown'] = $this->createShownFunction($isAllowEdit);
            $options['htmlOptions']['class'] = 'ch-card-iframe';
            $options['options']['wysihtml5'] = [
                'font-styles' => false,
                'emphasis' => false,
                'lists' => false,
                'link' => false,
                'image' => false
            ];
        }else{
            $options['type'] = 'text';
            $options['options']['tpl'] = '<textarea/>';
        }

        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable',
            $options, true);
    }

    public function isStatic(){
        return $this->getHeight() == '1';
    }
}
