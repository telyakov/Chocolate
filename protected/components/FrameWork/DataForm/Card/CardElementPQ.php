<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 13.11.13
 * Time: 9:36
 */

namespace FrameWork\DataForm\Card;


use Chocolate\HTML\Card\Interfaces\ICardElementSettings;

class CardElementPQ extends \SplPriorityQueue
{
    public function compare(ICardElementSettings $priority1, ICardElementSettings $priority2)
    {
        $priority1_posX = $priority1->getX();
        $priority1_posY = $priority1->getY();
        $priority2_posX = $priority2->getX();
        $priority2_posY = $priority2->getY();

        if($priority1_posY >$priority2_posY){
            return -1;
        }
        if ($priority1_posY < $priority2_posY){
            return 1;
        }
        if ($priority1_posX === $priority2_posX)
        {
            return 0;
        }
        return $priority1_posX > $priority2_posX ? -1 : 1;
    }


} 