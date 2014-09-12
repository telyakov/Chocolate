<?php
namespace FrameWork\DataForm\Card;

use FrameWork\DataForm\Traits\Component;
use Rmk\Collection\ObjectMap as ObjectMap;

class CardCollection extends ObjectMap
{
    use Component;

    protected $caption;
    protected $header;
    protected $buttonwidth;
    protected $buttonheight;
    protected $afteredit;
    protected $headerimage;
    protected $smallheader;
    protected $headerheight;
    protected $cols;
    protected $rows;
    protected $autoopen;

    public function __construct(\SimpleXMLElement $xmlFile = null, $from = null)
    {
        parent::__construct('\FrameWork\DataForm\Card\Card', $from);
        if ($xmlFile) {
            $this->init($xmlFile, __CLASS__);
        }
    }

    public function toJs()
    {
        $result = [];
        /**
         * @var $card Card
         */
        foreach ($this as $card) {
            if ($card->isVisible()) {
                $result[$card->getKey()] = [
                    'caption' => rawurlencode($card->getCaption()),
                    'captionReadProc' => rawurlencode($card->getCaptionReadProc())
                ];
            }
        }
        return $result;
    }

    /**
     * @return mixed
     */
    public function hasHeader()
    {
        return $this->getHeader() || $this->getHeaderImage();
    }

    public function getHeader()
    {
        return addslashes($this->header);
    }

    public function getHeaderImage()
    {
        return $this->headerimage;
    }

    public function isAutoOpen()
    {
        return self::boolExpressionEval($this->autoopen);
    }

    public function getCaption()
    {
        return $this->caption;
    }

    public function isAllow()
    {
        return $this->isNotEmpty();
    }

    public function getTabs()
    {
        $result = [];
        /**
         * @var $card Card
         */
        foreach ($this as $card) {
            if ($card->isVisible()) {
                $result[$card->getCaption()] = ['id' => $card->getKey()];
            }
        }
        return $result;
    }

}