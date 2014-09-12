<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 14:15
 */

namespace Chocolate\HTML\Grid\Traits;


trait DefaultSaveFunction
{
    public function createSaveFunction($name, $isAllowEdit=true)
    {
        if(!$isAllowEdit){
            return null;
        }
        $initScript = <<<JS
chFunctions.defaultColumnSaveFunc(e, params, '$name');
JS;
        return 'js:function(e, params){' . $initScript . '}';
    }
}

