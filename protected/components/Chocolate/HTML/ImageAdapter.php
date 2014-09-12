<?

namespace Chocolate\HTML;

class ImageAdapter
{

    public static function getHtml($image = null)
    {
        if ($class = self::convertImageToCssClass($image)) {
            return \CHtml::tag('span', ['class' => $class]);
        }
        return null;

    }

    protected static function convertImageToCssClass($image = null)
    {
        switch ($image) {
            case 'TaskBig.jpg':
                return 'fa-tasks';
            default:
                return null;
        }
    }

}