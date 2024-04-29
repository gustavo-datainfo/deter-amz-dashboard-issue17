let config = {}

window.addEventListener('onResize', () => {
    clearTimeout(utils.config.resizeTimeout)
    utils.config.resizeTimeout = setTimeout(graph.doResize, 200)
})

function displayWaiting(enable) 
{
    if(enable===undefined) enable=true
    
    d3.select('#charts-panel').style('display',((enable)?('none'):('')))
    d3.select('#loading_data_info').style('display',((!enable)?('none'):('')))
    d3.select('#info_container').style('display',((!enable)?('none'):('')))
    d3.select('#panel_container').style('display',((enable)?('none'):('')))
    d3.select('#warning_data_info').style('display','none')
}
