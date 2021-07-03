

    var TrafficLight = function ()
    {
        var colors = {
            "red": { bg: "bg-danger", color: "text-danger", border: "border-danger" },
            "yellow": { bg: "bg-warning", color: "text-warning", border: "border-warning" },
            "green": { bg: "bg-success", color: "text-success", border: "border-success" }
        };

        var state = {};

        this.redViewer = null;
        this.yellowViewer = null;
        this.greenViewer = null;
        this.counterViewer = null;

        var timer = new Core.Timer({ interval: 1000 });

        this.start = function(redSeconds, yellowSeconds, greenSeconds)
        {
            timer.stop();
            clearState.bind(this)();
            this.counterViewer.html(0);
            state = {};

            createState.bind(this)("red", redSeconds, 0);
            createState.bind(this)("yellow", yellowSeconds, redSeconds);
            createState.bind(this)("green", greenSeconds, redSeconds + yellowSeconds);

            var stateIndex = 1;
            state[redSeconds + yellowSeconds + greenSeconds].afterRun = () => stateIndex = 1;

            var $this = this;
            timer.setOption(function (option)
            {   
                option.onTick = function ()
                {
                    stateColor = state[stateIndex];
                    clearState.bind($this)();
                    stateColor.run();
                    stateIndex++;
                    stateColor.afterRun();
                };                
            });
            timer.start();
        }

        var createState = function (colorName, seconds, start)
        {            
            for (var i = 1; i <= seconds; i++)
            {
                stateColor = new TrafficLight.StateColor(colors[colorName], this[colorName + "Viewer"], this.counterViewer, seconds + start, start + i);
                state[stateColor.stateIndex = (start + i)] = stateColor;
            }
        }

        var clearState = function ()
        {
            var arr = Object.keys(colors);
            for (var i = 0; i < arr.length; i++)
            {
                var colorName = arr[i];
                var color = colors[colorName];
                this[colorName + "Viewer"].removeClass(color.bg);
                this.counterViewer.removeClass(color.color).removeClass(color.border);
            }
        }
    }
    
    TrafficLight.StateColor = function (color, lightElement, counterViewer, maxSeconds, stateIndex)
    {
        this.run = function ()
        {
            lightElement.addClass(color.bg);
            counterViewer.addClass(color.color).addClass(color.border).html(maxSeconds - stateIndex);
        }
        this.afterRun = function () { };
    }

    var content = $("article");
    var trafficLight = new TrafficLight();
    trafficLight.redViewer = content.find(".tl1");
    trafficLight.yellowViewer = content.find(".tl2");
    trafficLight.greenViewer = content.find(".tl3");
    trafficLight.counterViewer = content.find(".tl4");

    var invalidChars = ["-", "+", "e"];
    var inputSeconds = content.find(".input-seconds");
    inputSeconds.each(function () { this.addEventListener("keydown", function (e) { if (invalidChars.includes(e.key)) { e.preventDefault(); } }); });

    var btn = content.find("[data-btn=Start]");
    btn.click(function ()
    {
        trafficLight.start(parseInt(content.find("#input_1").val()),
            parseInt(content.find("#input_2").val()),
            parseInt(content.find("#input_3").val()));
    });

    /*search map in the feature*/
    /*
    function searchmap(){ 
        var input = (document.getElementById('target'));
        var searchBox = new google.maps.places.SearchBox(input);
        var markers = [];
        google.maps.event.addListener(searchBox, 'places_changed', function() {
    
            var infowindow = new google.maps.InfoWindow();
            $("#places").html('');
            var places = searchBox.getPlaces();
    
            for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }
    
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        var marker;
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
    
            marker = new google.maps.Marker({
                map: map,
                icon: image,
                title: place.name,
                position: place.geometry.location
            });
    
            markers.push(marker);
    
            bounds.extend(place.geometry.location);
            var name = place.name;
            google.maps.event.addListener(marker,'click',function(){
            infowindow.close();
            infowindow.setContent(name);
            infowindow.open(map,marker);
        });
      
        $("<li>")
        .text(place.name)
        .appendTo("#places")
        .click(function(){
        
        new google.maps.event.trigger( marker, 'click' );
        
        map.setZoom(14);
        map.setCenter(marker.getPosition());
        });
    }
    
        map.fitBounds(bounds);
    });
    
        google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}
    google.maps.event.addDomListener(window, 'load', searchmap);
*/