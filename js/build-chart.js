import { getSeriesChartWidth } from "./deter-amazon-aggregated-utils.js";

export function build(context) 
{
    let chartReferencies = setChartReferencies()
    
    buildCompositeChart(context)
	buildSeriesChart()

    chartReferencies.ringTotalizedByState
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

    chartReferencies.ringTotalizedByState.valueAccessor(function(d) {
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

function buildCompositeChart(context)
{
	context.lineSeriesMonthly = dc.compositeChart("#agreg", "agrega");

	let legendItemWidth=80, 
		legendWidth=context.yearGroup0.all().length*legendItemWidth
		legendWidth=(legendWidth<getSeriesChartWidth())?(+legendWidth.toFixed(0)):(getSeriesChartWidth());

	let fxDomain=d3.scale.linear().domain( (context.calendarConfiguration=='prodes')?([7,20]):([0,13]) );

	context.lineSeriesMonthly
		.height(context.defaultHeight)
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
			return utils.xaxis(d);
		});

		context.lineSeriesMonthly.on('renderlet.a', (c)=>{
			utils.moveBars(c);// split bars on bar charts
			utils.makeMonthsChooserList();
			utils.highlightSelectedMonths();
		}).on('pretransition', (c) => {
			const svg = c.select('svg');
			// new class to define width of bars when split bars on bar charts
			svg.selectAll("rect.bar").attr("class", "bar bar1");
			
			let legItens={};
			c.selectAll('.dc-legend-item')[0].forEach((it)=>{
				let i=it.textContent.trim();
				if(!legItens[i]) legItens[i]=it.getAttribute('transform');
				else {
				let p1=legItens[i].split(",");
				let p2=it.getAttribute('transform').split(",");
				it.setAttribute("transform", p1[0]+","+p2[1]);
				}
			});

			}).on("preRedraw", function (c) {
				c.rescale();
			}).on("preRender", function (c) {
				c.rescale();
			});

		context.lineSeriesMonthly.rightYAxis()
			.tickFormat(
			(a)=>{
				return a+"%";
			}
		);

		context.lineSeriesMonthly.on('filtered', function(c) {
			if(c.filter()) {
				let fn=(d) => {return graph.monthFilters.includes(d);};
				graph.monthDimension.filterFunction(fn);
				graph.monthDimension0.filterFunction(fn);
				graph.monthDimensionCloud.filterFunction(fn);
				dc.redrawAll("filtra");
				graph.displayCustomValues();
			}
		});
}

/**
 * The series chart with only alerts by months
 * 
 */
function buildSeriesChart(context)
{
	context.lineSeriesMonthly = dc.seriesChart("#agreg", "agrega");

	let fcDomain=d3.scale.linear().domain( (graph.calendarConfiguration=='prodes')?([8,19]):([1,12]) );

	context.lineSeriesMonthly
    	.height(context.defaultHeight-70)
    	.chart(function(c) { return dc.lineChart(c).renderDataPoints(true).evadeDomainFilter(true); })
    	.x(fcDomain)
    	.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
    	.brushOn(false)
    	.yAxisLabel(Translation[Lang.language].mainbar_y_label)
    	.elasticY(true)
    	.yAxisPadding('10%')
    	.clipPadding(10)
    	.dimension(context.temporalDimension0)
    	.group(context.areaGroup0)
    	.title(function(d) {
    	  var v=Math.abs(+(parseFloat(d.value).toFixed(2)));
    	  v=localeBR.numberFormat(',1f')(v);
    	  return utils.xaxis(d.key[1]) + " - " + d.key[0]
    	  + "\n"+Translation[Lang.language].area+" " + v + " "+Translation[Lang.language].unit;
    	})
    	.seriesAccessor(function(d) {
     		return d.key[0];
   		 })
		.keyAccessor(function(d) {
      		return d.key[1];
   		})
    	.valueAccessor(function(d) {
      		if(!graph.lineSeriesMonthly.hasFilter()) {
        		return Math.abs(+(d.value.toFixed(2)));
      		}else{
        		if(graph.monthFilters.indexOf(d.key[1])>=0) {
          			return Math.abs(+(d.value.toFixed(2)));
        		}else{
          			return 0;
        		}
			}
		})
    	.legend(dc.legend().x(100).y(30).itemHeight(15).gap(5).horizontal(1).legendWidth(600).itemWidth(80))
    	.margins({top: 20, right: 35, bottom: 30, left: 65});

  	context.lineSeriesMonthly.yAxis().tickFormat(function(d) {
    	//return d3.format(',d')(d);
    	return localeBR.numberFormat(',1f')(d);
  	});
  	context.lineSeriesMonthly.xAxis().tickFormat(function(d) {
    	return utils.xaxis(d);
  	});

  	context.lineSeriesMonthly.on('filtered', function(c) {
    	if(c.filter()) {
      		graph.monthDimension.filterFunction(
        		(d) => {
          			return graph.monthFilters.includes(d);
        		}
      		);
      		graph.temporalDimension0.filterFunction(
        		(d) => {
          			return graph.monthFilters.includes(d[1]);
        		}
      		);
      		dc.redrawAll("filtra");
		}
  	});

  	lineSeriesRenderlet(context);

	let	barColors = getOrdinalColorsToYears(context, graph.defPallet);
	context.lineSeriesMonthly.colorAccessor(function(d) {
		var i=0,l=barColors.length;
		while(i<l){
		if(barColors[i].key==d.key){
			return barColors[i].color;
		}
		i++;
		}
	});
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
	g.all().sort((a,b)=>{
		return a.key-b.key;
	});
	return g;
}

function composeCharts(context)
{
	let charts=[];
	// reset arrays if this method will be called more than once to prevent reinsert the charts.
	context._cloudSubCharts = []
	context._deforestationSubCharts=[];

	// prepare deforestation charts
	let	defColors = getOrdinalColorsToYears(context, context.defPallet)

	context.yearGroup0.all().forEach(
		(d)=>{
			let colors=[]; defColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
			let deterGroupByYear = makeAreaGroup(context.monthDimension0,d.key);
			let l=makeChartBar(context.lineSeriesMonthly,context.monthDimension0,deterGroupByYear,d.key,colors,false);
			if(graph._deforestationStatus) charts.push(l);
			context._deforestationSubCharts.push(l);// used to control the composite chart groups
		});

	// prepare cloud charts
	let	cldColors = getOrdinalColorsToYears(context, context.cldPallet)

	context.yearGroupCloud.all().forEach(
		(d)=>{
			let colors=[]; cldColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
			let cloudGroupByYear = makePercentGroup(context.monthDimensionCloud,d);
			let l=makeChartLine(context.lineSeriesMonthly,context.monthDimensionCloud,cloudGroupByYear,d.key,colors,true);
			if(graph._cloudStatus) charts.push(l);
			context._cloudSubCharts.push(l);// used to control the composite chart groups
		});
	return charts;
};

let makeChartLine=(mainChart,dim,group,groupName,colors,isCloud)=>{
			
	// do not remove this space! If removed, the Y-axis for cloud percentage will be rendered incorrectly.
	let gn=groupName+( (isCloud)?(" "):("") );
	let l=dc.lineChart(mainChart)
	.dimension(dim)
	.group(group,gn)
	.colorCalculator(()=>{return colors[0];})
	.renderDataPoints({radius: 5, fillOpacity: 0.8, strokeOpacity: 0.9})
	.title((v)=>{
		let v1=Math.abs(+(parseFloat(v.value*100/graph.areaUfGroupCloud.top(1)[0].value).toFixed(2)));
		v1=localeBR.numberFormat(',1f')(v1);
		return utils.xaxis(v.key) + " - " + gn
		+ "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
	})
	.keyAccessor(function(k) {
		return k.key;
	})
	.valueAccessor(function(dd) {
		if(!mainChart.hasFilter()) {
			return +((dd.value*100/graph.areaUfGroupCloud.top(1)[0].value).toFixed(2));
		}else{
			if(graph.monthFilters.indexOf(dd.key)>=0) {
				return +((dd.value*100/graph.areaUfGroupCloud.top(1)[0].value).toFixed(2));
			}else{
				return 0;
			}
		}
	})
	.useRightYAxis(isCloud);

	// if(isCloud){
	//   // create a Dash Dot Dot Dot
	//   l.dashStyle([5,5,5,5]);
	// }
	return l;
}

function makeChartBar(mainChart,dim,group,groupName,colors,isCloud)
{
			
	// do not remove this space! If removed, the Y-axis for cloud percentage will be rendered incorrectly.
	let gn=groupName+( (isCloud)?(" "):("") );
	let l=dc.barChart(mainChart)
	//.gap(100)
	//.centerBar(true)
	.dimension(dim)
	.group(group,gn)
	.colorCalculator(()=>{return colors[0];})
	.title((v)=>{
		let v1=Math.abs(+(parseFloat(v.value).toFixed(2)));
		v1=localeBR.numberFormat(',1f')(v1);
		return utils.xaxis(v.key) + " - " + gn
		+ "\n" + ((isCloud)?(Translation[Lang.language].percentage+" "+v1+"%"):(Translation[Lang.language].area+" "+v1+Translation[Lang.language].unit));
	})
	.keyAccessor(function(k) {
		return k.key;
	})
	.valueAccessor(function(dd) {
		if(!mainChart.hasFilter()) {
			return +(dd.value.toFixed(2));
		}else{
			if(graph.monthFilters.indexOf(dd.key)>=0) {
				return +(dd.value.toFixed(2));
			}else{
				return 0;
			}
		}
	});
	return l;
}

function lineSeriesRenderlet(context)
{
	context.lineSeriesMonthly.on('renderlet', function(c) {
	  utils.attachListenersToLegend();
	  graph.displayCustomValues();
	  dc.redrawAll("filtra");
  
	  var years=[];
	  if(graph.barAreaByYear.hasFilter()){
		years=graph.barAreaByYear.filters();
	  }else{
		graph.barAreaByYear.group().all().forEach((d)=> {years.push(d.key);});
	  }
  
	  if(!c.hasFilter()){
		$('#txt18').css('display','none');// hide filter reset buttom
		$('#txt8b').html(Translation[Lang.language].allTime);
		$('#highlight-time').html("&nbsp;" +  years.join(", ") );
	  }else{
		// the logic to list filtered month on filterPrinter
		if(graph.monthDimension0){
		  // sort months before to make the filter label
		  graph.monthFilters=graph.monthFilters.sort(function(a,b){return a-b;});
		  var fp="", allData=graph.monthDimension0.group().all();
		  graph.monthFilters.forEach(
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
