<?
namespace Chocolate\HTML\Grid\Settings;

class GridSettings extends XEditableSettings
{
    public function getData()
    {
        return [
            'header' => $this->getHeader(),
            'name' => $this->getName(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' => [
                'type' => 'text',
                'mode' => 'inline',
                'showbuttons' => false,
                'disabled' => true,
                'options'=>[
                    'view' => $this->columnProperties->getViewName(),
                ],
                'title' =>  $this->columnProperties->getCaption(),
            ]
        ];
    }
}