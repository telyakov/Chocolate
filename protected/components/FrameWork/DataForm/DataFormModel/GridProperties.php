<?php
namespace FrameWork\DataForm\DataFormModel;

use FrameWork\DataForm\Traits\Component;

class GridProperties {
    use Component;
    protected $rowcolorcolumnname;
    protected $rowcolorcolumnnamealternate;

    public function __construct(\SimpleXMLElement $xmlFile = null)
    {
        if($xmlFile){
            $this->init($xmlFile, __CLASS__);
        }
    }

    public function getColorColumnName(){
        if(!empty($this->rowcolorcolumnnamealternate)){
            return strtolower($this->rowcolorcolumnnamealternate);
        } elseif(!empty($this->rowcolorcolumnname)){
            return strtolower($this->rowcolorcolumnname);
        } else{
            return null;
        }
    }

    public function getKeyColorColumnName(){
        if(!empty($this->rowcolorcolumnnamealternate) && !empty($this->rowcolorcolumnname)){
            return strtolower($this->rowcolorcolumnname);
        }
        return null;
    }
}