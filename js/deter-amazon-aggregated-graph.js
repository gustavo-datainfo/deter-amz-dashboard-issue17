import  * as utils from './deter-amazon-aggregated-utils'

init() 
{
    window.onresize=utils.onResize;
    
    utils.displayWaiting();
    utils.displayLoginExpiredMessage();
    this.loadConfigurations(this.startLoadData);
}
