<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 17.03.14
 * Time: 11:59
 */

namespace Chocolate\HTML\Card\Traits;


trait TextAreaInitFunction {
    protected function createInitFunction($attribute, $allowEdit, $caption, $isNeedFormat, $isMarkupSupport )
    {
        $initScript = <<<JS
        chCardFunction.textAreaInitFunc(e, editable, '$attribute', '$allowEdit', '$caption', '$isNeedFormat', this, '$isMarkupSupport');
JS;
        return 'js:function(e, editable){' . $initScript . '}';
    }
} 