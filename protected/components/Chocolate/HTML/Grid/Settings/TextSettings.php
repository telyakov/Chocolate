<?
namespace Chocolate\HTML\Grid\Settings;

use Chocolate\HTML\Grid\Traits\DefaultSaveFunction;
use Chocolate\HTML\Grid\Traits\TextInitFunction;
use Chocolate\HTML\Traits\TextShownFunction;

class TextSettings extends XEditableSettings
{
    use DefaultSaveFunction;
    use TextInitFunction;
    use TextShownFunction;

    public function getData()
    {
        $name = mb_strtolower($this->getName(), 'UTF-8');
        $isMarkupSupport = $this->columnProperties->isMarkupSupport();
        $allowEdit = $this->getAllowEdit();
        $options = [
            'header' => $this->getHeader(),
            'name' => $name,
            'htmlOptions' => $this->getHtmlOptions(),
            'headerHtmlOptions' => $this->getHeaderHtmlOptions(),
            'class' => $this->getClass(),
            'editable' => [
                'mode' => 'inline',
                'options' => [
                    'onblur' => 'submit',
                    'savenochange' => false,
                ],
                'showbuttons' => false,
                'onSave' => $this->createSaveFunction($name, $allowEdit),
                'onInit' => $this->createInitFunction($allowEdit, $name, $this->getCaption(), $isMarkupSupport),
            ]
        ];
        if ($isMarkupSupport) {
            $options['editable']['type'] = 'wysihtml5';
            $options['editable']['onShown'] = $this->createShownFunction($allowEdit);
            $options['editable']['options']['wysihtml5'] = [
                'font-styles' => false,
                'emphasis' => false,
                'lists' => false,
                'link' => false,
                'image' => false
            ];
        } else {
            $options['editable']['type'] = 'text';
            $options['editable']['options']['tpl'] = '<textarea/>';
        }
        return $options;
    }

} 