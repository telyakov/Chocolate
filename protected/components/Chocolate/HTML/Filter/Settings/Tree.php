<?
namespace Chocolate\HTML\Filter\Settings;

class Tree extends  EditableFilterSettings{

    public function isMultiSelect(){
        return $this->filter->isMultiSelect();
    }

    public function getSql(){
        return $this->filter->getReadProc()->__toString();
    }

    public function render(\CModel $model, \ChFilterForm $form)
    {
        $id = uniqid();
        echo \CHtml::openTag('li', [
            'class' => 'filter-item',
            'id' => $id
        ]);
        \Yii::app()->controller->renderPartial('//_filters/_tree', [
            'form' => $form,
            'model' => $model,
            'settings' => $this
        ]);
//        echo '</li>';
        return $id;

    }

} 