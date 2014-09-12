<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 12:33
 */

namespace Chocolate\HTML\Filter\Settings;


class Text extends EditableFilterSettings
{
    public function toArray()
    {
        return array_merge(
            parent::toArray(),
            [
                'placeholder' => parent::getToolTip(),
                'class' => 'filter',
                'id' => uniqid(),
                'name' => 'GridForm[filters][' . $this->getName() . ']'
            ]
        );
    }

    /**
     * @return mixed
     */
    public function render(\CModel $model, \ChFilterForm $form)
    {
        $id = uniqid();
        echo \CHtml::openTag('li', [
            'class' => 'filter-item',
            'data-format' => $this->filter->getValueFormat(),
            'id' => $id,

        ]);

        \Yii::app()->controller->renderPartial('//_filters/_text', [
            'form' => $form,
            'model' => $model,
            'settings' => $this
        ]);

        return $id;

    }

}