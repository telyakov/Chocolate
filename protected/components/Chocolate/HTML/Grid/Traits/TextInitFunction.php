<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 13.01.14
 * Time: 15:48
 */

namespace Chocolate\HTML\Grid\Traits;


trait TextInitFunction
{
    public function createInitFunction($allowEdit, $columnName, $caption, $isMarkupSupport)
    {
        $initScript = <<<JS
            chFunctions.textInitFunc(this, e, '$allowEdit', '$columnName', '$caption', '$isMarkupSupport', editable['\$element']);
JS;
        return 'js:function(e, editable){' . $initScript . '}';
    }
} 