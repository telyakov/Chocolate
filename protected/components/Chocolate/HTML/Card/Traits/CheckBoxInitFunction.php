<?
namespace Chocolate\HTML\Card\Traits;

trait CheckBoxInitFunction
{
    public function createInitFunction($attribute, $allowEdit)
    {

        $initScript = <<<JS
    chCardFunction.checkBoxInitFunction($(this), '$attribute', '$allowEdit');
JS;
        return 'js:function(){' . $initScript . '}';
    }
}