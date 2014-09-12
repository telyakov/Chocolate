<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.12.13
 * Time: 9:19
 */

namespace Chocolate\HTML\Card\Traits;


trait SelectInitFunction {
    protected function createInitFunction( $attribute, $allowEdit)
    {

        $initScript = <<<JS
    chCardFunction.selectInitFunction($(this), '$attribute', '$allowEdit');
JS;
        return 'js:function(){' . $initScript . '}';
    }
} 