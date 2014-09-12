<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 04.06.14
 * Time: 16:46
 */

namespace Chocolate\HTML\Card\Traits;


trait DateSaveFunction {

    public function createSaveFunction($name, $isAllowEdit){
        if(!$isAllowEdit){
            return null;
        }
        $initScript = <<<JS
        chCardFunction.dateSaveFunc(e, params, '$name');
JS;
        return 'js:function(e, params){' . $initScript . '}';
    }
}