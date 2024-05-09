window.addEventListener('onResize', () => {
    clearTimeout(utils.config.resizeTimeout)
    utils.config.resizeTimeout = setTimeout(graph.doResize, 200)
})

export function getSeriesChartWidth() 
{
    return document.querySelector("#agreg").clientWidth
}

export function fakeMonths(d, calendarConfiguration) 
{
    var list=[],m=1;
    if(calendarConfiguration=='prodes') {
        list=[13,14,15,16,17,18,19,8,9,10,11,12];
        m=list[d-1];
    }else{
        m=d;
    }
    return m;
}

export function displayWarning(enable) 
{
    if(enable===undefined) enable=true;
    d3.select('#warning_data_info').style('display',((enable)?(''):('none')));
    d3.select('#loading_data_info').style('display',((enable)?('none'):('')));
    d3.select('#info_container').style('display',((enable)?(''):('none')));
    document.getElementById("warning_data_info").innerHTML='<h3><span id="txt8">'+Translation[Lang.language].txt8+'</span></h3>';
}

export function displayWaiting(enable) 
{
    if(enable===undefined) enable=true
    
    d3.select('#charts-panel').style('display',((enable)?('none'):('')))
    d3.select('#loading_data_info').style('display',((!enable)?('none'):('')))
    d3.select('#info_container').style('display',((!enable)?('none'):('')))
    d3.select('#panel_container').style('display',((enable)?('none'):('')))
    d3.select('#warning_data_info').style('display','none')
}

export function displayGraphContainer() 
{
    d3.select('#panel_container').style('display','block');
}

export function snapToZero(sourceGroup) 
{
    return {
        all:function () {
            return sourceGroup.all().map(function(d) {
                return {key:d.key,value:( (Math.abs(d.value)<1e-6) ? 0 : d.value )};
            });
        }
    };
}

export function mappingClassNames(context, cl)
{
    let configurations = context.configurations

    if(configurations.legendOriginal===undefined) {
        return cl;
    }
    var l = configurations.legendOriginal.length;
    for (var i = 0; i < l; i++) {
        if(configurations.legendOriginal[i]===cl) {
            cl=configurations.legendOverlay[Lang.language][i];
            break;
        }
    }
    return cl;
}

export function highlightClassFilterButtons(ref, chartReferencies)
{
    document.getElementById(ref+"-bt").removeAttribute("class")
    document.getElementById(ref+"-bt").classList.add("disable")
    
    if(ref=='deforestation') {
        document.getElementById("degradation-classes").classList.add("disable")
        document.getElementById("custom-classes").classList.add("disable")

        document.getElementById("degradation-bt").removeAttribute("class")
        document.getElementById("custom-bt").removeAttribute("class")
    }else if(ref=='degradation') {
        document.getElementById("deforestation-classes").classList.add("disable")
        document.getElementById("custom-classes").classList.add("disable")
        
        document.getElementById("deforestation-bt").removeAttribute("class")
        document.getElementById("custom-bt").removeAttribute("class")
    }else if(ref=='custom') {
        displayCustomValues(chartReferencies)

        document.getElementById("degradation-classes").classList.add("disable")
        document.getElementById("deforestation-classes").classList.add("disable")

        document.getElementById("degradation-bt").removeAttribute("class")
        document.getElementById("deforestation-bt").removeAttribute("class")
    }
}

export function renderAll() 
{
    /**
     * This method keeping data points at the vertices of the lines on render calls.
     */
    dc.renderAll("agrega");
    // dc.renderAll("filtra");
    // d3.selectAll("circle")
    //     .attr("r",function(){return 5;})
    //     .on("mouseout.foo", function(){
    //         d3.select(this)
    //         .attr("r", function(){return 5;});
    //     });
}

export function displayCustomValues(chartReferencies)
{
    var area = 0
    var htmlBox = "<div class='icon-left'><i class='fa fa-leaf fa-2x' aria-hidden='true'></i></div><span class='number-display'>";
    var data = chartReferencies.rowTotalizedByClass.data();
    var filters = chartReferencies.rowTotalizedByClass.filters();

    data.forEach(
        (d) => {
            if(!filters.length) {
                area+=d.value;
            }else if(filters.includes(d.key)){
                area+=d.value;
            }
        }
    );

    area = localeBR.numberFormat(',1f')(area.toFixed(2));
    chartReferencies.totalizedCustomArea.html(htmlBox+"<span>"+Translation[Lang.language].degrad_defor+"</span><div class='numberinf'>"+area+" km²</div></span>");
}

export function xaxis(d, calendarConfiguration) 
{
    var list=[];
    if(calendarConfiguration=='prodes') {
        list=Translation[Lang.language].months_of_prodes_year;
        return list[d-8];
    }else{
        list=Translation[Lang.language].months_of_civil_year;
        return list[d-1];
    }
}

export function moveBars(chart, context)
{
    let offsetBars = 18;
    let years      = context.yearGroup0.all()
    let mr         = context.lineSeriesMonthly.margins().right
    let ml         = context.lineSeriesMonthly.margins().left
    let wl         = (context.lineSeriesMonthly.width()-mr-ml)/offsetBars
    
    let l          = years.length, l2 = parseInt(wl/l), start=parseInt(wl-(wl/2) )*-1

    chart.selectAll("g.sub").selectAll("rect.bar").forEach(
        (sub,i)=>{
            if(sub.length){
                chart.selectAll("g.sub._"+i).attr("transform", "translate("+start+", 0)")
                start=start+l2;
            }
        }
    )
}

export function makeMonthsChooserList(calendarConfiguration)
{
    let magicNumber = 14                                                   // this number is the number of ticks used in series chart. It's equal to 12 or 14. See the chart to define.
    let width       = parseInt(getSeriesChartWidth()/magicNumber)
    let template    = '', extra = '<div style="width:'+width+'px"></div>'
    let iMin        = (calendarConfiguration=='prodes')?(8):(1)
    let iMax        = (calendarConfiguration=='prodes')?(20):(13)

    for (var i=iMin; i<iMax; i++) {
        template+='<div style="width:'+width+'px;" id="month_'+i+'" class="month_box" onclick="graph.applyMonthFilter('+i+')"></div>';
    }
    template = extra+template+extra
    document.querySelector('#months_chooser').innerHTML = template
    setMonthNamesFilterBar(calendarConfiguration)
}

export function highlightSelectedMonths(context, monthFilters)
{
    let iMin = (context.calendarConfiguration == 'prodes') ? (8) : (1)
    let iMax = (context.calendarConfiguration == 'prodes') ? (20) : (13)

    for (var i=iMin;i<iMax;i++) {
        if(monthFilters.includes(i) || !monthFilters.length) {
            d3.select('#month_'+i).style('opacity', '1')
        }else {
            d3.select('#month_'+i).style('opacity', '0.4')
        }
    }
}

export function attachListenersToLegend()
{
    var legendItems = document.querySelectorAll("#agreg .dc-legend-item")

    console.log(legendItems)

    // for(var i=0;i<legendItems.length;i++) {
    //     document.querySelector

    //     $(legendItems[i]).on('click', function (ev) {
    //         graph.barAreaByYear.filter(ev.currentTarget.textContent.split(" ")[0]);
    //     });
    // }
}

function setMonthNamesFilterBar(calendarConfiguration)
{
    let iMin=(calendarConfiguration=='prodes')?(8):(1);
    let iMax=(calendarConfiguration=='prodes')?(20):(13);
    for (var i=iMin;i<iMax;i++) {
        d3.select('#month_'+i).html((calendarConfiguration=='prodes')?(Translation[Lang.language].months_of_prodes_year[i-8]):(Translation[Lang.language].months_of_civil_year[i-1]));
    }
}
