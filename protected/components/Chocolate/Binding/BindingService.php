<?php
/**
 *
 *
 * Класс отвечает за весь биндинг, который происходит в арбузе.
 * Всего существует 2 типа биндинга:
 * I. Биндинг в рутинах
 *      1) Бингдинг глобальных свойств. Таких как UserID, CurrentDateTime ..
 *       <i> Может использоваться во всех рутинах, кроме обновления и вставки</i>
 *
 *      2) Биндинг свойств, относящихся к объектной модели сетки. Такие свойства как ParentID, EntityID, EntityTypeID ..
 *      <i> Может использоваться во всех рутинах, кроме обновления и вставки</i>
 *
 *      3) Бинлинг данных прямо из сетки.
 *      <i> Самый сложный биндинг. Используется только в различных геттерах выпадающих списков и комбобоксов.
 *      Использует значение в контексте текущей строки. Реализация должна происходить на стороне клиента.
 *      С помощью CoreScript</i>
 *
 *      4) Биндинг в рутину, на основе запроса о входных параметров рутины из БД
 *      <i> Используется перед  непосредственном выполнении запроса. Для преобразования данных с клиента,
 *      в формат ожидаемый БД. Используется только в процедурах обновления и вставки</i>
 * II. Бинлинг значений в колонках( дефолтные значения)
 *   <i> Используется в ColumnProperties</i>
 *
 */
namespace Chocolate\Binding;

use FrameWork\DataBase\DataBaseParameter;
use FrameWork\DataBase\DataBaseParameters;
use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\DataFormModel;

class BindingService extends \CApplicationComponent
{
    CONST USER_ID = 'userid';

    public function bindChildrenFilter(DataBaseRoutine $procedure, $parentID){
        $name = $procedure->getRawName();
        $name = str_ireplace('[ParentFilter.ID]',"'". $parentID. "'", $name);
        return new DataBaseRoutine($name);

    }

    /**
     * Используется I тип, 4) пункт биндинга
     */
    public function bindProcedureFromData(DataBaseRoutine $procedure, DataBaseParameters $params, $fullRecord = true, DataFormModel $model = null)
    {
        $params->add(new DataBaseParameter(self::USER_ID,\Yii::app()->user->id));
        $sqlParams =  \Yii::app()->erp->getProcedureParameters($procedure);
        $allParams = $this->prepareProcParameters($sqlParams, $params, $fullRecord, $model);
        $procedure->setParams($allParams);
        return $procedure;
    }

    private function prepareProcParameters(Recordset $sqlParams, DataBaseParameters $params, $fullRecord, DataFormModel $model = null)
    {
        $result = new DataBaseParameters();
        if (!empty($sqlParams)) {
            $rawParams = $params->toArray();
            /**
             * @var $recordsetRow RecordsetRow
             */
            foreach ($sqlParams as $recordsetRow) {
                if ($recordsetRow['parameter_mode'] == 'IN') {
                    $name = strtolower(trim($recordsetRow['parameter_name'], DataBaseParameters::PARAM_PREFIX));
                    if (array_key_exists($name, $rawParams)) {
                        $result->add(new DataBaseParameter($name, $rawParams[$name]));
                    } else {
                        if($model != null){
                            $value = $this->modelBind($name,$model, true);
                            if($value || $fullRecord){
                            $result->add(new DataBaseParameter($name, $value));
                            }

                        }else{
                            if ($fullRecord) {
                                $result->add(new DataBaseParameter($name, NULL));
                            }
                        }

                    }
                }
            }
        }
        return $result;
    }
    /**
     * Используется I тип, 1) и 2) пункты тип биндинга
     */
    public function bindProcedureFromModel(DataBaseRoutine $procedure, DataFormModel $model = null)
    {
        $rawParams = $procedure->getRawParams();
        $bindingParams = $this->bindRawSql($rawParams, $model);
        $procedure->setRawParams($bindingParams);
        return $procedure;
    }

    public function bindRawSql($string, DataFormModel $model = null){
        return preg_replace_callback('/\[(.*)\]/U',
            function ($value) use ($model) {
                return $this->bindString($value[1], $model);
            },
            $string
        );
    }
    /**
     * Используется II тип биндинга
     */
    public function bindString($string, DataFormModel $model = null)
    {
        $result = $this->frameWorkBind($string);
        if($model){
            $result = $this->modelBind($result, $model);
        }
        return $result;
    }

    /**
     *  Применяет I тип, 1) пункт биндинга
     */
    protected function frameWorkBind($string)
    {
        $bindingString = $string;
        if (strtolower($string) == self::USER_ID) {
            $bindingString = \Yii::app()->getUser()->id;
        }else{
            $bindingString =$string;
        }
        return $bindingString;
    }

    /**
     *  Применяет I тип, 2) пункт биндинга
     */
    protected function modelBind($string, DataFormModel $model, $force = false)
    {
        switch(strtolower($string)){
            case 'parentid':
                return $model->getParentID();
            case 'entityid':
                return $model->getParentID();
            case 'entitytype':
                return $model->getParentAttachmentsEntityTypeID();
            case 'entitytypeid':
                return $model->getParentAttachmentsEntityTypeID();
            case 'parententitytypeid':
                return $model->getParentAttachmentsEntityTypeID();
            default:
                if($force == false){
                    return '[' . $string . ']';
                }else{
                    return null;
                }
        }
    }
} 