<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 14:56
 */

namespace Chocolate\HTML\Card\Settings;


use Chocolate\HTML\Card\Interfaces\ICardElementSettings;
use FrameWork\DataForm\Card\CardElementType;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;

abstract class EditableCardElementSettings implements ICardElementSettings
{

    public function getMinHeight(){
        return 42;
    }

    public function isStatic(){
        return true;
    }

    function isSingle()
    {
        return $this->columnProperties->isSingleMode();
    }

    public $columnProperties;
    public $columnPropertiesCollection;
    private $_posY;


    public function __construct(ColumnProperties $columnProperties, ColumnPropertiesCollection $columnPropertiesCollection)
    {
        $this->columnProperties = $columnProperties;
        $this->columnPropertiesCollection = $columnPropertiesCollection;
    }

    public function getName()
    {
        return $this->columnProperties->getVisibleKey();
    }

    public function renderEndData()
    {
        echo '</div>';
    }

    public function processBeforeRender($id)
    {
        echo \CHtml::label(
            $this->getCaption(),
            $id,
            ['required' => $this->isRequired()]
        );
//        echo \CHtml::tag('span', ['class' => 'card-input-error']);
    }

    public function renderBeginData()
    {
        echo \CHtml::openTag(
            'div',
            [
                'class' => $this->getEditClass() . ' card-input',
            ]
        );
//        echo \CHtml::openTag(
//            'div',
//            [
//                'class' => $this->getEditClass() . ' card-input card-default-height',
//                'style' =>'height:'. $this->getInputHeight() .'px;min-height:' . $this->getInputMinHeight() .'px;'
//            ]
//        );
//        echo '<div class="' . $this->getEditClass() . ' card-input card-default-height" style="height:'. $this->getInputHeight() .'px;">';
    }

    protected function getEditClass()
    {
        if ($this->getAllowEdit()) {
            return '';
        }
        return 'card-input-no-edit';
    }

    public function getAllowEdit()
    {
        return $this->columnProperties->getAllowEditInCard();
    }

    /**
     * @return CardElementType
     */
    public function getType()
    {
        return $this->columnProperties->getCardEditType();
    }

    public function getCaption()
    {
        return $this->columnProperties->getVisibleCaption();
    }

    public function getX()
    {
        return $this->columnProperties->getCardX();
    }

//    public function getCssHeight($rows= null, $height= null)
//    {
//        return $this->getHeight() . 'px;';
//    }

    public function getY()
    {
        if ($this->_posY) {
            return $this->_posY;
        }
        $posY = $this->getRecursiveY(0, $this->columnProperties);
        $this->_posY = $posY;
        return $posY;
    }

    public function getRecursiveY($curPosY, ColumnProperties $columnProperties)
    {
        $posY = $columnProperties->getCardY();
        if (strripos($posY, '+')) {
            $matches = explode('+', $posY);
            $parentKey = $matches[0];
            $digit = $matches[1];
            $parentColumn = $this->columnPropertiesCollection->getByKey(mb_strtolower($parentKey, 'UTF-8'));
            return $this->getRecursiveY($curPosY + $digit, $parentColumn);
        } else {
            return $curPosY + $posY;
        }
    }

    public function getHeight()
    {
        return $this->columnProperties->getCardHeight();
    }

    public function getWidth()
    {
        return $this->columnProperties->getCardWidth();
    }

    public function isRequired()
    {
        return $this->columnProperties->isRequired();
    }


}