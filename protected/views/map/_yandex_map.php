<?
/**
 * @var $model GridForm
 * @var $this CController
 */
$mapID = uniqid('map');
$recordset = $model->loadData();
$data = json_encode($recordset->rawUrlEncode());
?>

<div class="map" id="<? echo $mapID ?>"></div>
<?
Yii::app()->clientScript->registerScript('yandex_map', <<<JS

jQuery.cachedScript = function( url, options ) {

  // Allow user to set any option except for dataType, cache, and url
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return jQuery.ajax( options );
};
    $.cachedScript('http://api-maps.yandex.ru/2.1/?lang=ru_RU').done(
     function(){
      ymaps.ready(function(){
      var map = facade.getFactoryModule().makeChMap($('#' + '$mapID'));
      map.init(ymaps, '$data');
  });
    } );
JS
    , CClientScript::POS_END
)
?>