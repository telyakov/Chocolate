<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 13.12.13
 * Time: 14:29
 */

namespace Chocolate\HTML\Grid\Traits;


trait SelectInitFunction {
    public function createInitFunction($isAllowEdit){
        $initScript = <<<JS
chFunctions.selectColumnInitFunc($(this),'$isAllowEdit');
JS;
        return 'js:function(){' . $initScript . '}';
    }

} 