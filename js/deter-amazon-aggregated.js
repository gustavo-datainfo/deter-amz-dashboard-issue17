import { processCloudData, loadData, registerDataOnCrossfilter, processData } from "./deter-amazon-aggregated-data.js"
import { getFileDeliveryURL, getProject } from "./downloadSHP.js"
import { build } from "./build-chart.js"

var ringPallet = null
var defPallet = null
var cldPallet = null
var defaultHeight = null
var calendarConfiguration = "prodes"

var deforestation = ["DESMATAMENTO_CR", "DESMATAMENTO_VEG", "MINERACAO"]
var degradation   = ["CICATRIZ_DE_QUEIMADA", "CORTE_SELETIVO", "CS_DESORDENADO", "CS_GEOMETRICO", "DEGRADACAO"]

window.onload = () => {
    Lang.init(), init();
}

function init() 
{
    Lang.apply()

    loadConfigurations()
        .then(config => {
            startLoadData(config)
        })
}

function loadConfigurations() 
{
    return new Promise((resolve, reject) => {
        d3.json("config/deter-amazon-aggregated.json", (error, data) => {
            if (error != null) {
                reject(error)
            } else {
                resolve({
                    "ringPallet"     : data.ringPallet ? data.ringPallet : ringPallet,
                    "defPallet"      : data.defPallet ? data.defPallet : defPallet,
                    "cldPallet"      : data.cldPallet ? data.cldPallet : cldPallet,
                    "defaultHeight"  : data.defaultHeight ? data.defaultHeight : defaultHeight,
                    "legendOriginal" : data.legendOriginal ? data.legendOriginal : void 0,
                    "legendOverlay"  : data.legendOverlay ? data.legendOverlay : void 0
                })
            }
        })
    })
}

function startLoadData(configurations) {
    let cloudDataUrl = getFileDeliveryURL() + "/download/" + getProject() + "/cloud"
    let deforDataUrl = getFileDeliveryURL() + "/download/" + getProject() + "/monthly"

    loadData(cloudDataUrl)
        .then(async (data) => {
            let cloudData = processCloudData(data, calendarConfiguration);
            const deforData = await loadData(deforDataUrl)
            let deforProcessed = processData(deforData, calendarConfiguration)
            
            let context = {
                "cloudData"            : cloudData,
                "deforData"            : deforProcessed,
                "deforestation"        : deforestation,
                "degradation"          : degradation,
                "calendarConfiguration": calendarConfiguration,
                "configurations"       : configurations
            }
            
            return registerDataOnCrossfilter(context)
        })
        .then((registerDataContext) => {
            registerDataContext.configurations = configurations
            registerDataContext.calendarConfiguration = calendarConfiguration
            registerDataContext.defaultHeight = defaultHeight

            build(registerDataContext)
        })
        .catch((error) => {
            console.error("Erro ao carregar os dados:", error)
        });
}

function resetFilter(who,group) 
{
    var g=(typeof group === 'undefined')?("filtra"):(group);
    if(who=='state'){
        graph.ringTotalizedByState.filterAll();
    }else if(who=='year'){
        graph.barAreaByYear.filterAll();
    }else if(who=='class'){
        graph.rowTotalizedByClass.filterAll();
        graph.filterByClassGroup('custom');
    }else if(who=='agreg'){
        graph.lineSeriesMonthly.filterAll();
        graph.monthDimension.filterAll();
        graph.monthDimension0.filterAll();
        graph.monthFilters=[];
        utils.highlightSelectedMonths();
        dc.redrawAll("filtra");
    }
    dc.redrawAll(g);
}
