var map, resultLayer,
  url = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E5%B8%82%E7%BA%A7%E6%99%AF%E5%8C%BA%E5%88%92%E5%88%86%40SiChuan";
var dataurl = "http://localhost:8090/iserver/services/data-SiChuan/rest/data";
//创建地图对象
map = L.map('map', {
  preferCanvas: true,
  center: ([30.57, 102.55]),
  maxZoom: 20,
  minZoom: 1,
  zoom: 6,
  crs: L.CRS.EPSG4326,
});
//加载天地图服务图层
var tianditu = new L.supermap.TiandituTileLayer({
  key: "9f0cc20e3f7b9e757afe844cf1973397",
  layertype: 'vec',
}).addTo(map);
//加载iServer服务图层
var sichuan = new L.supermap.TiledMapLayer(url, {
  noWrap: true,
  transparent: true,
  opacity: 1
}).addTo(map);


// new L.supermap.TiledMapLayer(url).addTo(map);
query();

function query() {
  var sqlParam = new L.supermap.GetFeaturesBySQLParameters({
    queryParameter: {
      name: "A级旅游景区@SiChuan@@SiChuanMap2",
      attributeFilter: "SmUserID>2 and SmUserID<6"
    },
    datasetNames: ["SiChuan:A级旅游景区"],
    fromIndex: 0,
    toIndex: -1,//全部返回的话必须是-1
    maxFeatures: 820//返回数量必须大于等于总数
  });

  loadHeatMap();
  function loadHeatMap() {
    var heatRadius = 30;
    var radius = parseInt(heatRadius);
    radius = (radius > 0) ? radius : 0;

    new L.supermap
      .FeatureService(dataurl)
      .getFeaturesBySQL(sqlParam, function (serviceResult) {
        //console.log(serviceResult);
        var i = 0;
        var heatpoint = [];
        resultLayer = L.geoJSON(serviceResult.result.features, {
          onEachFeature: function (feature) {
            var latitude = feature.properties.纬度;
            var longitude = feature.properties.经度;
            heatpoint[i] = [latitude, longitude];
            i++;
          }
        })

        //把geojson图层加载成热力图层
        resultLayer = L.heatLayer(heatpoint, {
          radius: radius,
          minOpacity: 0.5
        }).addTo(map);
        // loadHeatMap(heatpoint);
      });
  }
}