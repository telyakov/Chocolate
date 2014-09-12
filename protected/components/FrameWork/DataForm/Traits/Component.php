<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 18.12.13
 * Time: 16:19
 */

namespace FrameWork\DataForm\Traits;


use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\GridColumnType;

trait Component
{

    public static function defaultExpressionEval($expression, GridColumnType $type){
        $prepareExpression = strtolower(trim($expression));
        switch(true){
            case $prepareExpression=='firstdaynextmonth':
                $dateParams = getdate();
                $date = new \DateTime();
                $date->setDate($dateParams['year'], $dateParams['mon'], 1);
                $interval = new \DateInterval('P1M');
                $date->add($interval);
                return $date->format('m.d.Y H:i:s');
                break;
            case $prepareExpression == 'currentuserfio':
                return \Yii::app()->user->fullName;
                break;
            case $prepareExpression == 'userid':
                return \Yii::app()->user->id;
                break;
            default:
                if($type ==GridColumnType::DateTime || $type ==GridColumnType::Date){
                    return null;
                }else{
                    return $expression;
                }
        }
    }
    /**
     * @param $expressionString
     * @param $default int
     * @return int
     */
    public static function intExpressionEval($expression, $default = 0){
        if($expression !== null){
            if(is_numeric($expression)){
                return intval($expression);
            }else{
                return $expression;
            }
        }else{
            return $default;
        }

    }

    public static function allowEditEval($expression){
        if(stripos($expression, 'editable')!==false || stripos($expression, 'role')!==false){
            return $expression;
        }
        return self::boolExpressionEval($expression, false);
    }
    /**
     * @param $expression String
     * @param $default Boolean
     * @return Boolean
     */
    public static function boolExpressionEval($expression, $default = false){
        $prepareExpr =strtolower(trim($expression));
        switch(true){
            case $prepareExpr === 'true':
                return true;
            case $prepareExpr === 'false':
                return false;
            case strpos($prepareExpr, 'sql') === 0:
                $posEqualSign = strpos($prepareExpr, '=');
                if($posEqualSign !== false){
                    $posSql = $posEqualSign +1;
                    $sql = trim(substr($prepareExpr, $posSql));
                    $sql = \Yii::app()->bind->bindRawSql($sql);
                    $routine = \Yii::app()->bind->bindProcedureFromModel(new DataBaseRoutine($sql));
                    try{
                        $recordset = \Yii::app()->erp->execFromCache($routine);
                        /**
                         * @var $row RecordsetRow
                         */
                        $row = array_shift($recordset->toArray());
                        $access = array_shift($row->data);
                      if($access =='1'){
                          return true;
                      }else{
                          return false;
                      }
                    }catch (\Exception $e){
                        return false;
                    }
                }else{
                    return false;
                }
                break;
            case strpos($prepareExpr, 'role') === 0:
                //todo: реализовать поддержку кисовских ролей
                return false;
            default:
                return $default;

        }

    }

    public static function scriptExpressionEval($expession){
        if(strpos($expession, 'script') === 0){
            $script = substr($expession,6);
            $result = <<<JS
                    var chFilter = ChObjectStorage.create($(this), 'ChFilter');
JS;
;
            $commands = explode(';', $script);
            foreach($commands as $command){
                $prepareCom = trim($command);
                switch(true){
                    case $prepareCom == 'dataform.refreshdata':
                        $result .= <<<JS
                    chFilter.getChForm().LazyRefresh();
JS;
                        break;
                    case stripos($prepareCom, 'dataform.DefValues') === 0:
                        $arguments = strtolower(substr($prepareCom, strlen('dataform.DefValues')+1));
                        $tokens = explode('=', $arguments);
                        $key = trim($tokens[0]);
                        $value = trim($tokens[1]);
                        if($value =='this.val'){
                        $result .= <<<JS
                    /**
                    * @type {ChFilterForm}
                    */
                    var chFilterForm =chFilter.getChFilterForm(),
                       val = chFilterForm.getValueByKey(chFilter.getKey());
                    chFilter.getChForm().setDefaultValue('$key', val);
JS;
                        }else if($value =='this.caption'){
                            $result .= <<<JS
                    /**
                    * @type {ChFilterForm}
                    */
                    var chFilterForm =chFilter.getChFilterForm(),
                       caption = chFilterForm.getCaptionByKey(chFilter.getKey());
                    chFilter.getChForm().setDefaultValue('$key', caption);
JS;
                        }
                        break;
                    default:
                        break;
                }
            }
            return $result;
        }
        return null;
    }
    public function init(\SimpleXMLElement $xmlFile, $class)
    {
        if ($xmlFile) {
            $reflectionClass = new \ReflectionClass($class);
            foreach ($xmlFile->children() as $attribute => $data) {
                $data = (String)$data;
                $attribute = strtolower($attribute);
                if (!$data instanceof \SimpleXMLElement) {
                    if ($reflectionClass->hasProperty($attribute)) {
                        $this->$attribute = $data;
                    }
                }
            }
        }
    }
} 