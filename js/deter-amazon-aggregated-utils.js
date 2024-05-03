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

export function displayWarning(enable) {
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
