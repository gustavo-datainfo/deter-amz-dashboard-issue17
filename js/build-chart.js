import { filterByClassGroup } from "./deter-amazon-aggregated-data.js";
import * as utils from "./deter-amazon-aggregated-utils.js";

let monthFilters = []

export function build(context) 
{
    let chartReferencies = setChartReferencies()
	let configurations = context.configurations
	context.chartReferencies = chartReferencies

	var htmlBox="<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>"
	
	chartReferencies.totalizedDeforestationArea.formatNumber(localeBR.numberFormat(',1f'))

	chartReferencies.totalizedDeforestationArea.valueAccessor(function(d) {
			return d.n ? d.tot.toFixed(2) : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>0 km²</div></span>"
		})
		.group(context.totalDeforestationAreaGroup)

	chartReferencies.totalizedDeforestationArea.valueAccessor(function(d) {
			return d.n ? d.tot.toFixed(2) : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].deforestation+"</span><br/><div class='numberinf'>0 km²</div></span>"
		})
		.group(context.totalDeforestationAreaGroup)

	chartReferencies.totalizedDegradationArea.formatNumber(localeBR.numberFormat(',1f'));
	chartReferencies.totalizedDegradationArea.valueAccessor(function(d) {
			return d.n ? d.tot.toFixed(2) : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>%number km²</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].degradation+"</span><br/><div class='numberinf'>0 km²</div></span>"
		})
		.group(context.totalDegradationAreaGroup);

	chartReferencies.totalizedAlertsInfoBox.formatNumber(localeBR.numberFormat(','));
	chartReferencies.totalizedAlertsInfoBox.valueAccessor(function(d) {
			return d.tot ? d.tot : 0;
		})
		.html({
			one:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			some:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>%number</div></span>",
			none:htmlBox+"<span>"+Translation[Lang.language].num_alerts+"</span><br/><div class='numberinf'>0</div></span>"
		})
		.group(context.totalAlertsGroup);
    
    buildCompositeChart(context, chartReferencies)

    chartReferencies.ringTotalizedByState
        .height(configurations.defaultHeight)
        .innerRadius(10)
        .externalRadiusPadding(30)
        .dimension(context.ufDimension)
        .group(context.ufGroup)
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
        .ordinalColors(configurations.ringPallet)
        .legend(dc.legend().x(20).y(10).itemHeight(13).gap(7).horizontal(0).legendWidth(50).itemWidth(35));

    chartReferencies.ringTotalizedByState.valueAccessor(function(d) {
        return Math.abs(+(d.value.toFixed(2)));
    });

    // start chart by classes
    chartReferencies.rowTotalizedByClass
        .height(configurations.defaultHeight)
        .dimension(context.classDimension)
        .group(utils.snapToZero(context.classGroup))
        .title(function(d) {
            var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
            v=localeBR.numberFormat(',1f')(v);
            var t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit;
            if(d.key==="CORTE_SELETIVO") {
                t=Translation[Lang.language].area+": " + v + " " + Translation[Lang.language].unit + " ("+
                ( (context.calendarConfiguration=='prodes')?(Translation[Lang.language].warning_class_prodes):(Translation[Lang.language].warning_class) )+")";
                
            }
            return t;
        })
        .label(function(d) {
            var v = Math.abs(+(parseFloat(d.value).toFixed(1)));
            
			v=localeBR.numberFormat(',1f')(v);

            var t=utils.mappingClassNames(context, d.key) + ": " + v + " " + Translation[Lang.language].unit;
            
			if(d.key==="CORTE_SELETIVO") {
                t=utils.mappingClassNames(context, d.key) + "*: " + v + " " + Translation[Lang.language].unit + " ("+
                ( (context.calendarConfiguration=='prodes')
					? (Translation[Lang.language].warning_class_prodes)
					: (Translation[Lang.language].warning_class) )+")";
            }
            return t;
        })
        .elasticX(true)
        .ordinalColors(["#FF0000","#FFFF00","#FF00FF","#F8B700","#78CC00","#00FFFF","#56B2EA","#0000FF","#00FF00"])
        .ordering(function(d) {
            return -d.value;
        })
        .controlsUseVisibility(true);

	chartReferencies.rowTotalizedByClass.xAxis().tickFormat(function(d) {
        var t=parseInt(d/1000);
        t=(t<1?parseInt(d):t+"k");
        return t;
    }).ticks(5);
    
    chartReferencies.rowTotalizedByClass
		.filterPrinter(function(f) {
			var l=[];
			f.forEach(function(cl){
				l.push(utils.mappingClassNames(context, cl));
			});
			return l.join(",");
    });

    let	barColors = getOrdinalColorsToYears(context, configurations.defPallet);

    chartReferencies.barAreaByYear
        .height(configurations.defaultHeight)
        .yAxisLabel(Translation[Lang.language].area+" ("+Translation[Lang.language].unit+")")
        .xAxisLabel( (context.calendarConfiguration=='prodes')?(Translation[Lang.language].barArea_x_label_prodes):(Translation[Lang.language].barArea_x_label) )
        .dimension(context.yearDimension)
        .group(utils.snapToZero(context.yearGroup))
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
        .margins({top: 20, right: 35, bottom: ( context.calendarConfiguration=='prodes'?75:60 ), left: 55});

        
    chartReferencies.barAreaByYear
        .on("renderlet.a",function (chart) {
            // rotate x-axis labels
            if(context.calendarConfiguration=='prodes')
                chart.selectAll('g.x text').attr('transform', 'translate(-25,18) rotate(315)');
            else
                chart.selectAll('g.x text').attr('transform', 'translate(-15,8) rotate(315)');
        });

    dc.chartRegistry.list("filtra").forEach((c,i) => {
        c.on('filtered', (chart, filter) => {
            // console.log(chart.filters())
			
			var filters = chart.filters()

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
                    context.yearDimension0.filterAll();
                    context.yearDimensionCloud.filterAll();
                }else {
                    context.yearDimension0.filterFunction(commonFilterFunction);
                    context.yearDimensionCloud.filterFunction(commonFilterFunction);
                }
            }
            if(chart.anchorName()=="chart-by-state"){
                if(!filters.length) {
                    context.ufDimension0.filterAll();
                    context.ufDimensionCloud.filterAll();
                }else {
                    context.ufDimension0.filterFunction(commonFilterFunction);
                    context.ufDimensionCloud.filterFunction(commonFilterFunction);
                }
            }
            if(chart.anchorName()=="chart-by-class"){
                if(!filters.length) {
                    context.classDimension0.filterAll();
                }else {
                    var eqDef=true,eqDeg=true;
                    filters.forEach(
                        (f) => {
                            if(!context.deforestation.includes(f)){
                                eqDef=false;
                            }
                            if(!context.degradation.includes(f)){
                                eqDeg=false;
                            }
                        }
                    );
                    eqDef=(eqDef)?(filters.length==context.deforestation.length):(false);
                    eqDeg=(eqDeg)?(filters.length==context.degradation.length):(false);
                    if(eqDef && !eqDeg) {
                        utils.highlightClassFilterButtons('deforestation');
                    }else if(!eqDef && eqDeg) {
                        utils.highlightClassFilterButtons('degradation');
                    }else {
                        utils.highlightClassFilterButtons('custom', chartReferencies);
                    }
                    context.classDimension0.filterFunction(commonFilterFunction);
                }
            }
            dc.redrawAll("agrega");

            chartReferencies.totalizedCustomArea.html(utils.displayCustomValues(chartReferencies))
        });
    });

    utils.renderAll();
    // defining filter to deforestation classes by default
    filterByClassGroup('deforestation', context, chartReferencies);
    utils.attachListenersToLegend();
    // utils.setMonthNamesFilterBar();
}

function buildCompositeChart(context, chartReferencies)
{
	let configurations = context.configurations

	context.lineSeriesMonthly = dc.compositeChart("#agreg", "agrega");

	let legendItemWidth=80, 
		legendWidth=context.yearGroup0.all().length*legendItemWidth
		legendWidth=(legendWidth<utils.getSeriesChartWidth())?(+legendWidth.toFixed(0)):(utils.getSeriesChartWidth());

	let fxDomain=d3.scale.linear().domain( (context.calendarConfiguration=='prodes')?([7,20]):([0,13]) );

	context.lineSeriesMonthly
		.height(configurations.defaultHeight)
		.x(fxDomain)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.brushOn(false)
		.yAxisLabel(Translation[Lang.language].mainbar_y_label)
		.rightYAxisLabel(Translation[Lang.language].clouds_y_label)
		.elasticY(true)
		.shareTitle(false)
		.yAxisPadding('10%')
		.clipPadding(10)
		.legend(dc.legend().x(100).y(10).itemHeight(13).gap(5).horizontal(1).legendWidth(legendWidth).itemWidth(legendItemWidth))
		.margins({top: 40, right: 65, bottom: 30, left: 65})
		//.childOptions ({ renderDataPoints: {fillOpacity: 0.8} })
		.compose(composeCharts(context));

	context.lineSeriesMonthly.xAxis().tickFormat(function(d) {
		return utils.xaxis(d, context.calendarConfiguration)
	});

	context.lineSeriesMonthly.on('renderlet.a', (c)=>{
			utils.moveBars(c, context)// split bars on bar charts

			utils.makeMonthsChooserList(context.calendarConfiguration)
			utils.highlightSelectedMonths(context, monthFilters)
		})
		.on('pretransition', (c) => {
			const svg = c.select('svg')
			// new class to define width of bars when split bars on bar charts
			svg.selectAll("rect.bar").attr("class", "bar bar1")
			
			let legItens={}

			c.selectAll('.dc-legend-item')[0].forEach((it)=>{
				let i=it.textContent.trim()
				if(!legItens[i]) legItens[i]=it.getAttribute('transform')
				else {
				let p1=legItens[i].split(",")
				let p2=it.getAttribute('transform').split(",")
				it.setAttribute("transform", p1[0]+","+p2[1])
				}
			})

		})
		.on("preRedraw", function (c) {
				c.rescale()
		})
		.on("preRender", function (c) {
			c.rescale()
		})

	context.lineSeriesMonthly.rightYAxis()
		.tickFormat(
		(a)=>{
			return a+"%"
		})

	context.lineSeriesMonthly.on('filtered', function(c) {
		if(c.filter()) {
			let fn=(d) => {return context.monthFilters.includes(d);};
			context.monthDimension.filterFunction(fn);
			context.monthDimension0.filterFunction(fn);
			context.monthDimensionCloud.filterFunction(fn);
			dc.redrawAll("filtra");

			chartReferencies.totalizedCustomArea.html(utils.displayCustomValues(chartReferencies))
		}
	})

	lineSeriesRenderlet(context, chartReferencies)
}

function setChartReferencies() 
{
    let totalizedDeforestationArea = dc.numberDisplay("#deforestation-classes", "agrega");
    let totalizedDegradationArea   = dc.numberDisplay("#degradation-classes", "agrega");
    let totalizedAlertsInfoBox     = dc.numberDisplay("#numpolygons", "agrega");
    let totalizedCustomArea        = d3.select("#custom-classes");

    let ringTotalizedByState = dc.pieChart("#chart-by-state", "filtra");
    let rowTotalizedByClass  = dc.rowChart("#chart-by-class", "filtra");
    let barAreaByYear        = dc.barChart("#chart-by-year", "filtra");

	return {
		"totalizedDeforestationArea": totalizedDeforestationArea,
		"totalizedDegradationArea": totalizedDegradationArea,
		"totalizedAlertsInfoBox": totalizedAlertsInfoBox,
		"totalizedCustomArea": totalizedCustomArea,
		"ringTotalizedByState": ringTotalizedByState,
		"rowTotalizedByClass": rowTotalizedByClass,
		"barAreaByYear": barAreaByYear
	}
}

function makeAreaGroup(dim,year) 
{
	let grouped = dim.group().reduceSum((value) => {
		return (value.year==year)?(value.area):(0);
	});

	// ordered by months
	grouped.all().sort((a,b)=>{
		return a.key-b.key;
	})

	return grouped;
}

function makePercentGroup(dim,d) 
{
	let grouped = dim.group().reduceSum((value) => {
			return (value.year==d.key)?(value.a):(0);
		}
	)

	// ordered by months
	grouped.all().sort((a,b)=>{
		return a.key-b.key;
	});
	return grouped;
}

function composeCharts(context)
{
	let charts=[];
	// reset arrays if this method will be called more than once to prevent reinsert the charts.
	context._cloudSubCharts = []
	context._deforestationSubCharts=[];

	let configurations = context.configurations

	// prepare deforestation charts
	let	defColors = getOrdinalColorsToYears(context, configurations.defPallet)

	context.yearGroup0.all().forEach(
		(d)=>{
			let colors=[]; defColors.some((c)=>{if(d.key==c.key) colors.push(c.color)})
			let deterGroupByYear = makeAreaGroup(context.monthDimension0,d.key)

			let l = makeChartBar(
				context.lineSeriesMonthly,
				context.monthDimension0, 
				deterGroupByYear, 
				d.key,colors, 
				false, 
				context.calendarConfiguration
			)

			if(context._deforestationStatus) charts.push(l);
			context._deforestationSubCharts.push(l);// used to control the composite chart groups
		});

	// prepare cloud charts
	let	cldColors = getOrdinalColorsToYears(context, configurations.cldPallet)

	context.yearGroupCloud.all().forEach(
		(d)=>{
			let colors=[]
			
			cldColors.some((c)=>{if(d.key==c.key) colors.push(c.color)})
			
			let cloudGroupByYear = makePercentGroup(context.monthDimensionCloud, d)

			let l = makeChartLine(
				context.lineSeriesMonthly,
				context.monthDimensionCloud,
				cloudGroupByYear,
				d.key,
				colors,
				true, 
				context.areaUfGroupCloud
			)
			if(context._cloudStatus) charts.push(l);
			context._cloudSubCharts.push(l);// used to control the composite chart groups
		});
	return charts;
};

function makeChartLine(mainChart, dim, group, groupName, colors, isCloud, areaUfGroupCloud, calendarConfiguration)
{			
	// do not remove this space! If removed, the Y-axis for cloud percentage will be rendered incorrectly.
	let gn = groupName+( (isCloud)?(" "):("") )

	let l=dc.lineChart(mainChart)
		.dimension(dim)
		.group(group,gn)
		.colorCalculator(()=>{return colors[0];})
		.renderDataPoints({radius: 5, fillOpacity: 0.8, strokeOpacity: 0.9})
		.title((v)=>{
			let v1=Math.abs(+(parseFloat(v.value*100/areaUfGroupCloud.top(1)[0].value).toFixed(2)));
			v1=localeBR.numberFormat(',1f')(v1);
			return utils.xaxis(v.key, calendarConfiguration) + " - " + gn
			+ "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
		})
		.keyAccessor(function(k) {
			return k.key;
		})
		.valueAccessor(function(dd) {
			if(!mainChart.hasFilter()) {
				return +((dd.value*100/context.areaUfGroupCloud.top(1)[0].value).toFixed(2));
			}else{
				if(monthFilters.indexOf(dd.key)>=0) {
					return +((dd.value*100/context.areaUfGroupCloud.top(1)[0].value).toFixed(2));
				}else{
					return 0;
				}
			}
		})
		.useRightYAxis(isCloud)

	// if(isCloud){
	//   // create a Dash Dot Dot Dot
	//   l.dashStyle([5,5,5,5]);
	// }
	return l;
}

function makeChartBar(mainChart, dim, group, groupName, colors, isCloud, calendarConfiguration)
{
			
	// do not remove this space! If removed, the Y-axis for cloud percentage will be rendered incorrectly.
	let gn = groupName+( (isCloud)?(" "):("") )
	let l = dc.barChart(mainChart)
		//.gap(100)
		//.centerBar(true)
		.dimension(dim)
		.group(group,gn)
		.colorCalculator(()=>{return colors[0];})
		.title((v)=>{
			let v1=Math.abs(+(parseFloat(v.value).toFixed(2)));
			v1=localeBR.numberFormat(',1f')(v1);
			return utils.xaxis(v.key, calendarConfiguration) + " - " + gn
			+ "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
		})
		.keyAccessor(function(k) {
			return k.key;
		})
		.valueAccessor(function(dd) {
			if(!mainChart.hasFilter()) {
				return +(dd.value.toFixed(2));
			}else{
				if(monthFilters.indexOf(dd.key)>=0) {
					return +(dd.value.toFixed(2));
				}else{
					return 0;
				}
			}
		})
	return l;
}

function lineSeriesRenderlet(context, chartReferencies)
{
	context.lineSeriesMonthly.on('renderlet', function(c) {
	  utils.attachListenersToLegend()

	  chartReferencies.totalizedCustomArea.html(utils.displayCustomValues(chartReferencies))
	  dc.redrawAll("filtra");
  
	  var years=[];
	  if(chartReferencies.barAreaByYear.hasFilter()){
		years=chartReferencies.barAreaByYear.filters();
	  }else{
		chartReferencies.barAreaByYear.group().all().forEach((d)=> {years.push(d.key);});
	  }
  
	  if(!c.hasFilter()){
		$('#txt18').css('display','none');// hide filter reset buttom
		$('#txt8b').html(Translation[Lang.language].allTime);
		$('#highlight-time').html("&nbsp;" +  years.join(", ") );
	  }else{
		// the logic to list filtered month on filterPrinter
		if(context.monthDimension0){
		  // sort months before to make the filter label
		  monthFilters=monthFilters.sort(function(a,b){return a-b;});
		  var fp="", allData=context.monthDimension0.group().all();
		  monthFilters.forEach(
			(monthNumber) => {
			  var ys=[];
			  allData.some(
				(d)=> {
				  years.forEach(
					(year) => {
					  if(d.key==monthNumber) {
						if(!ys.includes(year)) ys.push(year);
						return true;
					  }
					}
				  );
				}
			  );
			  if(ys.length) fp+=(fp==''?'':', ')+utils.monthYearList(monthNumber,utils.nameMonthsById(monthNumber),ys);
			}
		  );
		  $('#txt18').css('display','');// display filter reset buttom
		  $('#txt8b').html(Translation[Lang.language].someMonths);
		  $('#highlight-time').html("&nbsp;" +  fp );
		}
	  }
	});
}

function getYears(context) 
{
	return context.yearDimension.group().all();
}

function getRangeYears(context) 
{
	var ys=getYears(context), l=ys.length;
	var y=[];
	for(var i=0;i<l;i++) {
		y.push(ys[i].key);
	}
	return y;
}

function getOrdinalColorsToYears(context, colorList)
{
	var c=[];
	var ys = getRangeYears(context);
	//var cor=d3.scale.category20();
	for(var i=0;i<ys.length;i++) {
		c.push({key:ys[i],color:colorList[i]});//cor(i)});
	}
	return c;
}
