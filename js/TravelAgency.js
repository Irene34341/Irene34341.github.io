
var map, resultLayer,
    baseUrl = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E7%9C%81%40SiChuan",
    url = " http://localhost:8090/iserver/services/data-SiChuan/rest/data";

map = L.map('map', {
    center: ([30.57, 102.55]),
    maxZoom: 28,
    minZoom: 1,
    zoom: 6,
    preferCanvas: true,
    crs: L.CRS.EPSG4326,
});
//创建天地图影像图层
var tiandituImage = new L.supermap.TiandituTileLayer({
    key: "9f0cc20e3f7b9e757afe844cf1973397",
    layerType: 'img',
})
//创建天地图矢量图层
var tiandituVector = new L.supermap.TiandituTileLayer({
    key: "9f0cc20e3f7b9e757afe844cf1973397",
    layerType: 'vec',
})
//创建四川省电子地图图层
var sichuan = new L.supermap.TiledMapLayer(baseUrl, {
    noWrap: true,
    opacity: 0.8
})

// 创建图层组
var baseLayers = {
    "影像底图": tiandituImage,
    "矢量底图": tiandituVector
};
// 将天地图图层添加到图层组中
var tiandituLayers = L.layerGroup([tiandituVector, tiandituImage]);

// 添加图层组和四川省电子地图到图层控制器中
var overlayMaps = {
    "四川省电子地图": sichuan
};

// 叠加四川省电子地图和天地图图层
sichuan.addTo(map);
tiandituLayers.addTo(map);

// 创建图层控制器并添加到地图上
L.control.layers(baseLayers, overlayMaps).addTo(map);





query();

function query() {
    var sqlParam = new L.supermap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: "市@SiChuan@@SiChuanMap",
            attributeFilter: ""
        },
        datasetNames: ["SiChuan:市"],
        toIndex: 20
    });
    new L.supermap
        .FeatureService(url)
        .getFeaturesBySQL(sqlParam, function (serviceResult) {
            resultLayer = L.geoJSON(serviceResult.result.features, {
                onEachFeature: function (feature, layer) {
                    layer.on({
                        click: function () {
                            code = feature.properties.邮政编码;
                            //调用数据查询
                            queryByID(code, [feature.properties.纬度, feature.properties.经度]);

                        }
                    })
                }

            }).addTo(map);
        });
}


var travelAgencyList = [];
function queryByID(code, latlng) {

    //设置数据访问地址
    dataurl = "http://localhost:8090/iserver/services/data-SiChuan/rest/data";
    //定义数据集SQL查询参数
    var sqlParam = new L.supermap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: "市@SiChuan@@市级景区划分@SiChuan",
            attributeFilter: "邮政编码 =" + code
        },
        datasetNames: ["SiChuan:旅行社"]
    });


    new L.supermap
        .FeatureService(dataurl)
        .getFeaturesBySQL(sqlParam, function (serviceResult) {
            travelAgencyList = [];//将数组置为空
            var featureresult = serviceResult.result;
            if (featureresult && featureresult.featureCount > 0) {
                for (var i = 0; i < featureresult.featureCount; i++) {
                    travelAgencyList.push(featureresult.features.features[i].properties);
                }

                // console.log(travelAgencyList);
                var html = "<ul class='menu_ta'> ";

                for (var j = 0; j < travelAgencyList.length; j++) {
                    var agencyName = travelAgencyList[j].旅行社中文名称;
                    // 根据属性信息组织弹出窗口的内容
                    var content = '<h3>' + travelAgencyList[j].旅行社中文名称 + '</h3>';
                    content += '<p>地址：' + travelAgencyList[j].地址 + '</p>';
                    content += '<p>许可证编号：' + travelAgencyList[j].许可证编号 + '</p>';
                    content += '<p>固定电话:' + travelAgencyList[j].固定电话 + '</p>';
                    content += '<p>传真号码：' + travelAgencyList[j].传真号码 + '</p>';
                    content += '<p>邮政编码：' + travelAgencyList[j].邮政编码 + '</p>';

                    html += '<li class="list_ta">';
                    html += '<a href="" class="inform1_ta">';
                    html += agencyName;
                    html += '</a>';
                    html += '<div class="inform2_ta">';
                    html += content;
                    html += '</div>';
                    html += '</li>';
                }

                html += '</ul>';

                popup = L.popup({
                    offset: L.point(0, 15),
                    maxWidth: 900
                }).setLatLng(latlng)
                    .setContent(html)
                    .openOn(map);
            }
        });

}
