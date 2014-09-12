<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 11.06.13
 * Time: 14:27
 */

namespace FrameWork\DataForm\DataFormModel;

use FrameWork\DataBase\DataBaseRoutine;
use FrameWork\DataForm\Traits\Component;

class DataFormProperties
{

    use Component;

    protected $readproc;
    protected $deleteproc;
    protected $updateproc;
    protected $createproc;
    protected $createemptyproc;
    protected $validationproc;
    protected $attachmentssupport;
    protected $attachmentsentitytype;
    protected $headertext;
    protected $stateproc;
    protected $headerimage;
    protected $windowcaption;
    protected $allowaddnew;
    protected $savebuttonvisible;
    protected $allowremove;
    protected $printactionsxml;
    protected $refreshbuttonvisible;
    protected $allowauditbutton;

    /**
     * @return mixed
     */
    public function isAllowAudit()
    {
        return self::boolExpressionEval($this->allowauditbutton, false);
    }
    /**
     * @var PrintActions|null
     */
    protected $_printActions;
    protected $attachmentsfolder;

    public function __construct(\SimpleXMLElement $xmlFile)
    {
        $this->init($xmlFile, __CLASS__);
    }

    public function getWindowCaption()
    {
        return htmlspecialchars($this->windowcaption, ENT_QUOTES);
    }

    public function getPrintActions()
    {
        if ($this->_printActions) {
            return $this->_printActions;
        }
        $this->_printActions = new PrintActions($this->printactionsxml);
        return $this->_printActions;
    }

    public function isAllowRefresh()
    {
        return self::boolExpressionEval($this->refreshbuttonvisible);
    }

    public function isAllowCreate()
    {
        return self::boolExpressionEval($this->allowaddnew);
    }

    public function isAllowSave()
    {
        return self::boolExpressionEval($this->savebuttonvisible);
    }

    public function isAllowDelete()
    {
        return self::boolExpressionEval($this->allowremove);
    }

    public function getStateProc()
    {
        if ($this->stateproc) {
            return new DataBaseRoutine($this->stateproc);
        }
        return null;

    }

    public function getHeaderImage()
    {
        return $this->headerimage;
    }

    public function getHeaderText()
    {
        return $this->headertext;
    }

    public function isAttachmentsSupport()
    {
        return self::boolExpressionEval($this->attachmentssupport);
    }

    public function getAttachmentsFolder()
    {
        return $this->attachmentsfolder;
    }

    function getAttachmentsEntityTypeID()
    {
        return strtolower($this->attachmentsentitytype);
    }

    public function getCreateEmptyProc()
    {
        if ($this->createemptyproc) {
            return new DataBaseRoutine($this->createemptyproc);
        }
        return null;

    }

    public function getCreateProc()
    {
        if ($this->createproc) {
            return new DataBaseRoutine($this->createproc);
        }
        return null;
    }

    public function getDeleteProc()
    {
        if ($this->deleteproc) {
            return new DataBaseRoutine($this->deleteproc);
        }
        return null;
    }

    public function getReadProc()
    {
        if ($this->readproc) {
            return new DataBaseRoutine($this->readproc);
        }
        return null;
    }

    public function getUpdateProc()
    {
        if ($this->updateproc) {
            return new DataBaseRoutine($this->updateproc);
        }
        return null;
    }

    public function getValidationProc()
    {
        if ($this->validationproc) {
            return new DataBaseRoutine($this->validationproc);
        }
        return null;
    }

}