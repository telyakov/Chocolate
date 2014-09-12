<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.12.13
 * Time: 9:11
 */

namespace Chocolate\HTML\Card\Traits;


trait DateInitFunction
{

    protected function createInitFunction($attribute, $allowEdit)
    {
        $script = <<<JS
chCardFunction.dateInitFunction($(this), '$attribute', '$allowEdit')
JS;
        return 'js:function(){' . $script . '}';
    }
} 