<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 12.11.13
 * Time: 12:56
 */

namespace Chocolate\HTML\Card\Settings;

use Rmk\Collection\ObjectMap as ObjectMap;
class CardElementSettingsCollection extends ObjectMap{
    public function __construct($from = null)
    {
        parent::__construct('Chocolate\HTML\Card\Interfaces\ICardElementSettings', $from);
    }

} 