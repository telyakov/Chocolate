<?php
/**
 * Created by PhpStorm.
 * User: tselishchev
 * Date: 17.04.14
 * Time: 8:10
 */
use Chocolate\WebService\WebService;

class WebServiceTest extends UnitTestCase{
    /**
     * @var $conn WebService
     */
    public $conn;
    protected function setUp()
    {
        parent::setUp();
        $this->conn = new WebService(\Yii::app()->params['soapService']);
    }

    public function testParseEmptyArray(){
        $method = new ReflectionMethod('Chocolate\WebService\WebService', 'parse');
        $method->setAccessible(true);
        $data = $method->invoke($this->conn, []);
        $this->assertInstanceOf('\FrameWork\DataBase\Recordset', $data);
    }

    public function testParse(){
        $method = new ReflectionMethod('Chocolate\WebService\WebService', 'parse');
        $method->setAccessible(true);
        $columns = 30;
        $pages = 1;
        $attributes = 2;
        $meta = [
            'name1', 'i',
            'name2', 's',
            'name3', 'd',
            'name4', 'i',
            'name5', 'i',
            'name6', 'i',
            'name7', 's',
            'name8', 'i',
            'name9', 'i',
            'name10', 'i',
            'name11', 'i',
            'name12', 'i',
            'name13', 'd',
            'name14', 'i',
            'name15', 'i',
            'name16', 'i',
            'name17', 'i',
            'name18', 'i',
            'name19', 't',
            'name20', 'i',
            'name21', 'i',
            'name22', 's',
            'name23', 'i',
            'name24', 's',
            'name25', 's',
            'name26', 'i',
            'name27', 'i',
            'name28', 'd',
            'name29', 'i',
            'name30', 'i',
        ];
        $data = [$columns, $pages, $attributes];
        foreach($meta as $value){
            $data[] = $value;
        }
        $i = 0;
        $row = [
            'Тестируем большое количество данных 1',
            'NULL',
            'Тестируем большое количество данных 3',
            'Тестируем большое количество данных 4',
            'Тестируем большое количество данных 5',
            'Тестируем большое количество данных 6',
            'Тестируем большое количество данных 7',
            'Тестируем большое количество данных 8',
            'Тестируем большое количество данных 9',
            'Тестируем большое количество данных 10',
            'Тестируем большое количество данных 11',
            'Тестируем большое количество данных 12',
            'Тестируем большое количество данных 13',
            'Тестируем большое количество данных 14',
            'Тестируем большое количество данных 15',
            'True',
            'Тестируем большое количество данных 17',
            'Тестируем большое количество данных 18',
            'Тестируем большое количество данных 19',
            'Тестируем большое количество данных 20',
            'Тестируем большое количество данных 21',
            'Тестируем большое количество данных 22',
            'Тестируем большое количество данных 23',
            'Тестируем большое количество данных 24',
            'False',
            'Тестируем большое количество данных 26',
            'Тестируем большое количество данных 27',
            'Тестируем большое количество данных 28',
            'Тестируем большое количество данных 29',
            'Тестируем большое количество данных 30',
        ];
        while ($i<2000){
            ++$i;
           foreach($row as $value){
               $data[] = $value;
           }
        }
        $start = microtime(true);
        $recordset = $method->invoke($this->conn, $data);
        $end = microtime(true) - $start;
        $t= '';
    }
} 