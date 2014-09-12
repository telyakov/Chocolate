<?php
namespace FrameWork\DataForm\DataFormModel;

use Chocolate\HTML\Filter\Interfaces\IFilterWidget;
use FrameWork\DataBase\DataBaseParameters;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataForm\Traits\Component;
use Yii;

class AgileFilter
{
    use Component;

    protected $caption;
    protected $readproc;
    //todo: как будет перенесено на key
    protected $name;
    protected $key;
    protected $filtertype;
    protected $multiselect;
    protected $standarttype;
    protected $tooltiptext;
    protected $tonextrow;
    protected $visible;
    protected $dialogtype;
    protected $dialogcaption;
    protected $properties;
    protected $event_change;
    protected $valueformat;
    protected $_filterProperties;
    protected $_prepareName;
    protected $_isVisible;
    protected $_prepareCaption;
    protected $_filterType;
    protected $_nameInModel;
    protected $_isMultiselect;

    public function getValueFormat()
    {
        return  mb_strtolower($this->valueformat, 'UTF-8');
    }


    public function __construct(\SimpleXMLElement $xmlFile)
    {
        $this->init($xmlFile, __CLASS__);
    }

    public function attachEvents($jqueryID)
    {
        if ($this->event_change) {
            $changeScript = '$("#' . $jqueryID . '").on("change", "input", function(){'
                . self::scriptExpressionEval($this->event_change)
                . '})';
            Yii::app()->clientScript->registerScript('change' . $this->getName(), $changeScript, \CClientScript::POS_END);
        }
    }

    public function getName()
    {
        if($this->_prepareName){
            return $this->_prepareName;
        }

        $name = ($this->key)? $this->key: $this->name;
        $this->_prepareName = strtolower($name);
        return $this->_prepareName;
    }

    public function isVisible()
    {
        if(isset($this->_isVisible)){
            return $this->_isVisible;
        }
        $this->_isVisible = self::boolExpressionEval($this->visible, true);
        return  $this->_isVisible;
    }

    public function isNextRow()
    {
        return self::boolExpressionEval($this->tonextrow);
    }

    public function getToolTipText()
    {
        return $this->tooltiptext ? $this->tooltiptext : $this->getCaption();
    }

    public function getCaption()
    {
        if($this->_prepareCaption){
            return $this->_prepareCaption;
        }
        $this->_prepareCaption = $this->caption ? $this->caption : $this->getName();
        return $this->_prepareCaption;
    }

    public function getDialogCaption()
    {
        return $this->dialogcaption;
    }

    public function getData($parentID = null)
    {
        if (($routine = $this->getReadProc())){
            if ($this->getParentFilterKey()){
                return Yii::app()->erp->exec(Yii::app()->bind->bindChildrenFilter($routine, $parentID));
            }else{
                if($this->getFilterType() == FilterType::FastFilter){
                    return Yii::app()->erp->exec(Yii::app()->bind->bindProcedureFromData($routine, new DataBaseParameters([])));

                }else{
                   return Yii::app()->erp->execFromCache($routine);
                }
            }
        }else{
            return null;
        }
    }

    public function getParentFilterKey()
    {
        return $this->getProperties()->getParentFilter();
    }

    /**
     * @return FilterProperties
     */
    public function getProperties()
    {
        if ($this->_filterProperties) {
            return $this->_filterProperties;
        }
        $this->_filterProperties = new FilterProperties($this->properties);
        return $this->_filterProperties;
    }

    /**
     * @return DataBaseRoutine|null
     */
    public function getReadProc()
    {
        if ($this->readproc) {
            return Yii::app()->bind->bindProcedureFromModel(new DataBaseRoutine($this->readproc));
        }
        return null;
    }

    public function getFilterType()
    {
        if($this->_filterType){
            return $this->filtertype;
        }
        $this->filtertype = new FilterType($this->prepareType());
        return $this->filtertype;
    }

    private function prepareType()
    {

        $type = strtolower($this->filtertype);

        if (self::isCustomFilter($type)) {
            if ($this->standarttype == 20) {
                $type = FilterType::CheckBox;
            } else if (strcasecmp($this->dialogtype, 'tdialog') == 0) {
                $type = FilterType::Tree;
            } else if ($this->isMultiSelect()) {
                $type = FilterType::CustomFilterWithMultiselect;
            }
        } elseif (self::isFastFilter($type)) {
            $type = FilterType::FastFilter;
        }
        return $type;
    }

    public static function isCustomFilter($type)
    {
        return stripos($type, FilterType::CustomFilter) !== false;
    }

    public function isMultiSelect()
    {
        if(isset($this->_isMultiselect)){
            return $this->_isMultiselect;
        }
        $this->_isMultiselect = self::boolExpressionEval($this->multiselect);
        return $this->_isMultiselect;
    }

    public static function isFastFilter($type)
    {
        return stripos($type, FilterType::FastFilter) !== false;
    }

    public function getNameInModel()
    {
        if($this->_nameInModel){
            return $this->_nameInModel;
        }
        $this->_nameInModel = 'filters['. $this->getName(). ']';
        return $this->_nameInModel;
    }

    public function getWidgetSetting(IFilterWidget $widget)
    {
        return $widget->create($this);
    }

}