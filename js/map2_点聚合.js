var map, resultLayer, getFeatureBySQLParams,
    dataUrl = "http://localhost:8090/iserver/services/data-SiChuan/rest/data",
    url = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E5%B8%82%E7%BA%A7%E6%99%AF%E5%8C%BA%E5%88%92%E5%88%86%40SiChuan"
map = L.map('map', {
    center: ([30.57, 102.55]),
    maxZoom: 28,
    minZoom: 1,
    zoom: 6,
    preferCanvas: true,
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

resultLayer = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false
});
getFeatureBySQLParams = new L.supermap.GetFeaturesBySQLParameters({
    queryParameter: new L.supermap.FilterParameter({
        name: "A级旅游景区@SiChuan@@SiChuanMap2",
        attributeFilter: "SmUserID>2 and SmUserID<6"
    }),
    toIndex: -1,
    datasetNames: ["SiChuan:A级旅游景区"]
});
loadMarkerCluster();

function loadMarkerCluster() {
    new L.supermap
        .FeatureService(dataUrl)
        .getFeaturesBySQL(getFeatureBySQLParams, function (serviceResult) {
            createLayers(serviceResult.result.features);
        });
}

function createLayers(result) {
    if (!result || !result.features || result.features.length < 1) {
        return;
    }
    result.features.map(function (feature) {
        var latLng = L.CRS.EPSG4326.unproject(L.point(feature.geometry.coordinates));
        resultLayer.addLayer(L.marker(latLng));
    });
    resultLayer.addTo(map);
}