<?

namespace Chocolate\HTML\Traits;


use FrameWork\DataBase\RecordsetRow;
use FrameWork\DataForm\DataFormModel\ColumnProperties;
use FrameWork\DataForm\DataFormModel\DataFormModel;

trait SelectGetSource
{

    public function getSource(ColumnProperties $columnProperties, DataFormModel $model = null)
    {
        $result = [];
        if (($recordset = $columnProperties->executeReadProc($model)) && $recordset->isNotEmpty()) {

            $count = $recordset->count();
            $data = $recordset->toArray();
            for($i = 0; $i < $count; ++$i){
                $result[$i] = [
                    'text' => $data[$i]->data['name'],
                    'value' => $data[$i]->id
                ];
            }
        }
        return $result;
    }
} 