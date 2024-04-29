export function buildCompositeChart(lineSeriesMonthly)
{
    context.lineSeriesMonthly = dc.compositeChart("#agreg", "agrega");
  
    let makeAreaGroup=(dim,k)=>{
      let g=dim.group()
      .reduceSum(
        (v) => {
          return (v.year==k)?(v.area):(0);
        }
      );
      // ordered by months
      g.all().sort((a,b)=>{
        return a.key-b.key;
      });
      return g;
    };
    let makePercentGroup=(dim,d)=>{
      let g=dim.group()
      .reduceSum(
        (v) => {
          return (v.year==d.key)?(v.a):(0);
        }
      );
      // ordered by months
      g.all().sort((a,b)=>{
        return a.key-b.key;
      });
      return g;
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
    };
  
    let makeChartBar=(mainChart,dim,group,groupName,colors,isCloud)=>{
      
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
    };
  
    let composeCharts=()=>{
      let charts=[];
      // reset arrays if this method will be called more than once to prevent reinsert the charts.
      context._cloudSubCharts=[];
      context._deforestationSubCharts=[];
  
      // prepare deforestation charts
      let	defColors = context.getOrdinalColorsToYears(graph.defPallet);
      context.yearGroup0.all().forEach(
        (d)=>{
          let colors=[]; defColors.some((c)=>{if(d.key==c.key) colors.push(c.color)});
          let deterGroupByYear = makeAreaGroup(context.monthDimension0,d.key);
          let l=makeChartBar(context.lineSeriesMonthly,context.monthDimension0,deterGroupByYear,d.key,colors,false);
          if(graph._deforestationStatus) charts.push(l);
          context._deforestationSubCharts.push(l);// used to control the composite chart groups
        });
  
      // prepare cloud charts
      let	cldColors = context.getOrdinalColorsToYears(graph.cldPallet);
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
  
    let legendItemWidth=80, legendWidth=context.yearGroup0.all().length*legendItemWidth;
    legendWidth=(legendWidth<utils.getSeriesChartWidth())?(+legendWidth.toFixed(0)):(utils.getSeriesChartWidth());
  
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
      .compose(composeCharts());
  
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
  
      lineSeriesRenderlet(context);
  }