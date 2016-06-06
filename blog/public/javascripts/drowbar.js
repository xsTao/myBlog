// 基于准备好的dom，初始化echarts实例
    var myChart1 = echarts.init(document.getElementById('demo1'));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: 'ECharts 入门示例'
        },
        tooltip: {},
        legend: {
            data:['销量']
        },
        xAxis: {
            data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
        },
        yAxis: {},
        series: [{
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
        }]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart1.setOption(option);
//     myChart1.on('click', function (params) {
//     window.open('https://www.baidu.com/s?wd=' + encodeURIComponent(params.name));
// });

    //demo2
    var myChart2 = echarts.init(document.getElementById('demo2'));
    myChart2.showLoading();
    $.get('/learning/getClothes').done(function(data){
        myChart2.hideLoading();
        myChart2.setOption ({
            title:{
                text:'从数据库中取数据显示图表--柱状图'
            },
            tooltip:{},
            legend:{
                data:['销量']
            },
            xAxis:{
                data:data.categories
            },
            yAxis:{},
            series:[{
                name:'销量',
                type:'bar',
                data:data.data
            }]
        });
    });