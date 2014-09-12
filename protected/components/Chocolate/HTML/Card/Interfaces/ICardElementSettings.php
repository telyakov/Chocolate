<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 11:56
 */

namespace Chocolate\HTML\Card\Interfaces;


use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\Card\CardElementType;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;

interface ICardElementSettings
{
    public function __construct(ColumnProperties $columnProperties, ColumnPropertiesCollection $columnPropertiesCollection);

    /**
     * @return CardElementType
     */
    public function getType();
    public function getName();
    public function render($pk, $view, $formID, $tabIndex);
    public function getX();
    public function getY();
    public function getWidth();
    public function getHeight();
    public function getCaption();
    public function isRequired();
    public function getAllowEdit();
    public function renderBeginData();
    public function renderEndData();
    public function processBeforeRender($id);
//    public function getLabelHeight();
//    public function getMarginBottom();
//    public function getInputHeight();
//    public function getInputMinHeight();
    public function getMinHeight();
    public function isStatic();
//    public function getCssHeight($rows = null, $height = null);
}