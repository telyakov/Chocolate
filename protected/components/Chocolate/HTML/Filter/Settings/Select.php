<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 15:12
 */

namespace Chocolate\HTML\Filter\Settings;

use Chocolate\HTML\ChHtml;

class Select extends EditableFilterSettings
{

    public function toArray()
    {

        return array_merge(
            parent::toArray(),
            ['data' => ChHtml::createListData($this->getData())]
        );
    }

    public function getData()
    {
        return ChHtml::createListData(parent::getData());
    }

    /**
     * @return mixed
     */
    public function render(\CModel $model, \ChFilterForm $form)
    {
        $id = uniqid();
        echo \CHtml::openTag('li', [
            'class' => 'filter-item',
            'id' => $id
        ]);
        \Yii::app()->controller->renderPartial('//_filters/_select', [
            'form' => $form,
            'model' => $model,
            'settings' => $this
        ]);
        return $id;
    }

}