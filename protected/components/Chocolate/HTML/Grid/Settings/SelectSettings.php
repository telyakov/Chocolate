<?
namespace Chocolate\HTML\Grid\Settings;
use Chocolate\HTML\Grid\Traits\DefaultSaveFunction;
use Chocolate\HTML\Grid\Traits\SelectInitFunction;
use Chocolate\HTML\Traits\SelectGetSource;

class SelectSettings  extends XEditableSettings{
    use DefaultSaveFunction;
    use SelectInitFunction;
    use SelectGetSource;
    public function getData()
    {
        $name = $this->getName();
        $allowEdit = $this->getAllowEdit();

        return [
            'header' => $this->getHeader(),
            'name' =>$name,
            'htmlOptions' => $this->getHtmlOptions(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' => [
                'type' => 'select',
                'source' => $this->getSource($this->columnProperties, $this->model),
                'mode' => 'inline',
                'options' => ['onblur' => 'submit'],
                'showbuttons' => false,
                'onSave' => $this->createSaveFunction($name, $allowEdit),
                'onInit' => $this->createInitFunction($allowEdit)

            ]
        ];
    }


} 