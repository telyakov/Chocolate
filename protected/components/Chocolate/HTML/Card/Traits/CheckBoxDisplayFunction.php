<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 17.12.13
 * Time: 12:38
 */

namespace Chocolate\HTML\Card\Traits;


use FrameWork\DataForm\DataFormModel\ColumnCustomProperties;

trait CheckBoxDisplayFunction {
    public function createDisplayFunction(ColumnCustomProperties $property){
        $label = $property->getLabel();
        $color = $property->getColor();
        $priority = $property->getPriority();

        $displayScript = <<<JS
    chCardFunction.checkBoxDisplayFunction(value, $(this), '$label', '$color', '$priority');
JS;
        return 'js:function(value, sourceData){' . $displayScript . '}';
    }

} 