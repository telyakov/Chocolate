<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.12.13
 * Time: 9:15
 */

namespace Chocolate\HTML\Card\Traits;


trait Select2InitFunction {

    protected function createInitFunction($attribute, $allowedit,  $titleKey, $caption){
        $script = <<<JS
chCardFunction.select2InitFunction($(this), '$attribute', '$allowedit', '$titleKey', editable, '$caption');
JS;
        return 'js:function(e, editable){' . $script . '}';
    }
} 