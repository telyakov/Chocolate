<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.12.13
 * Time: 9:05
 */

namespace Chocolate\HTML\Card\Traits;


trait DefaultValidateFunction
{

    protected function createValidateFunction($isAllowEdit, $required)
    {
        if (!$isAllowEdit || !$required) {
            return null;
        }
        return 'js:function(value){chCardFunction.defaultValidateFunc($(this), value)}';
    }
} 