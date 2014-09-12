<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 05.12.13
 * Time: 12:22
 */

namespace Chocolate\HTML\Card\Settings;

use Chocolate\HTML\Card\Traits\CheckBoxDisplayFunction;
use Chocolate\HTML\Card\Traits\CheckBoxInitFunction;
use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\ChHtml;

class CheckBoxSettings extends EditableCardElementSettings
{
    use CheckBoxInitFunction;
    use CheckBoxDisplayFunction;
    use DefaultHidden;

    public function render($pk, $view, $formID, $tabIndex)
    {
        $name = $this->getName();
        $options = [
            'type' => 'checklist',
            'name' => $name,
            'mode' => 'inline',
            'options' => [
                'onblur' => 'submit',
//                 'toggle' => 'mouseenter',
            ],
            'htmlOptions' => [
                'tabIndex' => $tabIndex
            ],
            'showbuttons' => false,
            'pk' => ChHtml::ID_KEY,
            'onHidden' => $this->createHiddenFunction(),
            'onInit' => $this->createInitFunction($name, $this->getAllowEdit()),
            'source' => [1 => ''],
            'display' => $this->createDisplayFunction($this->columnProperties->getCustomProperties())
        ];

        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable',
            $options, true);
    }

} 