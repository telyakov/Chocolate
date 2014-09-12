<?
namespace Chocolate\HTML\Filter;
use Chocolate\HTML\Filter\Settings\Tree;
use FrameWork\DataForm\DataFormModel\AgileFilter;
use Chocolate\HTML\Filter\Interfaces\IFilterSettings;
use FrameWork\DataForm\DataFormModel\FilterType;
use Chocolate\HTML\Filter\Interfaces\ IFilterWidget;
use Chocolate\HTML\Filter\Settings\DateRange;
use Chocolate\HTML\Filter\Settings\CheckBox;
use Chocolate\HTML\Filter\Settings\Select;
use Chocolate\HTML\Filter\Settings\MultiSelect;
use Chocolate\HTML\Filter\Settings\Fast;
use Chocolate\HTML\Filter\Settings\Text;

class EditableFilterWidget implements IFilterWidget{

    public function create(AgileFilter $filter)
    {
        switch($filter->getFilterType()){
            case FilterType::FastFilter:
                return new Fast($filter);
            case FilterType::DateBetween:
                return new DateRange($filter);
            case FilterType::CheckBox:
                return new CheckBox($filter);
            case FilterType::Tree:
                return new Tree($filter);
            case FilterType::CustomFilter:
                return new Select($filter);
            case FilterType::CustomFilterWithMultiselect:
                return new Tree($filter);
            default:
                return new Text($filter);
        }
    }

}