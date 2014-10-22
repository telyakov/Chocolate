<?
namespace Chocolate\HTML\Card\Settings;

use Chocolate\HTML\Card\Traits\DefaultHidden;
use Chocolate\HTML\Card\Traits\DefaultValidateFunction;
use Chocolate\HTML\Card\Traits\Select2InitFunction;
use Chocolate\HTML\Card\Traits\TreeViewInit;
use Chocolate\HTML\ChHtml;
use Chocolate\HTML\Traits\Select2GetSource;

class TreeView extends EditableCardElementSettings
{
    use DefaultValidateFunction;
    use Select2InitFunction;
    use Select2GetSource;
    use TreeViewInit;
    use DefaultHidden;

    public function render($pk, $view, $formID, $tabIndex)
    {
        $name = $this->getName();
        $isAllowEdit = $this->getAllowEdit();
        $options = [
            'type' => 'text',
            'name' => $name,
            'pk' => ChHtml::ID_KEY,
            'showbuttons' => false,
            'mode' => 'modal',
            'htmlOptions' => [
                'tabIndex' => $tabIndex,
                'id' => ChHtml::generateUniqueID()
            ],
            'validate'=> $this->createValidateFunction($isAllowEdit, $this->isRequired())
        ];
        if(!$this->columnProperties->hasView()){

        if ($this->isNeedAjax()) {
            $options['onInit'] = $this->dynamicInit($name, $isAllowEdit, $this->columnProperties->getKey(),$this->getCaption(), $this->isSingle(), $this->columnProperties->getReadProc()->getRawName());

        } elseif ($this->isDataLoaded()) {
            $options['onInit'] = $this->gridInit($name, $isAllowEdit, $this->columnProperties->getKey(),$this->getCaption(), $this->isSingle());

        } else {
            //TODO: проверить
            $options['source'] = $this->getSource($this->columnProperties, $this->model);
            $options['onInit'] = $this->defaultInit($name, $isAllowEdit, $this->columnProperties->getKey(),$this->getCaption(), $this->isSingle());
        }
        }else{
//            $t= 1;
            //TODO: реализовать выбор дочерних сеток
        }
        return \Yii::app()->controller->widget('Chocolate.Widgets.ChCardEditable',
            $options, true);
    }

    /**
     * @return bool
     */
    protected function isNeedAjax()
    {

        $readProc = \Yii::app()->bind->bindProcedureFromModel($this->columnProperties->getReadProc());
        if($readProc->isSuccessBinding()){
            return false;
        }
        return true;
    }

    /**
     * @return bool
     */
    protected function isDataLoaded()
    {
        return $this->columnProperties->isVisible();
    }
}
