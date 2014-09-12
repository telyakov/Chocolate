<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 17.01.14
 * Time: 12:27
 */

namespace Chocolate\HTML\Grid\Traits;


trait DateSaveFunction {
    public function createSaveFunction($isAllowEdit, $name){
        if(!$isAllowEdit){
            return null;
        }
        $initScript = <<<JS
chFunctions.dateColumnSaveFunction(e, params, '$name');
JS;
        return 'js:function(e, params){' . $initScript . '}';
    }
}