<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 11.06.13
 * Time: 14:28
 */

namespace FrameWork\DataForm\DataFormModel;

use Chocolate\HTML\Card\EditableCardElementWidget;
use Chocolate\HTML\Card\Settings\CardElementSettingsCollection;
use Rmk\Collection\ObjectMap as ObjectMap;

class ColumnPropertiesCollection extends ObjectMap
{

    public function __construct($from = null)
    {
        parent::__construct('\FrameWork\DataForm\DataFormModel\ColumnProperties', $from);
    }

    /**
     * @return string
     */
    public function getFields()
    {
        $result = '|';
        /**
         * @var $columnProperties ColumnProperties
         */
        foreach ($this as $columnProperties) {
            $result .= $columnProperties->getKey() . '|';
        }
        return $result;
    }

    public function getRequiredFields()
    {
        $fields = [];
        /**
         * @var  $columnProperties ColumnProperties
         */
        foreach ($this as $columnProperties) {
            if ($columnProperties->isRequired()) {
                $fields[$columnProperties->getVisibleKey()] = true;
            }
        }
        return $fields;
    }

    public function getCardSettingsCollection($cardKey)
    {
        $cardElementSettings = new CardElementSettingsCollection();
        $EditableCardElementWidget = new EditableCardElementWidget();

        /**
         * @var  $columnProperties ColumnProperties
         */
        foreach ($this as $columnProperties) {
            if ($columnProperties->getCardKey() == $cardKey && $columnProperties->isVisibleInCard()) {
                $cardElementSettings->add($columnProperties->getCardWidgetSettings($EditableCardElementWidget, $this));
            }
        }
        return $cardElementSettings;
    }

    public function getDefaultValues(DataFormModel $model)
    {
        $result = [];
        /**
         * @var  $columnProperties ColumnProperties
         */
        foreach ($this as $columnProperties) {
            //TODO: вот сюда добавить логику биндинга по другим полям
            if (($defaultValue = $columnProperties->getDefault()) != null) {
                $result[$columnProperties->getKey()] = trim(\Yii::app()->bind->bindString($defaultValue, $model),'[]');
            }
        }
        return $result;
    }

    public function getPreviewList()
    {
        $list = new \SplDoublyLinkedList();
        /**
         * @var $columnProperties ColumnProperties
         */
        foreach ($this as $columnProperties) {
            if ($columnProperties->isShowInRowDisplay()) {
                $list->push($columnProperties);
            }
        }
        return $list;
    }
}