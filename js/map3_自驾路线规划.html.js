var map, findPathService, findPathParameter,
    url = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E7%9C%81%40SiChuan";
serviceUrl = "http://localhost:8090/iserver/services/transportationAnalyst-SiChuan/rest/networkanalyst/SiChuan_Network@SiChuan";

/*1.创建地图*/
//创建地图对象
map = L.map('map', {
    center: ([30.57, 102.55]),
    maxZoom: 28,
    minZoom: 1,
    zoom: 6,
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
var sichuan = new L.supermap.TiledMapLayer(url, {
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

/*2.定位与信息查询图层对象 */
var resultLayer;//定位图层
var popup;//弹窗图层

/*地图查询部分，实现景区的搜索定位*/

//传递搜索框内容
var btn1 = document.getElementById('btn1');
var input1 = document.getElementById('input1');
const searchSuggestions = document.getElementById('search-suggestions');
var inputValue;

//点击查询按钮
btn1.addEventListener('click', function () {
    inputValue = input1.value;
    query();
})

/*3.路线查询部分，实现景区的搜索定位*/

var lat = [];
var lng = [];
var i = 1;

/*鼠标点击事件*/
function mouseclick() {

    var clickMarker = null; // 定义全局变量来存储点击点
    // 在地图上注册点击事件
    map.on('click', function (e) {
        var latlng = e.latlng; // 获取点击处的经纬度坐标
        // 更新点击点
        updateClickMarker(latlng);
        lng[0] = latlng.lng;
        lat[0] = latlng.lat;
    });

    function updateClickMarker(latlng) {
        // 在地图上只保留一个点击点
        if (clickMarker) {
            map.removeLayer(clickMarker);
        }

        // 创建新的点击点
        clickMarker = L.marker(latlng).addTo(map);
    }
}



/*地图查询部分，实现位置查询 */
function query() {
    var param = new L.supermap.QueryBySQLParameters({
        queryParams: {
            name: "A级旅游景区@SiChuan@@省@SiChuan",
            //attributeFilter: "名称 like'%" + inputValue + "%'"
            attributeFilter: "名称 = '" + inputValue + "'"
        }
    });
    new L.supermap
        .QueryService(url)
        .queryBySQL(param, function (serviceResult) {
            var result = serviceResult.result;
            console.log(result);
            resultLayer = L.geoJSON(result.recordsets[0].features, {
                onEachFeature: function (feature, layer) {
                    lat[i] = feature.geometry.coordinates[1];//纬度
                    lng[i] = feature.geometry.coordinates[0];//经度
                    i++;
                    //console.log("i=",i);
                    //每个图层元素被点击时，会触发相应的点击事件
                    layer.on({
                        click: function () {
                            // console.log(feature.properties);

                            //调用数据查询
                            queryByID(feature.properties.SmID, [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);

                        }
                    })
                }
            }).addTo(map);
        });
}


/*数据查询部分，点击景区位置展示该旅游景区的属性信息*/
function queryByID(id, latlng) {

    // console.log(name);
    //设置数据访问地址
    dataurl = "http://localhost:8090/iserver/services/data-SiChuan/rest/data";
    //定义数据集SQL查询参数
    var sqlParam = new L.supermap.GetFeaturesBySQLParameters({
        queryParameter: {
            name: "A级旅游景区@SiChuan@@省@SiChuan",
            attributeFilter: "SmID = " + id
        },
        datasetNames: ["SiChuan:A级旅游景区"]
    });

    new L.supermap
        .FeatureService(dataurl)
        .getFeaturesBySQL(sqlParam, function (serviceResult) {
            var featureresult = serviceResult.result;
            if (featureresult && featureresult.featureCount > 0) {
                var feat = featureresult.features.features[0];
                var prope = feat.properties;

                // console.log(prope);

                // 根据属性信息组织弹出窗口的内容
                var content = '<h3>' + prope.名称 + '</h3>';
                content += '<p>地址：' + prope.地址 + '</p>';
                content += '<p>等级：' + prope.等级 + '</p>';
                content += '<p>经纬度：[' + prope.经度 + ',' + prope.纬度 + ']</p>';


                popup = L.popup({
                    offset: L.point(0, 15),
                    maxWidth: 900
                }).setLatLng(latlng)
                    .setContent(content)
                    .openOn(map);

                // console.log(lng,lat);
            }
        });
}

//传递搜索框内容
var btn2 = document.getElementById('btn2');

//点击目的地添加按钮
btn2.addEventListener('click', function () {
    mouseclick();
})

btn3.addEventListener('click', function () {
    findPathProcess();
})


/*监听输入框输入事件，实现搜索提示*/
input1.addEventListener('input', function () {
    const keyword = this.value.trim();//获取搜索框中输入的关键字，并去掉关键字两侧的空格
    // 清空之前的提示内容
    searchSuggestions.innerHTML = '';
    if (keyword) {
        // 遍历匹配关键字的旅游景区名称，生成提示项并添加到提示框中
        touristspot.forEach(item => {
            if (item.includes(keyword)) {
                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = item;
                searchSuggestions.appendChild(suggestionItem);
            }
        });
    }
});
// 监听点击提示项事件，在输入框中显示所选的提示内容
searchSuggestions.addEventListener('click', function (event) {
    const selectedSuggestion = event.target;
    input1.value = selectedSuggestion.textContent;
    searchSuggestions.innerHTML = '';
});



function findPathProcess() {
    // for(var j=0;j<i;j++){
    //     console.log(lat[j],lng[j]);
    // }
    //添加景区站点
    for (var j = 1; j < i; j++) {
        L.marker([lat[j], lng[j]]).addTo(map);
    }

    //添加自定义站点
    L.marker([lat[0], lng[0]]).addTo(map);

    //创建最佳路径分析服务实例
    findPathService = new L.supermap.NetworkAnalystService(serviceUrl);
    //创建最佳路径分析参数实例
    var resultSetting = new L.supermap.TransportationAnalystResultSetting({
        returnEdgeFeatures: true,
        returnEdgeGeometry: true,
        returnEdgeIDs: true,
        returnNodeFeatures: true,
        returnNodeGeometry: true,
        returnNodeIDs: true,
        returnPathGuides: true,
        returnRoutes: true
    });
    var analystParameter = new L.supermap.TransportationAnalystParameter({
        resultSetting: resultSetting,
        weightFieldName: "value"
    });

    var points = []; // 存储所有点的数组

    // 将所有经纬度对象转换为 L.point 对象，并将它们添加到 points 数组中
    for (j = 0; j < i; j++) {
        var point = L.point(lng[j], lat[j]);
        points.push(point);
    }


    var findPathParameter = new L.supermap.FindPathParameters({
        isAnalyzeById: false,
        nodes: points,
        parameter: analystParameter
    });


    var myIcon = L.icon({
        iconUrl: "../../../data/开车.png",
        iconSize: [1, 1]
    });
    //进行查找
    findPathService.findPath(findPathParameter, function (serviceResult) {
        var result = serviceResult.result;
        console.log(result); // 查看路径分析结果
        result.pathList.map(function (result) {
            L.geoJSON(result.route).addTo(map);
            L.geoJSON(result.pathGuideItems, {
                pointToLayer: function (geoPoints, latlng) {
                    L.marker(latlng, { icon: myIcon }).addTo(map);
                },
                filter: function (geoJsonFeature) {
                    if (geoJsonFeature.geometry && geoJsonFeature.geometry.type === 'Point') {
                        return true;
                    }
                    return false;
                }
            }).addTo(map);
        })
    });
}
