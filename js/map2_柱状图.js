var map, resultLayer,
    baseUrl = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E5%B8%82%E7%BA%A7%E6%99%AF%E5%8C%BA%E5%88%92%E5%88%86%40SiChuan",
    url = "http://localhost:8090/iserver/services/data-SiChuan/rest/data";

map = L.map('map', {
    center: ([30.57, 102.55]),
    maxZoom: 28,
    minZoom: 1,
    zoom: 6,
    preferCanvas: true,
    crs: L.CRS.EPSG4326,
});

// new L.supermap.TiledMapLayer(baseUrl).addTo(map);

//加载天地图服务图层
var tianditu = new L.supermap.TiandituTileLayer({
    key: "9f0cc20e3f7b9e757afe844cf1973397",
    layertype: 'vec',
}).addTo(map);

//加载iServer服务图层
var sichuan = new L.supermap.TiledMapLayer(baseUrl, {
    noWrap: true,
    transparent: true,
    opacity: 1
}).addTo(map);

option = {
    legend: {
        orient: 'horizontal'//图例水平显示
    },
    toolbox: {
        feature: {
            magicType: {
                type: ['bar']
            },
            saveAsImage: {
                pixelRatio: 2
            }
        }
    },
    tooltip: {},
    xAxis: {
        data: ["总数", "5A", "4A", "3A", "2A", "1A"]
    },
    yAxis: {},
    series: [{
        name: 'bar',
        type: 'bar',
        animationDelay: function (idx) {
            return idx * 10;
        }
    }],
    animationEasing: 'elasticOut',
    animationDelayUpdate: function (idx) {
        return idx * 5;
    }
};
var div = L.DomUtil.create('div');
var chart = echarts.init(div, '', {
    width: 500,
    height: 300
});
chart.setOption(option);


query();

function query() {
    var sqlParam = new L.supermap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: "市@SiChuan.2@@SiChuanMap2",
            attributeFilter: ""
        },
        datasetNames: ["SiChuan:市"],
        toIndex: 20
    });

    new L.supermap
        .FeatureService(url)
        .getFeaturesBySQL(sqlParam, function (serviceResult) {

            resultLayer = L.geoJSON(serviceResult.result.features).bindPopup(function (layer) {
                var city = layer.feature.properties.市名称;
                var data = [];
                data[0] = layer.feature.properties.AMOUNT;
                data[1] = layer.feature.properties.T_5A;
                data[2] = layer.feature.properties.T_4A;
                data[3] = layer.feature.properties.T_3A;
                data[4] = layer.feature.properties.T_2A;
                data[5] = layer.feature.properties.T_1A;

                chart.setOption({
                    title: {
                        text: city,
                        subtext: "A级景区数量",
                    },
                    series: [
                        {
                            name: "A级景区数量",
                            data: data
                        }
                    ]
                });
                return chart.getDom();
            }, { maxWidth: 600 }).addTo(map);
        });

}
function clearLayer() {
    if (resultLayer) {
        resultLayer.removeFrom(map);
    }
}