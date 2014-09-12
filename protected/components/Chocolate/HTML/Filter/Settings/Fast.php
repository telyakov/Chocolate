<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 30.09.13
 * Time: 12:47
 */

namespace Chocolate\HTML\Filter\Settings;

use Chocolate\HTML\ChHtml;
use FrameWork\DataBase\RecordsetRow;


class Fast extends EditableFilterSettings
{
    public function render(\CModel $model, \ChFilterForm $form)
    {
        $id = uniqid($this->getName());
        $options = [
            'class' => 'fast-filter filter-item',
            'id' => $id,
            'name' => $this->getName(),
        ];
        if($this->filter->getProperties()->isAutoRefresh()){
            $options['data-auto-ref'] = 1;
        }
        if (!$this->getParentFilterKey()) {
            echo \CHtml::openTag('li', $options);
            \Yii::app()->controller->renderPartial('//_filters/_fast', [
                'form' => $form,
                'model' => $model,
                'settings' => $this
            ]);
        }else{
            $options['rel'] = $this->getParentFilterKey();
            echo \CHtml::openTag('li', $options);
        }
        $this->filter->attachEvents($id);
        return $id;
    }

    public function getData($parentID = null)
    {
        if ($this->isMultiSelect()) {
            return ChHtml::createMultiSelectListData(parent::getData($parentID));
        }else{
            $listData = [];
            /**
             * @var $row RecordsetRow
             */
            foreach(parent::getData($parentID) as $row){
                $listData[$row->id  .'|'] = $row['name'];
            }
            return $listData;
        }
    }


}