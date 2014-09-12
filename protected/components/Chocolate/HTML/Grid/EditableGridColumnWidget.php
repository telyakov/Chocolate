<?
namespace Chocolate\HTML\Grid;

use Chocolate\HTML\Grid\Interfaces\IGridColumnSettings;
use Chocolate\HTML\Grid\Interfaces\IGridColumnWidget;
use Chocolate\HTML\Grid\Settings\CheckBoxSettings;
use Chocolate\HTML\Grid\Settings\DateTime;
use Chocolate\HTML\Grid\Settings\GridSettings;
use Chocolate\HTML\Grid\Settings\SelectSettings;
use Chocolate\HTML\Grid\Settings\TextSettings;
use Chocolate\HTML\Grid\Settings\TreeView;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;
use FrameWork\DataForm\DataFormModel\GridColumnType;

class EditableGridColumnWidget implements IGridColumnWidget{
    protected $model;
    function __construct(DataFormModel $model)
    {
        $this->model = $model;
    }

    /**
     * @param ColumnProperties $columnProperties
     * @return IGridColumnSettings
     */
    public function create(ColumnProperties $columnProperties)
    {
//        $type =  $columnProperties->getGridEditType();
        switch($columnProperties->getGridEditType()){
            case GridColumnType::TextDialog:
                return new TextSettings($columnProperties, $this->model);
            case GridColumnType::Text:
                return new TextSettings($columnProperties, $this->model);
            case GridColumnType::CheckBox:
                return new CheckBoxSettings($columnProperties, $this->model);
            case GridColumnType::Attachments:
                return new GridSettings($columnProperties, $this->model);
            case GridColumnType::Button:
                return new GridSettings($columnProperties, $this->model);
            case GridColumnType::Date:
                return new DateTime($columnProperties, $this->model);
            case GridColumnType::DateTime:
                return new DateTime($columnProperties, $this->model);
            case GridColumnType::OnOff:
                return new CheckBoxSettings($columnProperties, $this->model);
            case GridColumnType::SelectItems:
                return new TreeView($columnProperties, $this->model);
            case GridColumnType::ValueList:
                return new SelectSettings($columnProperties, $this->model);
            case GridColumnType::ValueListWithoutBlank:
                return new SelectSettings($columnProperties, $this->model);
            case GridColumnType::TreeDialog:
                return new TreeView($columnProperties, $this->model);
            default:
                return new TextSettings($columnProperties, $this->model);
        }
    }


} 