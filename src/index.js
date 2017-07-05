
var chart = new D3Chart("idChartPanel", "idPanel");
var data=[
  [{y:2017,m:7,d:5,h:12,n:10,s:0},1.0,2.0,90],
  [{y:2017,m:7,d:5,h:12,n:20,s:0},1.1,1.0,20],
  [{y:2017,m:7,d:5,h:12,n:30,s:0},1.2,5.0,60],
  [{y:2017,m:7,d:5,h:12,n:40,s:0},1.3,3.0,40],
  [{y:2017,m:7,d:5,h:12,n:50,s:0},1.4,6.0,80],
  [{y:2017,m:7,d:5,h:13,n:0,s:0}, 1.5,7.0,50],
  [{y:2017,m:7,d:5,h:13,n:10,s:0},1.4,5.0,10],
  [{y:2017,m:7,d:5,h:13,n:20,s:0},1.3,3.0,60],
  [{y:2017,m:7,d:5,h:13,n:30,s:0},1.2,1.0,90],
  [{y:2017,m:7,d:5,h:13,n:40,s:0},1.1,4.0,40],
  [{y:2017,m:7,d:5,h:13,n:50,s:0},1.2,5.0,60],
  [{y:2017,m:7,d:5,h:14,n:0,s:0}, 1.4,2.8,50],
  [{y:2017,m:7,d:5,h:14,n:10,s:0},1.6,2.0,80],
  [{y:2017,m:7,d:5,h:14,n:20,s:0},1.8,3.0,70],
  [{y:2017,m:7,d:5,h:14,n:30,s:0},1.6,6.0,20],
  [{y:2017,m:7,d:5,h:14,n:40,s:0},1.4,9.0,30]
];
drawCharts("D3Charts demo",data,"Date and time","Values");

function drawCharts(label, arrayData, timeAxisLabel, rangeAxisLabel) {
  var colors = ["green", "red", "black", "blue", "orange", "aqua", "lime", "magenta"];
  var rows = arrayData.length;
  var series = [];
  series[0] = new PlotSerie();
  if (rows > 0) {
    var rowData = arrayData[0];
    var seriesCount = rowData.length - 1;
    // var seriesCount = 1;
    if (seriesCount > 0) {
      var i, row, col, point;
      var seriesData = [];
      for (i = 0; i < seriesCount; i++) {
        seriesData[i] = [];
      }
      for (row = 0; row < rows; row++) {
        rowData = arrayData[row];
        for (col = 1; col < rowData.length; col++) {
          point = [];
          point[0] = rowData[0];
          point[1] = rowData[col];
          seriesData[col - 1].push(point);
        }
      }
      for (i = 0; i < seriesCount; i++) {
        var serie = new PlotSerie({
          color: colors[i % colors.length],
          color2: colors[(i + 1) % colors.length],
          opacity: 1.0,
          type: PlotSerieType.LineType,
          data: seriesData[i],
          // data: arrayData,
          linestyle: PlotSerieStyle.SolidLineStyle,
          symbolcode: 0x2190,
          lower_limit: 0.0,
          upper_limit: 0.0,
          thickness: 1.0,
          group: i + 2,
          invertedAxe: false,
          kA: 1.0,
          kB: 0.0
        });
        series[i] = serie;
      }
    }
  }
  chart.setDatasets([{
    series: series,
    separateGroups: true,
    timeAxisLabel: timeAxisLabel,
    rangeAxisLabel: rangeAxisLabel,
    weekdays: 7,
    weekends: 0,
    label: label,
    timeAxisLeftMargin: 0.05,
    timeAxisRightMargin: 0.05
  }]);
}