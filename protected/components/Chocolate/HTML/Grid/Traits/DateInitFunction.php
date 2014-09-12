<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 13.12.13
 * Time: 15:58
 */

namespace Chocolate\HTML\Grid\Traits;


trait DateInitFunction {
    public function createInitFunction($isAllowEdit){
        $initScript = <<<JS
chFunctions.dateColumnInitFunction($(this),'$isAllowEdit');
JS;
        return 'js:function(){' . $initScript . '}';
    }
} 