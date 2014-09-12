<?
namespace Chocolate\HTML\Filter\Settings;

class CheckBox extends EditableFilterSettings
{
    public function render(\CModel $model, \ChFilterForm $form)
    {
        $id = uniqid();
        echo \CHtml::openTag('li', [
            'class' => 'filter-item',
            'id' => $id
        ]);
        \Yii::app()->controller->renderPartial('//_filters/_check_box', [
            'form' => $form,
            'model' => $model,
            'settings' => $this
        ]);
        return $id;
    }
}