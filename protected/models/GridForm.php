<?php

use Chocolate\HTML\Grid\EditableGridColumnWidget;
use \FrameWork\DataBase\ColumnTypes;
use Chocolate\Http\GridResponse;
use Chocolate\Http\Response;
use Chocolate\Http\SearchResponse;
use ClassModules\Attachments as Attachments;
use FrameWork\DataBase\Recordset;
use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\Card\CardCollection as CardCollection;
use FrameWork\DataForm\DataFormModel\ActionPropertiesCollection;
use FrameWork\DataForm\DataFormModel\AgileFiltersCollection as AgileFiltersCollection;
use FrameWork\DataForm\DataFormModel\ColumnProperties as ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection as ColumnPropertiesCollection;
use FrameWork\DataForm\DataFormModel\DataFormModel as DataFormModel;
use FrameWork\DataForm\DataFormModel\DataFormProperties as DataFormProperties;
use FrameWork\DataForm\DataFormModel\GridProperties as GridProperties;
use FrameWork\XML\XML as XML;
use  \FrameWork\DataForm\DataFormModel\GridColumnType;

class GridForm extends CFormModel
{

    public $filters = array();
    /**
     * @var String $xmlFolder
     */
    protected $folder;
    /**
     * @var GridForm $parentModel
     */
    protected $parentModel;
    /**
     * @var string $view
     */
    protected $view;
    /**
     * @var DataFormModel $dataFormModel
     */
    protected $dataFormModel;
    /**
     * @var  AgileFiltersCollection $agileFilterCollection
     */
    protected $agileFilterCollection;
    /**
     * @var ColumnPropertiesCollection $columnPropertiesCollection
     */
    protected $columnPropertiesCollection;
    /**
     * @var DataFormProperties $dataFormProperties
     */
    protected $dataFormProperties;
    /**
     * @var $actionPropertiesCollection ActionPropertiesCollection;
     */
    protected $actionPropertiesCollection;
    /**
     * @var CardCollection $cardCollection
     */
    protected $cardCollection;
    /**
     * @var GridProperties $gridProperties
     */
    protected $gridProperties;
    protected $parentID;
    private $_columns;

    public function __construct($view, $folder = null, $scenario = '', GridForm $parentModel = null, $parentID = null)
    {
        $this->view = str_replace('\\', '/', $view);
        $this->parentID = $parentID;
        $this->folder = $folder;
        $this->parentModel = $parentModel;
        parent::__construct($scenario);
    }

    public function isSupportCreateEmpty()
    {
        return $this->getDataFormProperties()->getCreateEmptyProc() ? true : false;
    }

    public function isAllowAudit()
    {
        return $this->dataFormProperties->isAllowAudit();
    }

    public function getDataFormProperties()
    {
        return $this->dataFormProperties;
    }

    public function getParentView()
    {
        if (isset($this->parentModel)) {
            return $this->parentModel->getView();
        }
        return null;
    }

    public function getView()
    {
        return $this->view;
    }

    public function isAllowRefresh()
    {
        return $this->dataFormProperties->isAllowRefresh();
    }

    public function getParentID()
    {
        return $this->parentID;
    }

    public function hasHeader()
    {
        return $this->dataFormProperties->getHeaderText() || $this->dataFormProperties->getHeaderImage() || $this->dataFormProperties->getStateProc();
    }

    public function isCardAllow()
    {
        return $this->cardCollection->isAllow();
    }

    public function init()
    {
        parent::init();

        if (!($xmlData = Yii::app()->cache->getXmlData($this->view))) {
            $xmlData = (new XML($this->view, $this->folder))->getData();
            Yii::app()->cache->setXmlData($this->view, $xmlData);
        }

        $this->agileFilterCollection = $xmlData->agileFiltersCollection;
        $this->columnPropertiesCollection = $xmlData->columnPropertiesCollection;
        $this->cardCollection = $xmlData->cardCollection;
        $this->gridProperties = $xmlData->gridProperties;
        $this->dataFormProperties = $xmlData->dataFormProperties;
        $this->dataFormModel = new DataFormModel($this->dataFormProperties, $this->parentModel, $this->parentID);
        $this->actionPropertiesCollection = $xmlData->actionPropertiesCollection;
        if ($this->dataFormProperties->isAttachmentsSupport()) {
            $this->columnPropertiesCollection->add(new Attachments());
        }

    }

    public function requiredFieldsToJS()
    {
        return json_encode($this->columnPropertiesCollection->getRequiredFields());
    }

    public function defaultValuesToJS()
    {
        return json_encode($this->columnPropertiesCollection->getDefaultValues($this->dataFormModel));
    }

    public function getParentDataFormProperties()
    {
        return $this->dataFormModel->getParentDataFormProperties();
    }

    public function rules()
    {
        return [
            ['filters', 'safe']
        ];
    }

    public function getStateProcData()
    {
        try {
            if ($routine = $this->dataFormProperties->getStateProc()) {
                return \Yii::app()->erp->execScalar($routine);
            }
            return null;
        } catch (Exception $e) {
            Yii::log('Возникла ошибка при выполнении stateProc в виде: ' . $this->getView(), CLogger::LEVEL_ERROR);
            return null;
        }
    }

    public function attributeLabels()
    {
        return $this->agileFilterCollection->getAttributeLabels();
    }

    public function getColumns()
    {
        if(!$this->_columns){

        $columns = [ChControlsColumn::getOptions()];
        $gridColumnSettingsWidget = new EditableGridColumnWidget($this->dataFormModel);
        /**
         * @var $column ColumnProperties
         */
        foreach ($this->columnPropertiesCollection as $column) {
            if ($column->isVisible()) {
                $data = $column->getGridWidgetSettings($gridColumnSettingsWidget)->getData();
                if ($column->getKey() === Recordset::KEY_FIELD) {
                    $data['cssClassExpression'] = [$this, 'getColumnCssClassExpression'];
                }
                $columns[] = $data;
            }
        }
            $this->_columns = $columns;
        }
        return $this->_columns;
    }

    public function hasFilters()
    {
        if ($this->agileFilterCollection->isEmpty()) {
            return false;
        }
        return true;
    }

    public function getFilterSettingsCollection()
    {
        return $this->agileFilterCollection->getSettingsCollection();
    }

    public function save()
    {
        $response = new Response();
        try {
            $changedData = json_decode(Yii::app()->request->getPost('jsonChangedData'), true);
            $deletedData = json_decode(Yii::app()->request->getPost('jsonDeletedData'), true);
            $deletedStack = new CStack();
            if (!empty($deletedData)) {
                foreach ($deletedData as $key => $value) {
                    $deletedStack->push($key);
                }
            }
            if (!empty($changedData) || $deletedStack->count) {
                $this->dataFormModel->saveData($changedData, $deletedStack);
                $response->setStatus('Данные успешно сохранены.', Response::SUCCESS);
            } else {
                $response->setStatus('Данные не были изменены.', Response::WARNING);
            }
        } catch (\Chocolate\Exceptions\DataFormException $e) {
            $response->setStatus($e->getMessage(), Response::ERROR);
        } catch (Exception $e) {
            $response->setStatus('Возникла ошибка при сохранении данных.', Response::ERROR);
        } finally {
            return $response;
        }
    }

    public function insertRow()
    {
        $response = new Response();
        try {
            $row = $this->dataFormModel->rowInserted();
            $response->setStatus('Строка успешно добавлена.', Response::SUCCESS);
            $response->setData($row->data);
        } catch (Exception $e) {
            $response->setStatus('Не удалось добавить новую строку.', Response::ERROR);
        } finally {
            return $response;
        }
    }

    public function getCard($key)
    {
        //TODO: Важен регистр ключа - позднее исправить
        return $this->cardCollection->getByKey($key);
    }

    public function getCardCollection()
    {
        return $this->cardCollection;
    }

    public function cardCollectionToJs()
    {
        return json_encode($this->cardCollection->toJs());
    }

    public function getDataFormModel()
    {
        return $this->dataFormModel;
    }

    public static function isAttachment($view)
    {
        return stripos($view, Attachments::VIEW) !== false;
    }

    public function getSearchResponse()
    {
        $response = new SearchResponse();
        try {
            $recordset = $this->loadData();
            if (!GridForm::isAttachment($this->getView())) {
                $response->setData($recordset->rawUrlEncode());
//                $response->setPreviewData($this->getPreviewData($recordset));
                $response->setOrder($recordset->getOrder());
            } else {
                $response->setData(FileModel::recordset2arr($recordset));
                //TODO: для вложений тоже добавить превью
//                $response->setPreviewData([]);
                $response->setOrder($recordset->getOrder());
            }
            $response->setStatus('Операция успешно завершена', Response::SUCCESS);
        } catch (Exception $e) {
            $response->setStatus('Возникла ошибка при обновленние данных сетки.' . Response::ERROR);
        } finally {
            return $response;
        }
    }

    public function loadData()
    {
        try {
            return $this->dataFormModel->loadData($this->filters, $this->getColumnPropertyCollection()->getFields());
        } catch (Exception $e) {
            Yii::log('Возникла ошибка при получение рекордсета для вида: ' . $this->view, CLogger::LEVEL_ERROR);
            return new Recordset();
        }
    }

    public function getColumnPropertyCollection()
    {
        return $this->columnPropertiesCollection;
    }

    function getPreview(){
        $result =[];
        /**
         * @var $columnProperties ColumnProperties
         */
        foreach($this->columnPropertiesCollection->getPreviewList() as $columnProperties){
            $type = $columnProperties->getGridEditType();
            if($type  == GridColumnType::Date || $type == GridColumnType::DateTime){
                $result[$columnProperties->getKey()] =  ['type'=> ColumnTypes::Date, 'caption' => $columnProperties->getVisibleCaption()];
            }else{
                $result[$columnProperties->getKey()] = ['type'=> ColumnTypes::String, 'caption' => $columnProperties->getVisibleCaption()];
            }
        }
        return $result;

    }
    public function gridPropertiesToJS()
    {
        return json_encode([
            'colorColumnName' => $this->gridProperties->getColorColumnName(),
            'colorKey' => $this->gridProperties->getKeyColorColumnName(),
            'autoOpenCard' => $this->cardCollection->isAutoOpen()
        ]);
    }

    public function getColumnCssClassExpression($row, $data)
    {
        if ($data[$this->gridProperties->getKeyColorColumnName()]) {
            return 'td-red';
        } else {
            return null;
        }

    }

    public function getGridResponse($parentViewID, $isSelect)
    {
        $response = new GridResponse();
        try {
            if (GridForm::isAttachment($this->getView())) {
                $response->setData(Yii::app()->controller->renderPartial('//attachments/index',
                        [
                            'model' => $this,
                            'parentViewID' => $parentViewID
                        ], true, true)
                );
            } else {
                if ($isSelect) {
                    $response->setData(Yii::app()->controller->renderPartial('//grid/selected_grid',
                            [
                                'model' => $this,
                                'parentViewID' => $parentViewID,
                            ], true, true)
                    );
                } else {
                    $response->setData(Yii::app()->controller->renderPartial('//grid/grid',
                            [
                                'model' => $this,
                                'parentViewID' => $parentViewID,
                            ], true, true)
                    );
                }
            }
        } catch (Exception $e) {
            $response->setStatus('Возникла ошибка при построении сетки.');
        } finally {
            return $response;
        }
    }

    public function getCardElementsSettings($cardKey)
    {
        return $this->columnPropertiesCollection->getCardSettingsCollection($cardKey);
    }

    public function isAllowCreate()
    {
        return $this->dataFormProperties->isAllowCreate();
    }

    public function isAllowSave()
    {
        return $this->dataFormProperties->isAllowSave();
    }

    public function isAllowDelete()
    {
        return $this->dataFormProperties->isAllowDelete();
    }

    public function isAllowActions()
    {
        return $this->getActionPropertiesCollection()->isNotEmpty();
    }

    public function getActionPropertiesCollection()
    {
        return $this->actionPropertiesCollection;
    }

    public function isAllowPrintActions()
    {
        return $this->getDataFormProperties()->getPrintActions()->isNotEmpty();
    }
}