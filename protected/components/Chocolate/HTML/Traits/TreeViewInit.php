<?
namespace Chocolate\HTML\Traits;

trait TreeViewInit {

    public function createInit($caption, $dataKey, $allowEdit, $isSingle){
        $script = <<<JS
return chFunctions.treeViewInitFunc($(this), '$caption', '$dataKey', '$allowEdit', '$isSingle');
JS;

        return 'js:function(){'.$script .'}';
    }
} 