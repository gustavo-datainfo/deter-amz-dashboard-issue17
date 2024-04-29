let project = null
let homologation = ""
let serviceBaseUrl = "/file-delivery"

export function getFileDeliveryURL() 
{
    inferHomologationByURI()
    serviceBaseUrl = inferLocalhost()+"/" + homologation + "file-delivery"
    return serviceBaseUrl
}

export function inferProjectByURI() 
{
    var URL = document.location.href;

    if (URL.includes("amazon")) {
         return "deter-amz"
    } else if (URL.includes("cerrado")) {
        return "deter-cerrado-nb";
    }
}

export function getProject()
{
    return inferProjectByURI()
}

function inferHomologationByURI() 
{
    var URL = document.location.href;
    if (URL.includes("homologation")) {
        homologation = "homologation/"
    }
}

function inferLocalhost() 
{
    return ((isLocalhost())?(getTerraBrasilisHref()):(""))
}

function isLocalhost() 
{
    let orig = document.location.origin;
    return (orig.includes('localhost') || orig.includes('127'))
}

function getTerraBrasilisHref() 
{
    let baseurl = "terrabrasilis.dpi.inpe.br"
    return "https:"+"//"+baseurl
}
