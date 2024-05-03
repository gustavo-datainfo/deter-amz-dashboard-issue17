import {processCloudData, loadData, registerDataOnCrossfilter, processData} from "./deter-amazon-aggregated-data.js"
import { getFileDeliveryURL, getProject } from "./downloadSHP.js";

import { build } from "./build-chart.js"

var totalizedDeforestationArea = null
var totalizedDegradationArea   = null
var totalizedAlertsInfoBox     = null
var totalizedCustomArea        = null
var lineSeriesMonthly          = null
var ringTotalizedByState       = null
var rowTotalizedByClass        = null
var barAreaByYear              = null

var monthFilters  = null
var deforestation = null
var degradation   = null

var temporalDimension0 = null
var areaGroup0         = null
var classDimension0    = null
var yearDimension0     = null
var ufDimension0       = null
var monthDimension0    = null

var temporalDimensionCloud = null
var areaGroupCloud         = null
var areaUfGroupCloud       = null
var yearDimensionCloud     = null
var yearGroupCloud         = null
var ufDimensionCloud       = null
var monthDimensionCloud    = null

var monthDimension              = null
var numPolDimension             = null
var yearDimension               = null
var yearGroup                   = null
var ufDimension                 = null
var classDimension              = null
var ufGroup                     = null
var totalDeforestationAreaGroup = null
var totalDegradationAreaGroup   = null
var totalAlertsGroup            = null

var yearGroup0 = "teste"

var data      = null
var cloudData = null

var _cloudSubCharts         = null
var _deforestationSubCharts = null
var _deforestationStatus    = null
var _cloudStatus            = null

var ringPallet     = null
var defPallet      = null
var cldPallet      = null
var legendOriginal = null
var legendOverlay  = null

var defaultHeight = null

var calendarConfiguration = 'prodes'

window.onload = () => {
    // btnChangeCalendar()
    // if(typeof Authentication != undefined) {
    //     Authentication.init()
    // }

    Lang.init()

    init()
}

function init() 
{
    loadConfigurations(startLoadData);
}


function loadConfigurations(callback)
{
    d3.json("config/deter-amazon-aggregated.json", function(error, conf) {
        if (error) {
            console.log("Didn't load config file. Using default options.");
        }else{
            if(conf) {
                ringPallet     = conf.ringPallet?conf.ringPallet        : ringPallet
                defPallet      = conf.defPallet?conf.defPallet          : defPallet
                cldPallet      = conf.cldPallet?conf.cldPallet          : cldPallet
                defaultHeight  = conf.defaultHeight?conf.defaultHeight  : defaultHeight
                legendOriginal = conf.legendOriginal?conf.legendOriginal: undefined
                legendOverlay  = conf.legendOverlay?conf.legendOverlay  : undefined
            }
        }

        callback();
    });
}

function startLoadData()
{
    let cloudDataUrl  = getFileDeliveryURL()+"/download/"+getProject()+"/cloud";
    let deforestation = getFileDeliveryURL()+"/download/"+getProject()+"/monthly";

    loadData(cloudDataUrl)
        .then(async data => {
            let cloudData = processCloudData(data, calendarConfiguration)

            const deforData = await loadData(deforestation);
            let deforProcessed = processData(deforData, calendarConfiguration);

            let context = {
                "cloudData": cloudData,
                "deforData": deforProcessed,
                "calendarConfiguration": calendarConfiguration
            };
            
            return registerDataOnCrossfilter(context);
        })
        .then(registerDataContext => {
            registerDataContext.defaultHeight = defaultHeight

            return build(registerDataContext);
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
        })    
}
