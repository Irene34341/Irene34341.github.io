var url = "http://localhost:8090/iserver/services/map-SiChuan/rest/maps/%E7%9C%81%40SiChuan";

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


/*定位与信息查询图层对象 */
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
    // 移除上一次查询的定位图层
    if (resultLayer) {
        map.removeLayer(resultLayer);
    }
    /*移除上一次查询的弹窗 */
    if (popup) {
        map.removeLayer(popup);
    }
    searchSuggestions.innerHTML = '';
    query();
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

/*地图查询部分，实现位置查询 */
function query() {
    var param = new L.supermap.QueryBySQLParameters({
        queryParams: {
            name: "A级旅游景区@SiChuan@@SiChuanMap",
            attributeFilter: "名称 like '%" + inputValue + "%'"
        }
    });
    new L.supermap
        .QueryService(url)
        .queryBySQL(param, function (serviceResult) {
            var result = serviceResult.result;
            console.log(result);
            resultLayer = L.geoJSON(result.recordsets[0].features, {
                //每个图层元素被点击时，会触发相应的点击事件
                onEachFeature: function (feature, layer) {
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
            name: "A级旅游景区@SiChuan@@SiChuanMap",
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
                content += '<p>经纬度：[' + prope.经度 + '，' + prope.纬度 + ']</p>';

                popup = L.popup({
                    offset: L.point(5, -15),
                    maxWidth: 900
                }).setLatLng(latlng)
                    .setContent(content)
                    .openOn(map);
            }
        });
}
