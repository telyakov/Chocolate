<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 11.06.13
 * Time: 14:27
 */
namespace FrameWork\DataForm\DataFormModel;

use Chocolate\HTML\Grid\Interfaces\IGridColumnWidget;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataForm\Card\CardElementType;
use FrameWork\DataForm\Traits\Component;
use FrameWork\XML\XML;

class ColumnProperties
{
    use Component;

    protected $caption;
    protected $datasource;
    protected $allfields;
    protected $fromdatasource;
    protected $allowedit;
    protected $toname;
    protected $viewbind;
    protected $fromname;
    protected $fromid;
    protected $key;
    protected $visible;
    protected $edittype;
    protected $toid;
    protected $required;
    protected $default;
    protected $showinrowdisplay;
    protected $tabid;
    protected $format;
    protected $singlevaluemode;
    protected $cardkey;
    protected $cardedittype;
    protected $cardvisible;
    protected $cardx;
    protected $cardy;
    protected $cardwidth;
    protected $cardheight;
    protected $cardmultiline;
    protected $viewname;
    protected $editbehavior;
    protected $properties;
//    protected $cardlocked;
    protected $headerimage;
    protected $_prepareKey;
    protected $_visibleCaption;
    protected $_cardEditType;
    protected $_visibleKey;
    protected $_isNeedFormat;
    protected $_readRoutine;
    protected $_isVisibleInAllField;
    protected $_isSingleMode;
    protected $_customProperties;

    public function __construct(\SimpleXMLElement $xmlFile)
    {
        $this->init($xmlFile, __CLASS__);
    }

    public function getToName()
    {
        return mb_strtolower($this->toname, 'UTF-8');
    }

    public function getFromID()
    {
        return mb_strtolower($this->fromid, 'UTF-8');
    }

    public function getFromName()
    {
        return mb_strtolower($this->fromname, 'UTF-8');
    }

    public function isMarkupSupport()
    {
        return $this->getCustomProperties()->isMarkupSupport();
    }

    /**
     * @return ColumnCustomProperties
     */
    public function getCustomProperties()
    {
        if ($this->_customProperties) {
            return $this->_customProperties;
        }
        $this->_customProperties = new ColumnCustomProperties($this->properties);
        return $this->_customProperties;
    }

    public function isSingleMode()
    {
        if ($this->_isSingleMode !== null) {
            return $this->_isSingleMode;
        }
        $this->_isSingleMode = $this->boolExpressionEval($this->singlevaluemode, false);
        return $this->_isSingleMode;
    }

    public function isNeedFormat()
    {
        if ($this->_isNeedFormat !== null) {
            return $this->_isNeedFormat;
        }
        $this->_isNeedFormat = !!$this->format;
        return $this->_isNeedFormat;
    }

    public function getDefault()
    {
        if (!$this->default) {
            return $this->default;
        } else {
//            $t=$this->default;
//            $parsedDate = date_parse_from_format('H:i',$this->default);
//            $date = new \DateTime();
//            $date->($parsedDate['hour'], $parsedDate['minute']);
//            return $date->format('m.d.Y H:i:s');
            return $this->defaultExpressionEval($this->default, $this->getGridEditType());
        }
    }

    public function getGridEditType()
    {
        if ($this->edittype) {
            return new GridColumnType(strtolower($this->edittype));
        } else if ($this->cardedittype) {
            return new GridColumnType(strtolower($this->cardedittype));
        }
        return new GridColumnType();
    }

    public function getTabId()
    {
        return $this->tabid;
    }

    public function getEditBehavior()
    {
        return strtolower($this->editbehavior);
    }

    public function getCardX()
    {
        return $this->cardx;
    }

    public function getCardY()
    {
        return $this->cardy;
    }

    public function getCardWidth()
    {
        return self::intExpressionEval($this->cardwidth, 1);
    }

    public function getCardHeight()
    {
        return self::intExpressionEval($this->cardheight, 1);
    }

    public function isShowInRowDisplay()
    {
        return self::boolExpressionEval($this->showinrowdisplay);
    }

    public function isRequired()
    {
        return self::boolExpressionEval($this->required);
    }

    public function getVisibleKey()
    {
        if ($this->_visibleKey) {
            return $this->_visibleKey;
        }
        $toID = $this->getToID();
        $this->_visibleKey = $toID ? $toID : $this->getKey();
        return $this->_visibleKey;

    }

    public  function getToID()
    {
        return mb_strtolower($this->toid, 'UTF-8');
    }

    public function getKey()
    {
        if ($this->_prepareKey === null) {
            $this->_prepareKey = mb_strtolower($this->key, 'UTF-8');
        }
        return $this->_prepareKey;
    }

    public function getVisibleCaption()
    {
        if ($this->_visibleCaption) {
            return $this->_visibleCaption;
        }
        $caption = $this->getCaption();
        $this->_visibleCaption = $caption || $this->getHeaderClass() ? $caption : $this->getKey();
        return $this->_visibleCaption;

    }

    public function getCaption()
    {
        return $this->caption;
    }

    public function getHeaderClass()
    {
        return $this->headerimage;
    }

    public function getCardKey()
    {
        return $this->cardkey;
    }

    /**
     * @return CardElementType
     */
    public function getCardEditType()
    {
        if ($this->_cardEditType) {
            return $this->_cardEditType;
        }
        $this->_cardEditType = new CardElementType(strtolower($this->cardedittype));
        return $this->_cardEditType;
    }

    public function getViewName()
    {
        return XML::prepareViewName($this->viewname);
    }

    public function hasView()
    {
        return strlen($this->viewname) > 0;
    }

    public function getAllowEditInCard()
    {
//        if (self::boolExpressionEval($this->cardlocked)) {
//            return false;
//        }
        return $this->getAllowEdit();
    }

    public function getAllowEdit()
    {
        return self::allowEditEval($this->allowedit);
    }

    public function isVisible()
    {
        return $this->isVisibleInAllField() || self::boolExpressionEval($this->visible);
    }

//    public function isAllowEdit()
//    {
//        return self::allowEditEval($this->allowedit);
//    }

    public function isVisibleInAllField()
    {
        if ($this->_isVisibleInAllField !== null) {
            return $this->_isVisibleInAllField;
        }
        $this->_isVisibleInAllField = self::boolExpressionEval($this->allfields);
        return $this->_isVisibleInAllField;
    }

    public function isVisibleInCard()
    {
        return self::boolExpressionEval($this->cardvisible);
    }

    /**
     * @return \FrameWork\DataBase\Recordset|null
     */
    public function executeReadProc(DataFormModel $model = null)
    {
        if (($routine = $this->getReadProc())) {
            return \Yii::app()->erp->execFromCache(\Yii::app()->bind->bindProcedureFromModel($routine, $model));
        }
        return null;
    }

    public function getReadProc()
    {
        if ($this->_readRoutine) {
            return $this->_readRoutine;
        }

        if ($this->fromdatasource) {
            $this->_readRoutine = new DataBaseRoutine($this->fromdatasource);
        } elseif ($this->datasource) {
            $this->_readRoutine = new DataBaseRoutine($this->datasource);
        }
        return $this->_readRoutine;
    }

    public function getCardWidgetSettings(\Chocolate\HTML\Card\Interfaces\ICardElementWidget $widget, ColumnPropertiesCollection $columnPropertiesCollection)
    {
        return $widget->create($this, $columnPropertiesCollection);
    }

    public function getGridWidgetSettings(IGridColumnWidget $widget)
    {
        return $widget->create($this);
    }
}