<?
namespace Chocolate\HTML\Grid\Settings;
use Chocolate\HTML\Traits\Select2GetSource;
use Chocolate\HTML\Traits\TreeViewInit;

class TreeView extends XEditableSettings
{
    use Select2GetSource;
    use TreeViewInit;

    public function getData()
    {
        return [
            'header' => $this->getHeader(),
            'name' =>  $this->getName(),
            'htmlOptions' => $this->getHtmlOptions(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' => [
                'type' => 'text',
                'onInit' => $this->createInit($this->getCaption(), $this->columnProperties->getKey(), $this->columnProperties->getAllowEdit(), $this->isSingle()),
                'mode' => 'modal',
                'showbuttons' => false,
                'options' =>[
                    'data-from-id' => $this->columnProperties->getKey(),
                ],
                'source' => $this->getSource($this->columnProperties, $this->model),
            ]
        ];
    }
}