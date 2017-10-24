var version = "7.7.0";

// INTERFACE
var cpAPI = null;

var timeout = null;
function updateLicenceInfo(){
    // Set Verion Number
    version = cpAPI.Version;
    _html('js-logo__version', version);

    _html('js-license__name', cpAPI.FullName);

    // Set Licence type
    switch (cpAPI.Edition) {
        case "free":
            _html('js-license__type', "EAGLE Free License for non-commercial use and evaluation purposes");
            break;
        case "education":
            _html('js-license__type', "EAGLE Education License for non-commercial educational use");
            break;
        case "standard":
            _html('js-license__type', "EAGLE Standard License for commercial use");
            break;
        case "premium":
            _html('js-license__type', "EAGLE Premium License for commercial use");
            //_html('js-license__upgrade', ""); // hide UPGRADE LICENSE button, as this is the top tier license
            break;
        default:
            _html('js-license__type', "EAGLE Free License for non-commercial use and evaluation purposes");
    }

    switch (cpAPI.Edition) {
        case "premium":
            _addClass('js-license__upgrade', 'hidden');
            break;
        default:
            _removeClass('js-license__upgrade', 'hidden');
    }

    var msg = "";
    if (cpAPI.Expired) {
        msg = "Local license expired. Please Sign in."
    } else {
        var days = cpAPI.DaysToExpire;

        if (days == 0)
            days = "tomorrow";
        else if (days == 1)
            days = "in 1 day";
        else
            days = "in " + days + " days";

        msg = "Local license expires " + days + ".";
    }

    if (cpAPI.Connection) {
        checkForUpdate();
        _addClass('js-license__info', 'hidden');

    }
    else {
        _html('js-license__info', msg);
        _removeClass('js-license__info', 'hidden');
    }
}

function compareRemoteAndLocalVersions(remoteString, localString){
    var remoteVersion = remoteString.split(".");
    var ourVersion = localString.split(".");
    for(var i=0; i<ourVersion.length; i++){
        var r = parseInt(remoteVersion[i]);
        var o = parseInt(ourVersion[i]);
        if(o > r){
            return false;
        }
        if(r > o){
            return true;
        }
    }

    return false;
}

function checkForUpdate(){
    try{
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://s3.amazonaws.com/eagle-updates/latest_eagle_version.json?_time=' + (new Date()).getTime());
        xhr.onload = function() {
            if (xhr.status === 200) {
                var parsedJSON = JSON.parse(xhr.responseText);
                // CHECK FOR UPDATE
                var update_available = compareRemoteAndLocalVersions(parsedJSON.version, version);

                if(update_available){
                    _removeClass('js-logo__update', 'hidden');
                    var updateTxt = "";
                    for(var i=0; i<parsedJSON.updates.length; i++){
                        updateTxt += '<li>'+parsedJSON.updates[i]+'</li>';
                    }
                    _html('js-logo__update__list', updateTxt);
                    _changeHref('js-logo__update__btn', parsedJSON.download);
                }
            }
        };
        xhr.send();
    }
    catch(e){
        // SILENT IGNORE
        console.log(e);
    }
}



// SET COPYRIGHT YEAR
_html('js-logo__copy__year', moment().format('YYYY'));

new QWebChannel(qt.webChannelTransport, function (channel) {
    cpAPI = channel.objects.controlPanelAPIInterface;
    updateLicenceInfo();
    window.onclick = function(e){
        console.log(e.target);
        console.log(e.target.className);
        if(e.target.localName == 'a'){
            if (e.target.className.includes('js-license__sync')) {
                cpAPI.SignIn();
            } else if (e.target.className.includes('js-license__signout')) {
                cpAPI.SignOut();
            } else if (e.target.className.includes('js-license__online')) {
                cpAPI.setOnline(!cpAPI.Online);
            } else
                cpAPI.openExternalWebPage(e.target.href);
            e.preventDefault();
            return false;
        }
    }
});

// DOM HELPER
function _html(klass, txt){
    var elements = document.getElementsByClassName(klass);
    if (elements && elements.length)
        elements[0].innerHTML = txt;
}
function _addClass(target, klass){
    var elements = document.getElementsByClassName(target);
    if (elements && elements.length)
        elements[0].classList.add(klass);
}
function _removeClass(target, klass){
    var elements = document.getElementsByClassName(target);
    if (elements && elements.length)
        elements[0].classList.remove(klass);

}
function _changeHref(target, link){
    var elements = document.getElementsByClassName(target);
    if (elements && elements.length)
        elements[0].setAttribute('href', link);
}
