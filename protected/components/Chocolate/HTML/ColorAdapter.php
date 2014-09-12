<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 19.02.14
 * Time: 15:11
 */

namespace Chocolate\HTML;


class ColorAdapter
{

    static function decToHex($decColor)
    {
        return self::convert($decColor);
    }

    protected static function convert($decColor)
    {
        $color = dechex($decColor);
        if (strlen($color) < 6) {
            while (strlen($color) < 6) {
                $color .= '0';
            }
        }
        $R = $color[4] . $color[5];
        $G = $color[2] . $color[3];
        $B = $color[0] . $color[1];


        return $R. $G .$B;
    }

    static function decToCssClass($decColor)
    {

    }
} 