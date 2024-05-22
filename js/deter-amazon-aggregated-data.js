import { 
        displayGraphContainer, 
        displayWaiting, 
        displayWarning, 
        fakeMonths, highlightClassFilterButtons } from "./deter-amazon-aggregated-utils.js";

export function loadData(url) {
    return new Promise((resolve, reject) => {
        d3.json(url, (error, data) => {
        if (error != null) {
            reject(error)
        } else {
            resolve(data)
        }
        });
    });
}


export function processCloudData(data, calendarConfiguration) 
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

    return objectData
}

export function processData(data, calendarConfiguration)
{
    if(!data || !data.totalFeatures || data.totalFeatures<=0) {
        displayWarning(true);
        return;
    }

    setUpdatedDate(data.updated_date);
    displayGraphContainer();
    
    var objectData=[];
    var numberFormat = d3.format('.2f');
    
    for (var j = 0, n = data.totalFeatures; j < n; ++j) {
        var fet=data.features[j];
        var month=+fet.properties.m;
        var year=+fet.properties.y;
        if(calendarConfiguration=='prodes') {
            if(month >=1 && month<=7) {
                year = "20"+(year-1)+"/20"+year;
            }
            if(month >=8 && month<=12) {
                year = "20"+year+"/20"+(year+1);
            }
        }else{
            year = "20"+year;
        }
        objectData.push({year:year,month:month,area:+(numberFormat(fet.properties.ar)),uf:fet.properties.uf,className:fet.properties.cl,numPol:fet.properties.np});
    }

    displayWaiting(false);
    return objectData
}

export function registerDataOnCrossfilter(context)
{
    var ndx0  = crossfilter(context.deforData)
    var ndx1  = crossfilter(context.deforData)
    var cloud = crossfilter(context.cloudData)

    /** register cloud data */
    let temporalDimensionCloud = cloud.dimension((d) => {
        var m= fakeMonths(d.month, context.calendarConfiguration);
        return [d.year, m];
    })
    
    let areaUfGroupCloud = temporalDimensionCloud.group().reduceSum((d) => +d.au)

    let areaGroupCloud = temporalDimensionCloud.group().reduceSum((d) => +d.a)

    let yearDimensionCloud = cloud.dimension((d) => d.year)

    let yearGroupCloud = yearDimensionCloud.group().reduceSum((d) => d.au)
    
    let ufDimensionCloud = cloud.dimension((d) => d.uf)
    
    let monthDimensionCloud = cloud.dimension((d) => {
        var m=fakeMonths(d.month, context.calendarConfiguration)
        return m
    })
    /** end register cloud data */
    
    let monthDimension = ndx1.dimension((d) => {
        var m = fakeMonths(d.month)
        return m
    });

    let temporalDimension0 = ndx0.dimension((d) => {
        var m = fakeMonths(d.month)
        return [d.year, m]
    });

    let areaGroup0 = temporalDimension0.group().reduceSum((d) => d.area)
    
    let yearDimension0 = ndx0.dimension((d) => d.year)
    
    let yearGroup0 = yearDimension0.group().reduceSum((d) => d.area)
    
    let ufDimension0 = ndx0.dimension((d) => d.uf)
    
    let classDimension0 = ndx0.dimension((d) => {d.className})
    
    let monthDimension0 = ndx0.dimension((d) => {
        var m = fakeMonths(d.month)
        return m
    });

    let numPolDimension = ndx1.dimension((d) => d.numPol)
    
    let yearDimension = ndx1.dimension((d) => d.year)
    
    let yearGroup = yearDimension.group().reduceSum((d) => d.area)

    let ufDimension = ndx1.dimension((d) => d.uf)

    let ufGroup = ufDimension.group().reduceSum((d) => d.area)
    
    let classDimension = ndx1.dimension((d) => d.className)
    
    let classGroup = classDimension.group().reduceSum((d) => d.area)

    let totalDeforestationAreaGroup = classDimension0.groupAll().reduce(
        (p, v) => {
            if(context.deforestation.includes(v.className)) {
                ++p.n;
                p.tot += v.area;
            }
            return p;
        },
        (p, v) => {
            if(context.deforestation.includes(v.className)) {
                --p.n;
                p.tot -= v.area;
            }
            return p;
        },
        () => {
            return {n:0,tot:0};
        }
    )

    let totalDegradationAreaGroup = classDimension0.groupAll().reduce(
        (p, v) => {
            if(context.degradation.includes(v.className)) {
                ++p.n
                p.tot += v.area
            }
            return p
        },
        
        (p, v) => {
            if(context.degradation.includes(v.className)) {
                --p.n
                p.tot -= v.area
            }
            return p
        },
        () => { return {n:0,tot:0}; }
    )

    let totalAlertsGroup = numPolDimension.groupAll().reduce(
        (p, v) => {
            p.tot += v.numPol
            return p
        },
        (p, v) => {
            p.tot -= v.numPol
            return p;
        },
        () => { return {tot:0} }
    );


    return {
        "temporalDimensionCloud"     : temporalDimensionCloud,
        "areaUfGroupCloud"           : areaUfGroupCloud,
        "areaGroupCloud"             : areaGroupCloud,
        "yearDimensionCloud"         : yearDimensionCloud,
        "yearGroupCloud"             : yearGroupCloud,
        "ufDimensionCloud"           : ufDimensionCloud,
        "monthDimensionCloud"        : monthDimensionCloud,
        "monthDimension"             : monthDimension,
        "temporalDimension0"         : temporalDimension0,
        "areaGroup0"                 : areaGroup0,
        "yearDimension0"             : yearDimension0,
        "yearGroup0"                 : yearGroup0,
        "ufDimension0"               : ufDimension0,
        "classDimension0"            : classDimension0,
        "monthDimension0"            : monthDimension0,
        "numPolDimension"            : numPolDimension,
        "yearDimension"              : yearDimension,
        "yearGroup"                  : yearGroup,
        "ufDimension"                : ufDimension,
        "ufGroup"                    : ufGroup,
        "classDimension"             : classDimension,
        "classGroup"                 : classGroup,
        "totalDeforestationAreaGroup": totalDeforestationAreaGroup,
        "totalDegradationAreaGroup"  : totalDegradationAreaGroup,
        "totalAlertsGroup"           : totalAlertsGroup,
        "deforestation"              : context.deforestation,
        "degradation"                : context.degradation
    }
}

function setUpdatedDate(updated_date)
{
    var dt=new Date(updated_date+'T21:00:00.000Z')
    d3.select("#updated_date").html(' '+dt.toLocaleDateString())
}

export function filterByClassGroup(ref, context, chartReferencies) 
{
    highlightClassFilterButtons(ref, chartReferencies);


    chartReferencies.rowTotalizedByClass.filterAll();

    if(ref=='deforestation') {

        context.deforestation.forEach(
            (cl) => {
                chartReferencies.rowTotalizedByClass.filter(cl);
            }
        );
    }else if(ref=='degradation') {
        context.degradation.forEach(
            (cl) => {
                chartReferencies.rowTotalizedByClass.filter(cl);
            }
        );
    }
    dc.redrawAll("filtra");
}
