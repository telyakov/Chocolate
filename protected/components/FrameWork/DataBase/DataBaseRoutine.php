<?php
/**
 *  Предстовляет объектную обертку для хранения объектов базы данных.
 *  Пока что реализованы только хранимые процедуры.
 */
namespace FrameWork\DataBase;

class DataBaseRoutine
{
    public function getRawParams()
    {
        return $this->rawParams;
    }

    public function getRoutineName(){
        if($schema = $this->getSchema()){
            return $this->getName();
        }else{
            return $schema . self::SCHEMA_DELIMITER . $this->getName();
        }
    }

    public function setRawParams($pawParams){
        $this->rawParams = $pawParams;
    }
    const SCHEMA_DELIMITER = '.';
    const PARAMS_DELIMITER = ' ';
    protected $schema;
    protected $name;
    protected $rawName;
    protected $params;

    public function isSuccessBinding(){
        return stripos($this->rawName, '[')===false;
    }

    public $raw;

    public function getRawName()
    {
        return $this->rawName;
    }

    protected $rawParams;

    function __toString(){
        if(!$this->raw){

        $result = $this->getSchema(). self::SCHEMA_DELIMITER . $this->getName();
        if($this->params){
            $result = $result . self::PARAMS_DELIMITER . $this->params;
        }else if(is_null($this->rawParams)===false ){
            //todo: необходимо добавить функцию, если понадобится,sanitizeString
            $result = $result . self::PARAMS_DELIMITER . $this->rawParams;
//            preg_replace('/\n/', '\r\n', $this->rawParams);
        }
            return $result;
        }else{
            return $this->getRawName();
        }
    }

    function __construct($rawName, DataBaseParameters $params = null , $raw = false)
    {
        $this->rawName = $rawName;
        $this->params = $params;
        if(stripos($rawName, 'select')===0){
            $raw = true;
        }
        $this->raw = $raw;
        if(!$raw){
            $this->init($rawName);
        }
    }

    public function getParams()
    {
        return $this->params;
    }

    function setParams(DataBaseParameters $params){
        $this->params = $params;
    }
    protected function init($rawName)
    {
        if ( ($schemaDelimiterIndex = strpos($rawName, self::SCHEMA_DELIMITER)) !== false) {
            $this->schema = trim(substr($rawName, 0, $schemaDelimiterIndex));
            $name = trim(substr($rawName, $schemaDelimiterIndex + strlen(self::SCHEMA_DELIMITER)));

        } else {
            $name = trim($rawName);
            $this->schema = '';
        }

        if ( ($paramsDelimiterIndex = strpos($name, self::PARAMS_DELIMITER)) === false) {
            $this->name = $name;
            $this->rawParams = null;
        } else {
            $this->name = trim(substr($name, 0, $paramsDelimiterIndex));
            $this->rawParams = substr($name, $paramsDelimiterIndex + strlen(self::PARAMS_DELIMITER));
        }
    }

    public function getName()
    {
        return $this->name;
    }

    public function getSchema()
    {
        return $this->schema;
    }

}