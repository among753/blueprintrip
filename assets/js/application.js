/**
 * Created by sasaki on 13/10/01.
 */


jQuery(function(){
    // Document is ready
//    initialize();
});
google.maps.event.addDomListener(window, 'load', initialize);

var rendererOptions = {
    draggable: false,
    preserveViewport: false
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
var directionsService = new google.maps.DirectionsService();
var map;

function initialize() {
    // render map
    var mapOptions = {
        zoom: 15,// Max 21
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(35.793206,139.286213)
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    // set panel
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));
    directionsDisplay.setMap(map);
    loadXml();

}

function loadXml() {
    $.ajax({
        url: 'point.xml',
        type: 'GET',
        dataType: 'xml',
        timeout: 1000,
        error: function () {
			alert("xmlファイルの読み込みに失敗しました");
        },
        success: function (xml) {
            var data = [];
            data['waypoints'] = [];
            var mk = [];

            $(xml).find("origin").each(function () {
                data['origin'] = {
                    'location': $(this).find('location').text(),
                    'address': $(this).find('address').text(),
                    'name': $(this).find('name').text()
                };
            });
            $(xml).find("destination").each(function () {
                data['destination'] = {
                    'location': $(this).find('location').text(),
                    'address': $(this).find('address').text(),
                    'name': $(this).find('name').text()
                };
            });
            var i = 1;
            $(xml).find("waypoints").each(function () {
                var shop = {
                    'location': $(this).find('location').text(),
                    'address': $(this).find('address').text(),
                    'name': $(this).find('name').text()
                };
                data['waypoints'].push(shop);
                i++;
            });
            calcRoute(data);
        }
    });
}


function calcRoute(data) {
    var points = [];
    for (var i in data['waypoints']) {
        points.push({
            location: data['waypoints'][i]['location'],
            stopover: true
        });
    }
    var request = {
        origin: data['origin']['location'],
        destination: data['destination']['location'],
        waypoints: points,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
        unitSystem: google.maps.DirectionsUnitSystem.METRIC,
        optimizeWaypoints: false,
        avoidHighways: false,
        avoidTolls: false
    };

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var route = response.routes[0];
            route.legs[0].start_address = "<strong>" + data['origin']['name'] +"</strong><br />"+ data['origin']['address'] + "<br />";//1件目の吹き出しを設定（directionsPanelもこれになっちゃう）
            var o = 0;
            for (var i in data['waypoints']) {
                route.legs[o + 1].start_address = "<strong>" + data['waypoints'][i]['name'] + "</strong><br />" + data['waypoints'][i]['address'] + "<br />";//waypointsの吹き出しを設定
                o++;
            }
            route.legs[o].end_address = "<strong>" + data['destination']['name'] +"</strong><br />"+ data['destination']['address'];//最終地点の吹き出しを設定（directionsPanelもこれになっちゃう）

            directionsDisplay.setDirections(response);
        }
    });
}
