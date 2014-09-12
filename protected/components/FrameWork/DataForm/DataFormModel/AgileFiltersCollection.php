<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 11.06.13
 * Time: 14:26
 * To change this template use File | Settings | File Templates.
 */

namespace FrameWork\DataForm\DataFormModel;

use Chocolate\HTML\Filter\EditableFilterWidget;
use Chocolate\HTML\Filter\Settings\DateRange;
use Chocolate\HTML\Filter\Settings\FilterSettingsCollection;
use Rmk\Collection\ObjectMap as ObjectMap;

class AgileFiltersCollection extends ObjectMap
{
    public function __construct($from = null)
    {
        parent::__construct('\FrameWork\DataForm\DataFormModel\AgileFilter', $from);
    }

    public function getAttributeLabels()
    {
        $attributeLabels = [];
        /**
         * @var $agileFilter AgileFilter
         */
        foreach($this as $agileFilter){
            if($agileFilter->isVisible()){
                $attributeLabels[$agileFilter->getNameInModel()] = $agileFilter->getCaption();

                /**
                 * Так как для контрола диапозон дат в кисе идет 1 контрол, а в шоколаде 2 контрола,
                 * здесь добавляется кепшен ко второму контролу, чтобы не выкидывался эксепшен в yii
                 */
                if ($agileFilter->getFilterType() == FilterType::DateBetween) {
                    $attributeLabels[DateRange::getAttributeTo($agileFilter->getName())] = '';
                }
            }
        }
        return $attributeLabels;
    }

    public function getSettingsCollection()
    {
        $settingsCollection = new FilterSettingsCollection();
        $settingsFactory = new EditableFilterWidget();
        /**
         * @var $agileFilter AgileFilter
         */
        foreach ($this as $key => $agileFilter) {
            if ($agileFilter->isVisible()) {
                $settingsCollection->set($key, $agileFilter->getWidgetSetting($settingsFactory));
            }
        }
        return $settingsCollection;
    }

}
