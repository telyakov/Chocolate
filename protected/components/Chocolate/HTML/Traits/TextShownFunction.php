<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 24.07.14
 * Time: 10:32
 */

namespace Chocolate\HTML\Traits;


trait TextShownFunction {

    public function createShownFunction($isAllowEdit){
        if($isAllowEdit){
            $script = <<<JS
            chFunctions.textShownFunction(e, editable);
JS;

            return 'js:function(e, editable){' .$script .'}';
        }
        return null;

    }
} 