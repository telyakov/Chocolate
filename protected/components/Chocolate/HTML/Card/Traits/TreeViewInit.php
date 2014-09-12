<?
namespace Chocolate\HTML\Card\Traits;


trait TreeViewInit
{

    function dynamicInit($attribute, $allowedit, $titleKey, $caption, $isSingle, $sql)
    {
        $script = <<<JS
                ch.card.treeView.dynamicInit($(this), '$attribute', '$allowedit', '$titleKey', editable, '$caption', '$isSingle', '$sql');
JS;
        return 'js:function(e, editable){' . $script . '}';
    }

    function gridInit($attribute, $allowedit, $titleKey, $caption,$isSingle)
    {
        $script = <<<JS
        ch.card.treeView.gridInit($(this), '$attribute', '$allowedit', '$titleKey', editable, '$caption', '$isSingle')
JS;
        return 'js:function(e, editable){' . $script . '}';
    }

    function defaultInit($attribute, $allowedit, $titleKey, $caption, $isSingle)
    {
        $script = <<<JS
                ch.card.treeView.defaultInit($(this), '$attribute', '$allowedit', '$titleKey', editable, '$caption', '$isSingle')
JS;
        return 'js:function(e, editable){' . $script . '}';

    }
} 