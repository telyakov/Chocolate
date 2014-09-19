<?
namespace Chocolate\HTML\Card\Settings;


use Chocolate\HTML\Card\Interfaces\ICardElementSettings;
use FrameWork\DataForm\Card\CardElementType;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\ColumnPropertiesCollection;

abstract class EditableCardElementSettings implements ICardElementSettings
{

    public $columnProperties;
    public $columnPropertiesCollection;
    private $_posY;

    public function __construct(ColumnProperties $columnProperties, ColumnPropertiesCollection $columnPropertiesCollection)
    {
        $this->columnProperties = $columnProperties;
        $this->columnPropertiesCollection = $columnPropertiesCollection;
    }

    public function getMinHeight()
    {
        return 42;
    }

    public function isStatic()
    {
        return true;
    }

    function isSingle()
    {
        return $this->columnProperties->isSingleMode();
    }

    public function getName()
    {
        return $this->columnProperties->getVisibleKey();
    }

    public function renderEndData()
    {
        echo '</div>';
    }

    public function processBeforeRender($id)
    {
        echo \CHtml::label(
            $this->getCaption(),
            $id,
            ['required' => $this->isRequired()]
        );
    }

    public function getCaption()
    {
        return $this->columnProperties->getVisibleCaption();
    }

    public function isRequired()
    {
        return $this->columnProperties->isRequired();
    }

    public function renderBeginData()
    {
        echo \CHtml::openTag('div', [
                'class' => $this->getEditClass() . ' card-input',
            ]
        );
    }

    protected function getEditClass()
    {
        if ($this->getAllowEdit()) {
            return '';
        }
        return 'card-input-no-edit';
    }

    public function getAllowEdit()
    {
        return $this->columnProperties->getAllowEditInCard();
    }

    /**
     * @return CardElementType
     */
    public function getType()
    {
        return $this->columnProperties->getCardEditType();
    }

    public function getX()
    {
        return $this->columnProperties->getCardX();
    }

    public function getY()
    {
        if ($this->_posY) {
            return $this->_posY;
        }
        $posY = $this->getRecursiveY(0, $this->columnProperties);
        $this->_posY = $posY;
        return $posY;
    }

    private function getRecursiveY($curPosY, ColumnProperties $columnProperties)
    {
        $posY = $columnProperties->getCardY();
        if (strrpos($posY, '+')) {
            $matches = explode('+', $posY);
            $parentKey = mb_strtolower($matches[0], 'UTF-8');
            $digit = $matches[1];
            $parentColumn = $this->columnPropertiesCollection->getByKey($parentKey);
            return $this->getRecursiveY($curPosY + $digit, $parentColumn);
        } else {
            return $curPosY + $posY;
        }
    }

    public function getHeight()
    {
        return $this->columnProperties->getCardHeight();
    }

    public function getWidth()
    {
        return $this->columnProperties->getCardWidth();
    }


}