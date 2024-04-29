import {processCloudData, loadData} from "./deter-amazon-aggregated-data.js"
import { getFileDeliveryURL, getProject } from "./downloadSHP.js";

let defPallet, ringPallet, cldPallet, 
    defaultHeight, legendOriginal, legendOverlay = null

window.onload = () => {
    // btnChangeCalendar()
    // if(typeof Authentication != undefined) {
    //     Authentication.init()
    // }

    init()
}

function init() 
{
    startLoadData();
}

function startLoadData()
{
	let cloudDataUrl = getFileDeliveryURL()+"/download/"+getProject()+"/cloud";

    loadData(cloudDataUrl)
        .then(data => {
            processCloudData(data)
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
        }
    );
}
