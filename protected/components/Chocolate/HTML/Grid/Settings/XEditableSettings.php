<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 11.12.13
 * Time: 11:52
 */

namespace Chocolate\HTML\Grid\Settings;


use Chocolate\HTML\Grid\Interfaces\IGridColumnSettings;
use ClassModules\Attachments;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;
use FrameWork\DataForm\DataFormModel\GridColumnType;

abstract class XEditableSettings implements IGridColumnSettings
{
    protected $columnProperties;
    protected $key;
    protected $model;

    public function __construct(ColumnProperties $columnProperties, DataFormModel $model)
    {
        $this->columnProperties = $columnProperties;
        $this->key = $columnProperties->getVisibleKey();
        $this->model = $model;
    }

    function isSingle()
    {
        return $this->columnProperties->isSingleMode();
    }

    public function isRequired()
    {
        return $this->columnProperties->isRequired();
    }

    public function getAllowEdit()
    {
        return $this->columnProperties->getAllowEdit();
    }

    public function getHeader()
    {
        return '<div><a><span class="' . $this->getHeaderCLass() . '"></span>' . self::getHeaderHtml($this->getCaption()) . '</a></div>';
    }

    protected function getHeaderCLass()
    {
        if ($this->key == Attachments::KEY) {
            return 'fa-paperclip';
        } else {
            if ($this->columnProperties->isRequired()) {
                $class = 'fa-asterisk ';
            } else {
                $class = '';
            }
            return $class . $this->columnProperties->getHeaderClass();
        }
    }

    public static function getHeaderHtml($caption)
    {
        return '<span class="grid-caption">' . $caption . '</span><span class="grid-sorting"></span>';
    }

    public function getCaption()
    {
        return $this->columnProperties->getVisibleCaption();
    }

    public function getName()
    {
        return $this->key;
    }

    public function getHtmlOptions()
    {
        if ($this->columnProperties->getAllowEdit()) {
            return [];
        } else {
            return ['class' => 'not-changed'];
        }
    }

    public function getHeaderHtmlOptions()
    {
        $options = ['data-id' => $this->key];
        if (!$this->columnProperties->getAllowEdit() && $this->columnProperties->getKey() != Attachments::KEY) {
            $options['data-changed'] = 0;
        }
        $editType = $this->columnProperties->getGridEditType();
        if ($editType == GridColumnType::Attachments || $editType == GridColumnType::Button) {
            $options['data-grid-button'] = 1;
        }
        if ($this->columnProperties->isVisibleInAllField()) {
            $options['data-col-hide'] = 1;
        }
        if ($editType == GridColumnType::DateTime || $editType == GridColumnType::Date) {

            $options['class'] = 'sorter-shortDate ';
        } elseif ($editType == GridColumnType::CheckBox) {
            $options['class'] = 'sorter-checkbox';
        } else {
            $options['class'] = 'sorter-text';
        }
        return $options;
    }

    public function getClass()
    {
        return 'Chocolate.Widgets.ChEditableColumn';
    }

}