document.addEventListener('DOMContentLoaded', function() {
    renderStatus('Waiting for TCL endpoint to reply...');
    getData(function(data, width, height) {
        var parsed = parseData(data);
        renderStatus(parsed, true);
    }, function(errorMessage) {
        renderStatus('Could not locate buses. ' + errorMessage);
    });
});

function renderStatus(statusText, resize) {
    var div = document.getElementById('status');
    div.innerHTML = statusText;
    if (resize) {
        div.style.width = '60px';
    }
}

function getData(callback, errorCallback) {
    var url = 'http://plan-interactif.tcl.fr/Proxy/ws.php';
    var stop = '46675'; // ID arrêt Plasson et Chaize
    var postData = new FormData();
    postData.append('ws', 'horaire');
    postData.append('id', stop);

    var x = new XMLHttpRequest();
    x.open('POST', url);
    x.onerror = function() { errorCallback('Network error.'); };
    x.onload = function(data) {
        var response = x.response;
        if (!response) {
            errorCallback('No response from TCL API');
            return;
        }
        response = JSON.parse(response);
        if (!response ||
            !response.DATA ||
            !response.DATA[stop] ||
            response.DATA[stop].length === 0) {
            errorCallback('Unexpected response from the TCL API');
        }
        callback(response.DATA[stop]);
    };
    x.send(postData);
}

function parseData(data) {
    var times = [];
    for(attr in data) {
        if (data.hasOwnProperty(attr)) {
            for (var i = 0; i < data[attr].length; i++) {
                times.push(parseInt(data[attr][i].passage1));
                times.push(parseInt(data[attr][i].passage2));
            }
        }
    }
    times = times.sort(sortNumber);
    var ready = '';
    for (var i = 0; i < times.length; i++) {
        ready = ready + times[i] + ' min<br/>';
    }
    return ready;
};

function sortNumber(a,b) {
    return a - b;
}
