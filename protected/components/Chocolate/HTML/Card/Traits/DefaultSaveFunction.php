<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.12.13
 * Time: 8:46
 */

namespace Chocolate\HTML\Card\Traits;


trait DefaultSaveFunction
{

    public function createSaveFunction($name, $isAllowEdit)
    {
        if(!$isAllowEdit){
            return null;
        }
        $initScript = <<<JS
        chCardFunction.defaultSaveFunc(e, params, '$name');
JS;
        return 'js:function(e, params){' . $initScript . '}';
    }
}