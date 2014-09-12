<?php
/**
 * Created by JetBrains PhpStorm.
 * User: tselishchev
 * Date: 27.09.13
 * Time: 15:49
 */

namespace Chocolate\HTML\Filter\Settings;

use FrameWork\DataForm\DataFormModel\AgileFilter;
use Rmk\Collection\ObjectMap as ObjectMap;
use Chocolate\HTML\Filter\Interfaces\IFilterSettings;
class FilterSettingsCollection  extends ObjectMap
{
    public function __construct($from = null)
    {
        parent::__construct('Chocolate\HTML\Filter\Interfaces\IFilterSettings', $from);
    }
}