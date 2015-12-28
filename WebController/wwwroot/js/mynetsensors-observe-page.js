﻿/*  MyNetSensors 
    Copyright (C) 2015 Derwish <derwish.pro@gmail.com>
    License: http://www.gnu.org/licenses/gpl-3.0.txt  
*/



var gatewayHardwareConnected = null;
var signalRServerConnected = null;

var elementsFadeTime = 300;

var lastSeens;

$(function () {

    //configure signalr
    var clientsHub = $.connection.clientsHub;

    clientsHub.client.OnConnectedEvent = function () {
        hardwareStateChanged(true);
    };

    clientsHub.client.OnDisconnectedEvent = function () {
        hardwareStateChanged(false);
    };



    clientsHub.client.OnNewNodeEvent = function (node) {
        createOrUpdateNode(node);
    };

    clientsHub.client.OnNodeUpdatedEvent = function (node) {
        createOrUpdateNode(node);
    };

    clientsHub.client.OnNodeLastSeenUpdatedEvent = function (node) {
        lastSeens[node.nodeId] = node.lastSeen;
        updateLastSeen(node.nodeId, node.lastSeen);
    };

    clientsHub.client.OnNodeBatteryUpdatedEvent = function (node) {
        updateBattery(node);
    };

    clientsHub.client.OnSensorUpdatedEvent = function (sensor) {
        createOrUpdateSensor(sensor);
    };

    clientsHub.client.OnNewSensorEvent = function (sensor) {
        createOrUpdateSensor(sensor);
    };

    $.connection.hub.start();

    $.connection.hub.stateChanged(function (change) {
        if (change.newState === $.signalR.connectionState.reconnecting) {
            noty({ text: 'Web server is not responding!', type: 'error', timeout: false });
            signalRServerConnected = false;
        }
        else if (change.newState === $.signalR.connectionState.connected) {
            if (signalRServerConnected == false) {
                noty({ text: 'Connected to web server.', type: 'alert', timeout: false });
                getIsHardwareConnected();
                getNodes();
            }
            signalRServerConnected = true;
        }
    });

    setInterval(updateAllLastSeens, 1000);

    getIsHardwareConnected();
    getNodes();
});

function getIsHardwareConnected() {
    $.ajax({
        url: "/GatewayAPI/IsHardwareConnected/",
        type: "POST",
        success: function (connected) {
            hardwareStateChanged(connected);
        }
    });
}



function hardwareStateChanged(connected) {
    if (connected) {
        $('#nodesContainer').fadeIn(elementsFadeTime);
    } else {
        $('#nodesContainer').fadeOut(elementsFadeTime);
    }

    if (connected && gatewayHardwareConnected === false) {
        noty({ text: 'Gateway hardware is online.', type: 'alert', timeout: false });
    } else if (!connected) {
        noty({ text: 'Gateway hardware is offline!', type: 'error', timeout: false });
    }

    gatewayHardwareConnected = connected;
}



function getNodes() {
    $.ajax({
        url: "/GatewayAPI/GetNodes/",
        type: "POST",
        success: function (nodes) {
            onReturnNodes(nodes);
        }
    });
}



function onReturnNodes(nodes) {
    $('#nodesContainer').html(null);

    for (var i = 0; i < nodes.length; i++) {
        createOrUpdateNode(nodes[i]);
    }

    lastSeens = {};

    for (var i = 0; i < nodes.length; i++) {
        lastSeens[nodes[i].nodeId] = nodes[i].lastSeen;
    }
}



var nodeTemplate = Handlebars.compile($('#nodeTemplate').html());
var sensorTemplate = Handlebars.compile($('#sensorTemplate').html());

Handlebars.registerHelper("fullDate", function (datetime) {
    return moment(datetime).format("DD/MM/YYYY HH:mm:ss");
});

Handlebars.registerHelper("yes-no", function (boolean) {
    if (boolean == null)
        return "Unknown";
    else if (boolean)
        return "Yes";
    else
        return "No";
});

Handlebars.registerHelper("sensor-id", function (sensor) {
    return sensor.nodeId + "-" + sensor.sensorId;
});



Handlebars.registerHelper("sensor-type", function (sensor) {
    return getSensorType(sensor);
});

function getSensorType(sensor) {
    var type = Object.keys(mySensors.sensorType)[sensor.type];
    if (type == null)
        type = "Unknown";
    return type;
}

function getDataType(sensor) {
    var type = Object.keys(mySensors.sensorDataType)[sensor.dataType];
    if (type == null)
        type = "Unknown";
    return type;
}

function createOrUpdateNode(node) {
    var nodePanel = $('#nodePanel' + node.nodeId);

    if (nodePanel.length == 0) {
        //create new
        $(nodeTemplate(node)).hide().appendTo("#nodesContainer").fadeIn(elementsFadeTime);
    } else {
        //update
        nodePanel.html(nodeTemplate(node));
    }

    for (var i = 0; i < node.sensors.length; i++) {
        createOrUpdateSensor(node.sensors[i]);
    }
}


function updateBattery(node) {
    var nodeBattery = $('#nodeBattery' + node.nodeId);

    if (nodeBattery.length == 0)
        createOrUpdateNode(node);
    else nodeBattery.html(node.batteryLevel);
}


function createOrUpdateSensor(sensor) {
    var id = sensor.nodeId + "-" + sensor.sensorId;

    if ($('#sensorPanel' + id).length == 0) {
        //create new
        $(sensorTemplate(sensor)).hide().appendTo("#sensorsContainer" + sensor.nodeId).fadeIn(elementsFadeTime);
    }


    var state = sensor.state;
    if (state == "" || state == null)
        state = "null";

    $('#sensorType' + id).html(getSensorType(sensor));
    $('#dataType' + id).html(getDataType(sensor));
    $('#state' + id).html(state);
}




function updateLastSeen(nodeId, lastSeen) {

    var date1 = new Date(lastSeen);
    var date2 = new Date();
    var diff = Math.abs(date2.getTime() - date1.getTime());
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));

    diff -= days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    var seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);

    var elspsed;
    if (days != 0)
        elapsed = days + "d " + hours + "h " + mins + "m " + seconds + "s";
    else if (hours != 0)
        elapsed = hours + "h " + mins + "m " + seconds + "s";
    else if (mins != 0)
        elapsed = mins + "m " + seconds + "s";
    else
        elapsed = seconds + "s";

    $('#nodeLastSeen' + nodeId)
        .html(elapsed);

}

function updateAllLastSeens(sensor) {
    for (var key in lastSeens) {
        updateLastSeen(key, lastSeens[key]);
    }
}
