<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 31.03.14
 * Time: 15:21
 */

namespace FrameWork\DataForm\DataFormModel;



class FilterProperties {
    CONST DELIMITER = '|';
    protected $expression;
    protected $properties;
    protected $rightPanelDatasource = [];
    protected $selectAllNodes = false;
    protected $expandNodes = true;
    protected $restoreState = true;
    protected $parentfilter;
    protected $isAutoRefresh = false;

    public function isAutoRefresh(){
        return $this->isAutoRefresh;
    }

    public function getDescriptionData(){
        return $this->rightPanelDatasource;
    }

    public function isRestoreState(){
        return $this->restoreState;
    }

    /**
     * @return mixed
     */
    public function getParentFilter()
    {
        return strtolower($this->parentfilter);
    }

    public function isExpandNodes(){
        return $this->expandNodes;
    }

    public function isSelectAll(){
        return $this->selectAllNodes;
    }

    public function __construct($expression = '')
    {
        $this->expression = $expression;
        $this->init();
    }
    protected function init(){
        $properties = explode(self::DELIMITER, $this->expression);
        foreach($properties as $property){
            switch(true){
                case stripos($property, 'rightpaneldatasource')!==false:
//                    if(strpos($property, '=')!== false){
//                        $tokens = explode('=', $property);
//                        $procedure = $tokens[1];
//                        $routine = \Yii::app()->erp->execFromCache(new DataBaseRoutine($procedure));
//                        $this->rightPanelDatasource = $routine->getData();
//                    }
                    break;
                case stripos($property, 'allowselectallnodes')!==false:
                    $this->selectAllNodes = true;
                    break;
                case stripos($property, 'lockexpandnodes')!==false:
                    $this->expandNodes = false;
                    break;
                case stripos($property, 'lockrestorestate')!==false:
                    $this->restoreState = false;
                    break;
                case stripos($property, 'parentfilter')!==false:
                    if(strpos($property, '=') !== false){
                        $tokens = explode('=', $property);
                        $this->parentfilter = $tokens[1];
                    }
                    break;
                case stripos($property, 'autoRefresh') !==false:
                    $this->isAutoRefresh = true;
                    break;
                default:
                    break;
            }

        }
    }
}