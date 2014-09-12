<?
use Chocolate\HTML\Filter\Interfaces\IFilterSettings;
use Chocolate\HTML\Filter\Settings\FilterSettingsCollection;
Yii::import('bootstrap.widgets.TbActiveForm');
class ChFilterForm extends TbActiveForm
{
    /**
     * @var $filters FilterSettingsCollection
     */
    public $filters;
    /**
     * @var $model GridForm
     */
    public $model;
    protected $layoutFilters = [];

    public function run()
    {
        $this->layoutFilters();
        parent::run();


    }

    protected function layoutFilters()
    {
        if ($this->filters instanceof FilterSettingsCollection) {
            ob_start();
            $this->beginFilterList();
            $this->beginFilterRow();

            /**
             * @var $setting IFilterSettings
             */
            foreach ($this->filters as $setting) {
                if ($setting->isNextRow()) {
                    $this->endFilterRow();
                    $this->beginFilterRow();
                }
                $this->initEvents($setting);
            }

            $this->endFilterRow();
            $this->endFilterList();
        }
        echo '</ul>';
        ob_end_flush();
    }

    protected function initEvents(IFilterSettings $setting ){
        $currentID = $setting->render($this->model, $this);
        $this->layoutFilters[$setting->getName()] = $currentID;
        if (($parentKey = $setting->getParentFilterKey())) {
            $id = $this->layoutFilters[$parentKey];
            $name = $setting->getName();
            $parentName = 'GridForm[filters]['.$parentKey . ']';
            $view = $this->model->getView();
            Yii::app()->clientScript->registerScript(uniqid($parentName), <<<JS
                    chFunctions.layoutChildrenFilters('$id', '$name', '$view', '$currentID', '$parentName');
JS
                , CClientScript::POS_END
            );
        }
    }

    protected function beginFilterList()
    {
        echo '<div><ul class="filters-list">';
    }

    protected function beginFilterRow()
    {
        echo '<div class="filter-row">';
    }

    protected function endFilterRow()
    {
        echo '</div>';
    }

    protected function endFilterList()
    {
        echo '</ul></div>';
    }
}