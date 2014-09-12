<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 13.12.13
 * Time: 10:51
 */

namespace Chocolate\HTML\Grid\Traits;


trait DefaultInitFunction {
    public function createInitFunction($allowEdit){
        $initScript = <<<JS
                    if(!'$allowEdit'){ $(this).unbind('click');}
JS;
        return 'js:function(){' . $initScript . '}';
    }

} 