<?php
namespace FrameWork\XML;

use Chocolate\Exceptions\XmlException;
use FrameWork\DataForm\Card\Card;
use FrameWork\DataForm\Card\CardCollection;
use FrameWork\DataForm\DataFormModel\ActionProperties;
use FrameWork\DataForm\DataFormModel\ActionPropertiesCollection;
use FrameWork\DataForm\DataFormModel\AgileFilter;
use FrameWork\DataForm\DataFormModel\AgileFiltersCollection;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;
use FrameWork\DataForm\DataFormModel\DataFormProperties;
use FrameWork\DataForm\DataFormModel\GridProperties;
use SimpleXMLElement;
use Yii;

class XML
{
    private $_file;
    private $_folder;

    public function __construct($file, $folder = null)
    {
        $this->_file = $file;
        $this->_folder = $folder;
    }

    public static function prepareViewName($view){
        $prepareName = strtolower($view);
        return $prepareName . '.xml';
    }

    public function getData()
    {
        try {
            $data = Yii::app()->erp->getXmlData($this->_file);
            return $this->parse($data);
        } catch (\Exception $e) {
            self::handleException('Не удалось получить содержимое xml файла.', 0, $e);
        }
    }

    private function parse($xmlData)
    {
        try {
            $simpleXml = simplexml_load_string($xmlData, 'SimpleXMLElement', LIBXML_NOCDATA);
            if (!$simpleXml) {
                throw new XmlException('Возникла ошибка при построении SimpleXMLElement.');
            }
            $xmlData = new XmlData();
            $xmlData->dataFormProperties = new DataFormProperties($simpleXml);
            $xmlData->columnPropertiesCollection = $this->parseColumnPropertiesCollection($simpleXml);
            $xmlData->agileFiltersCollection = $this->parseAgileFilterProperties($simpleXml);
            $xmlData->cardCollection = $this->parseCardProperties($simpleXml);
            $xmlData->actionPropertiesCollection = $this->parseActionPropertiesCollection($simpleXml);
            $xmlData->gridProperties = $this->parseGridProperties($simpleXml);
            return $xmlData;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при парсинге xml файла.', 0, $e);
        }
    }

    private function parseGridProperties(\SimpleXMLElement $xmlElement){
        $grid = simplexml_load_string($xmlElement->GridLayoutXml, 'SimpleXMLElement', LIBXML_NOCDATA);
        if(isset($grid->GridProperties)){
            return new GridProperties($grid->GridProperties);
        }else{
            return new GridProperties();
        }
    }
    private function parseColumnPropertiesCollection(\SimpleXMLElement $xmlElement)
    {
        try {
            $grid = simplexml_load_string($xmlElement->GridLayoutXml, 'SimpleXMLElement', LIBXML_NOCDATA);
            $columnPropertiesCollection = new ColumnPropertiesCollection();

            if (isset($grid->Column)) {
                foreach ($grid->Column as $column) {
                    $columnProperties = new ColumnProperties($column);
                    $columnPropertiesCollection->set($columnProperties->getKey(), $columnProperties);
                }
            } else {
                Yii::log('Не удалось обнаружить ColumnPropertiesCollection в xml файле: ' . $this->_file, \CLogger::LEVEL_WARNING);
            }

            return $columnPropertiesCollection;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при парсинге ColumnPropertiesCollection', 0, $e);
        }
    }

    protected static function handleException($msg, $code = 0, \Exception $e = null)
    {
        throw new XmlException($msg, $code, $e);
    }

    private function parseAgileFilterProperties(\SimpleXMLElement $xmlElement)
    {
        try {
            $filterPanelData = simplexml_load_string($xmlElement->FiltersPanelXml, 'SimpleXMLElement', LIBXML_NOCDATA);
            $agileFiltersCollection = new AgileFiltersCollection();

            if (isset($filterPanelData->AgileFilter)) {
                foreach ($filterPanelData->AgileFilter as $filter) {
                    $agileFilter = new AgileFilter($filter);
                    $agileFiltersCollection->set($agileFilter->getName(), $agileFilter);
                }
            } else {
                Yii::log('Не удалось обнаружить AgileFiltersCollection в xml файле: ' . $this->_file, \CLogger::LEVEL_WARNING);
            }
            return $agileFiltersCollection;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при парсинге AgileFilterProperties', 0, $e);
        }
    }

    private function parseCardProperties(\SimpleXMLElement $xmlElement)
    {
        try {
            $card = (String)($xmlElement->Cards);
            $cards = simplexml_load_string($card, 'SimpleXMLElement', LIBXML_NOCDATA );
            if (isset($cards->Style)) {
                $cardCollection = new CardCollection($cards->Style);
            } else {
                $cardCollection = new CardCollection();
            }

            if (isset($cards->Card)) {
                foreach ($cards->Card as $data) {
                    $card = new Card($data);
                    $cardCollection->set($card->getKey(),$card);
                }
            } else {
                Yii::log('Не удалось обнаружить CardCollection в xml файле: ' . $this->_file, \CLogger::LEVEL_WARNING);
            }
            return $cardCollection;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при парсинге CardCollection', 0, $e);
        }
    }

    private function parseActionPropertiesCollection(\SimpleXMLElement $xmlElement)
    {
        try {
            $menuActions = simplexml_load_string($xmlElement->ActionsXml, 'SimpleXMLElement', LIBXML_NOCDATA);
            $actionPropertiesCollection = new ActionPropertiesCollection();

            if (isset($menuActions->MenuAction)) {
                foreach ($menuActions->MenuAction as $action) {
                    $actionProperties = new ActionProperties($action);
                    $actionPropertiesCollection->add($actionProperties);
                }
            } else {
                Yii::log('Не удалось обнаружить ActionPropertiesCollection в xml файле: ' . $this->_file . '.', \CLogger::LEVEL_WARNING);
            }
            return $actionPropertiesCollection;
        } catch (\Exception $e) {
            self::handleException('Возникла ошибка при парсинге ActionPropertiesCollection', 0, $e);
        }
    }

}