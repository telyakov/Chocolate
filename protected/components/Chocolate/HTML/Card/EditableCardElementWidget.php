<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 14:32
 */
namespace Chocolate\HTML\Card;
use Chocolate\HTML\Card\Interfaces\ICardElementSettings;
use Chocolate\HTML\Card\Interfaces\ICardElementWidget;
use Chocolate\HTML\Card\Settings\CheckBoxSettings;
//use Chocolate\HTML\Card\Settings\DateSettings;

use Chocolate\HTML\Card\Settings\DateSettings;
use Chocolate\HTML\Card\Settings\DateTimeSettings;

use Chocolate\HTML\Card\Settings\GridSettings;
use Chocolate\HTML\Card\Settings\LineSettings;
use Chocolate\HTML\Card\Settings\MultimediaSettings;
use Chocolate\HTML\Card\Settings\TreeView;
use Chocolate\HTML\Card\Settings\SelectSettings;

use Chocolate\HTML\Card\Settings\TextSettings;
use FrameWork\DataForm\Card\CardElementType;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;

class EditableCardElementWidget implements ICardElementWidget{
    /**
     * @param ColumnProperties $columnProperties
     * @return ICardElementSettings
     */
    public function create(ColumnProperties $columnProperties, ColumnPropertiesCollection $columnPropertiesCollection)
    {
        switch($columnProperties->getCardEditType()){
            case CardElementType::Text:
               return new TextSettings($columnProperties, $columnPropertiesCollection);
            case CardElementType::Date:
                return new DateSettings($columnProperties, $columnPropertiesCollection);
            case CardElementType::DateTime:
                return new DateTimeSettings($columnProperties,$columnPropertiesCollection);
            case CardElementType::Grid:
                return new GridSettings($columnProperties,$columnPropertiesCollection);
            case CardElementType::ComboBox:
                return new SelectSettings($columnProperties,$columnPropertiesCollection);
            case CardElementType::Select:
                return new TreeView($columnProperties,$columnPropertiesCollection);
            case CardElementType::TextBox:
                return new TextSettings($columnProperties,$columnPropertiesCollection);
            case CardElementType::CheckBox:
                return new CheckBoxSettings($columnProperties, $columnPropertiesCollection);
            case CardElementType::Multimedia:
                return new MultimediaSettings($columnProperties, $columnPropertiesCollection);
            case CardElementType::Line:
                return new LineSettings($columnProperties, $columnPropertiesCollection);
        }
    }
}