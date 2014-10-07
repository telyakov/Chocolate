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
                    'title' => $this->columnProperties->getVisibleCaption(),
                    'view' => $this->columnProperties->getViewName(),
                    'fromID' => $this->columnProperties->getFromID(),
                    'fromName' => $this->columnProperties->getFromName(),
                    'toName' => $this->columnProperties->getToName(),
                    'toID' => $this->columnProperties->getToID(),
                ],
                'title' =>  $this->columnProperties->getCaption(),
            ]
        ];
    }
}