<?php
use Chocolate\HTML\Card\Interfaces\ICardElementSettings;
use Chocolate\HTML\Card\Settings\CardElementSettingsCollection;
use Chocolate\HTML\ChHtml;
use FrameWork\DataForm\Card\CardElementPQ;

class ChCard extends CWidget
{
    CONST START_Y_POSITION = 1;
    CONST MAX_POSITION = 'max';
    private static $tabIndex;
    public $cols;
    public $rows;
    public $pk;
    public $view;
    public $viewID;
    /**
     * @var CardElementSettingsCollection $CardElementSettingsCollection ;
     */
    public $CardElementSettingsCollection;
    private $cellWidth;
    private $cardID;

    public function init()
    {
        parent::init();
        self::$tabIndex = 0;
        $this->cellWidth = intval(100 / $this->cols);
    }

    public function run()
    {
        parent::run();
        $this->cardID = ChHtml::generateUniqueID('card');
        $this->renderCard();
    }

    public function renderCard()
    {
        ob_start();
        $this->renderTopContent();

        foreach ($this->createQueue() as $element) {
            $this->createCell($element['data'], $element['priority']);
        }
        echo '</div>';
        $this->renderCardButtons();
        ob_end_flush();
        $this->registerScripts();
    }

    protected function renderTopContent()
    {
        echo CHtml::openTag('div', [
            'class' => 'card-content',
            'data-id' => 'card-control',
            'data-view-id' => $this->viewID,
            'id' => $this->cardID,
            'data-rows' => $this->rows
        ]);
    }

    protected function createQueue()
    {
        $cardElementPQ = new CardElementPQ();
        /** @var $cardSettings ICardElementSettings */
        foreach ($this->CardElementSettingsCollection as $cardSettings) {
            $cardElementPQ->insert(
                $cardSettings->render($this->pk, $this->view, $this->viewID, ++self::$tabIndex),
                $cardSettings
            );
        }
        $cardElementPQ->setExtractFlags($cardElementPQ::EXTR_BOTH);
        return $cardElementPQ;
    }

    protected function createCell($data, ICardElementSettings $elementSettings)
    {
        $id = ChHtml::generateUniqueID('chocolate');
        $this->renderTopCell($id, $elementSettings);
        $elementSettings->processBeforeRender($id);
        $elementSettings->renderBeginData();
        echo $data;
        $elementSettings->renderEndData();
        echo '</div>';
    }

    protected function renderTopCell($id, ICardElementSettings $elementSettings)
    {
        $posX = $elementSettings->getX();
        $style = sprintf('left:%u%%;width:%u%%;',
            $this->cellWidth * ($posX - 1),
            $this->getCellWidth($elementSettings)
        );
        echo CHtml::openTag('div', [
                'id' => $id,
                'data-x' => $posX,
                'data-y' => $elementSettings->getY(),
                'class' => $this->getCellClass($elementSettings),
                'data-rows' => $this->countCellRows($elementSettings),
                'style' => $style,
                'data-min-height' => $elementSettings->getMinHeight(),
            ]
        );
    }

    /**
     * @param ICardElementSettings $elementSettings
     * @return int
     */
    protected function getCellWidth(ICardElementSettings $elementSettings)
    {
        $width = $elementSettings->getWidth();
        if (strcasecmp($width, self::MAX_POSITION) == 0) {
            return ($this->cols - $elementSettings->getX() + 1) * $this->cellWidth;
        } else {
            return $this->cellWidth * $width;
        }
    }

    protected function getCellClass(ICardElementSettings $elementSettings)
    {
        $class = 'card-col';
        if ($elementSettings->isStatic()) {
            $class .= ' card-static';
        } else {
            $class .= ' card-dynamic';
        }
        return $class;
    }

    /**
     * @param ICardElementSettings $elementSettings
     * @return int
     */
    protected function countCellRows(ICardElementSettings $elementSettings)
    {
        $countRows = $elementSettings->getHeight();
        if (strcasecmp($countRows, self::MAX_POSITION) == 0) {
            $countRows = $this->rows - $elementSettings->getY() + 1;
        }
        return $countRows;
    }

    protected function renderCardButtons()
    {
        echo CHtml::openTag('div', [
            'class' => 'card-action-button',
            'data-id' => 'action-button-panel',
            'data-view-id' => $this->viewID
        ]) ;
        echo CHtml::button('Сохранить', ['class' => 'card-save', 'data-id' => 'card-save',]);
        echo CHtml::button('Отменить', ['class' => 'card-cancel', 'data-id' => 'card-cancel',]);
        echo '</div>';
    }

    protected function registerScripts()
    {
        Yii::app()->clientScript->registerScript($this->cardID, <<<JS
            chAjaxQueue.send();
            ChocolateDraw.drawCardControls($('#' +'$this->cardID'));
JS
            ,
            CClientScript::POS_END);
    }
}