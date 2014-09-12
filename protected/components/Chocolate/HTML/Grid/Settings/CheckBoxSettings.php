<?
namespace Chocolate\HTML\Grid\Settings;

use Chocolate\HTML\Card\Traits\CheckBoxDisplayFunction;
use Chocolate\HTML\Grid\Traits\CheckBoxInitFunction;

class CheckBoxSettings extends XEditableSettings
{
    use CheckBoxInitFunction;
    use CheckBoxDisplayFunction;

    public function getData()
    {
        $name = $this->getName();
        return [
            'header' => $this->getHeader(),
            'name' => $name,
            'htmlOptions' => $this->getHtmlOptions(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' => [
                'mode' => 'inline',
                'options' => ['onblur' => 'submit'],
                'showbuttons' => false,
                'type' => 'checklist',
                'source' => [1 => ''],
                'onInit' => $this->createInitFunction($name, $this->getAllowEdit()),
                'display' => $this->createDisplayFunction($this->columnProperties->getCustomProperties())
            ]
        ];
    }
}