import { buildCompositeChart } from "./build-chart.js"

let totalizedDeforestationArea = null
let totalizedDegradationArea   = null
let totalizedAlertsInfoBox     = null
let totalizedCustomArea        = null
let lineSeriesMonthly          = null
let ringTotalizedByState       = null
let rowTotalizedByClass        = null
let barAreaByYear              = null

let monthFilters  = null
let deforestation = null
let degradation   = null

let temporalDimension0 = null
let areaGroup0         = null
let classDimension0    = null
let yearDimension0     = null
let ufDimension0       = null
let monthDimension0    = null

let temporalDimensionCloud = null
let areaGroupCloud         = null
let areaUfGroupCloud       = null
let yearDimensionCloud     = null
let yearGroupCloud         = null
let ufDimensionCloud       = null
let monthDimensionCloud    = null

let monthDimension              = null
let numPolDimension             = null
let yearDimension               = null
let yearGroup                   = null
let ufDimension                 = null
let classDimension              = null
let ufGroup                     = null
let totalDeforestationAreaGroup = null
let totalDegradationAreaGroup   = null
let totalAlertsGroup            = null

let data      = null
let cloudData = null

let _cloudSubCharts         = null
let _deforestationSubCharts = null
let _deforestationStatus    = null
let _cloudStatus            = null

let ringPallet = null
let defPallet  = null
let cldPallet  = null

let defaultHeight = null

let calendarConfiguration = 'prodes'

export function loadData(url) {
    return new Promise((resolve, reject) => {
        d3.json(url, (error, data) => {
        if (error != null) {
            reject(error); // Rejeita a Promise com o erro, se houver
        } else {
            resolve(data); // Resolve a Promise com os dados
        }
        });
    });
}

export function processCloudData(data) 
{
    if(!data || !data.totalFeatures || data.totalFeatures<=0) {
        return;
    }

    let objectData=[];
    var numberFormat = d3.format('.2f');

    for (let j = 0, n = data.totalFeatures; j < n; ++j) {
        let fet    = data.features[j]
        let aCloud = (fet.properties.a>0)?(fet.properties.a):(0)
        let month  = +fet.properties.m
        let year   = +fet.properties.y

        if(calendarConfiguration=='prodes') {
            if(month >=1 && month<=7) {
                year = (year-1)+"/"+year
            }
            if(month >=8 && month<=12) {
                year = year+"/"+(year+1)
            }
        }
        objectData
            .push(
                {
                    year:year,
                    month:month,
                    a:numberFormat(aCloud),
                    au:numberFormat(fet.properties.au),
                    uf:fet.properties.u
                }
            )
    }

    cloudData = objectData

    build()
}

function setChartReferencies() 
{
    totalizedDeforestationArea = dc.numberDisplay("#deforestation-classes", "agrega");
    totalizedDegradationArea   = dc.numberDisplay("#degradation-classes", "agrega");
    totalizedAlertsInfoBox     = dc.numberDisplay("#numpolygons", "agrega");
    totalizedCustomArea        = d3.select("#custom-classes");

    ringTotalizedByState = dc.pieChart("#chart-by-state", "filtra");
    rowTotalizedByClass  = dc.rowChart("#chart-by-class", "filtra");
    barAreaByYear        = dc.barChart("#chart-by-year", "filtra");
}

function build() 
{
    setChartReferencies();
    
    // build the monthly series chart
    //buildSeriesChart(;
    buildCompositeChart(window);

    ringTotalizedByState
        .height(defaultHeight)
        .innerRadius(10)
        .externalRadiusPadding(30)
        .dimension(ufDimension)
        .group(ufGroup)
        .title(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
            v=localeBR.numberFormat(',1f')(v);
            return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
        })
        .label(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(0)));
            v=localeBR.numberFormat(',1f')(v);
            return d.key + ":" + v + " "+Translation[Lang.language].unit;
        })
        .ordering(dc.pluck('key'))
        .ordinalColors(graph.ringPallet)
        .legend(dc.legend().x(20).y(10).itemHeight(13).gap(7).horizontal(0).legendWidth(50).itemWidth(35));

    ringTotalizedByState.valueAccessor(function(d) {
        return Math.abs(+(d.value.toFixed(2)));
    });

    // start chart by classes
    rowTotalizedByClass
        .height(defaultHeight)
        .dimension(classDimension)
        .group(utils.snapToZero(classGroup))
        .title(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
            v=localeBR.numberFormat(',1f')(v);
            var t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit;
            if(d.key==="CORTE_SELETIVO") {
                t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit + " ("+
                ( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].warning_class_prodes):(Translation[Lang.language].warning_class) )+")";
                
            }
            return t;
        })
        .label(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(1)));
            v=localeBR.numberFormat(',1f')(v);
            var t=utils.mappingClassNames(d.key) + ": " + v + " " + Translation[Lang.language].unit;
            if(d.key==="CORTE_SELETIVO") {
                t=utils.mappingClassNames(d.key) + "*: " + v + " " + Translation[Lang.language].unit + " ("+
                ( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].warning_class_prodes):(Translation[Lang.language].warning_class) )+")";
            }
            return t;
        })
        .elasticX(true)
        .ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])
        .ordering(function(d) {
            return -d.value;
        })
        .controlsUseVisibility(true);

    rowTotalizedByClass.xAxis().tickFormat(function(d) {
        var t=parseInt(d/1000);
        t=(t<1?parseInt(d):t+"k");
        return t;
    }).ticks(5);
    
    rowTotalizedByClass
    .filterPrinter(function(f) {
        var l=[];
        f.forEach(function(cl){
            l.push(utils.mappingClassNames(cl));
        });
        return l.join(",");
    });

    let	barColors = getOrdinalColorsToYears(graph.defPallet);

    barAreaByYear
        .height(defaultHeight)
        .yAxisLabel(Translation[Lang.language].area+" ("+Translation[Lang.language].unit+")")
        .xAxisLabel( (graph.calendarConfiguration=='prodes')?(Translation[Lang.language].barArea_x_label_prodes):(Translation[Lang.language].barArea_x_label) )
        .dimension(yearDimension)
        .group(utils.snapToZero(yearGroup))
        .title(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
            v=localeBR.numberFormat(',1f')(v);
            return Translation[Lang.language].area+": " + v + " "+Translation[Lang.language].unit;
        })
        .label(function(d) {
            var v=Math.abs(+(parseFloat(d.data.value).toFixed(0)));
            v=localeBR.numberFormat(',1f')(v);
            return v;
        })
        .elasticY(true)
        .yAxisPadding('10%')
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .barPadding(0.2)
        .outerPadding(0.1)
        .renderHorizontalGridLines(true)
        .colorCalculator(function(d) {
            var i=0,l=barColors.length;
            while(i<l){
                if(barColors[i].key==d.key){
                    return barColors[i].color;
                }
                i++;
            }
        })
        .margins({top: 20, right: 35, bottom: ( graph.calendarConfiguration=='prodes'?75:60 ), left: 55});

        
    barAreaByYear
        .on("renderlet.a",function (chart) {
            // rotate x-axis labels
            if(graph.calendarConfiguration=='prodes')
                chart.selectAll('g.x text').attr('transform', 'translate(-25,18) rotate(315)');
            else
                chart.selectAll('g.x text').attr('transform', 'translate(-15,8) rotate(315)');
        });

    dc.chartRegistry.list("filtra").forEach(function(c,i){
        c.on('filtered', function(chart, filter) {
            var filters = chart.filters();
            var commonFilterFunction = function (d) {
                for (var i = 0; i < filters.length; i++) {
                    var f = filters[i];
                    if (f.isFiltered && f.isFiltered(d)) {
                        return true;
                    } else if (f <= d && f >= d) {
                        return true;
                    }
                }
                return false;
            };

            if(chart.anchorName()=="chart-by-year"){
                if(!filters.length) {
                    graph.yearDimension0.filterAll();
                    graph.yearDimensionCloud.filterAll();
                }else {
                    graph.yearDimension0.filterFunction(commonFilterFunction);
                    graph.yearDimensionCloud.filterFunction(commonFilterFunction);
                }
            }
            if(chart.anchorName()=="chart-by-state"){
                if(!filters.length) {
                    graph.ufDimension0.filterAll();
                    graph.ufDimensionCloud.filterAll();
                }else {
                    graph.ufDimension0.filterFunction(commonFilterFunction);
                    graph.ufDimensionCloud.filterFunction(commonFilterFunction);
                }
            }
            if(chart.anchorName()=="chart-by-class"){
                if(!filters.length) {
                    graph.classDimension0.filterAll();
                }else {
                    var eqDef=true,eqDeg=true;
                    filters.forEach(
                        (f) => {
                            if(!graph.deforestation.includes(f)){
                                eqDef=false;
                            }
                            if(!graph.degradation.includes(f)){
                                eqDeg=false;
                            }
                        }
                    );
                    eqDef=(eqDef)?(filters.length==graph.deforestation.length):(false);
                    eqDeg=(eqDeg)?(filters.length==graph.degradation.length):(false);
                    if(eqDef && !eqDeg) {
                        utils.highlightClassFilterButtons('deforestation');
                    }else if(!eqDef && eqDeg) {
                        utils.highlightClassFilterButtons('degradation');
                    }else {
                        utils.highlightClassFilterButtons('custom');
                    }
                    graph.classDimension0.filterFunction(commonFilterFunction);
                }
            }
            dc.redrawAll("agrega");
            graph.displayCustomValues();
        });
    });

    utils.renderAll();
    // defining filter to deforestation classes by default
    graph.filterByClassGroup('deforestation');
    utils.attachListenersToLegend();
    // utils.setMonthNamesFilterBar();
}
