const url = '/info/';
let current_light_info = null;
let current_light_id = null;

function collect_inputs()
{

}

function request(command, data, callback, args=null)
{
    const Http = new XMLHttpRequest();
    Http.open('POST', url);
    Http.send(JSON.stringify({"command":command, "args":data}));

    Http.onload = function(){
        if (Http.readyState === Http.DONE) {
            if (Http.status === 200) {
                console.log(Http.response, typeof(Http.response));
                var response = JSON.parse(Http.response);
                callback(response, args);
            }
        }
    }
}

function update_manual(value)
{

}

function turn_on()
{
    const btn = document.getElementById('switch');
    btn.innerHTML = 'Turn On';
    btn.style.setProperty('background', 'green');
    btn.style.setProperty('color', 'white');
}

function shutdown()
{
    const btn = document.getElementById('switch');
    btn.innerHTML = 'Shutdown';
    btn.style.setProperty('background', 'red');
    btn.style.setProperty('color', 'black');
}

function swap()
{
    const state = current_light_info['activated'];
    console.log(current_light_id);
    if (state === 0) turn_on();
    else shutdown();
}

function update()
{
    swap();
}

function activate()
{
    request('SET',
            {'attribute':'activated', 'light id':current_light_id, 'value':!current_light_info['activated']},
        (res, args)=>{
                        if (res['status'] === 'success')
                        {
                            request('GET', {'attribute':'database', 'light id':current_light_id}, (res, args) => current_light_info = res['data'], null);
                            update();
                        }
        }, null);
}

function set_marker(response, args)
{
    var google = args['google'];
    var map = args['map'];
    var infowindow = args['info'];
    var i = args['i'];

    const loc = parseFloat(response['data']['loc']);
    const lat = parseFloat(response['data']['lat']);
    var marker = new google.maps.Marker({
                  position: new google.maps.LatLng(loc, lat),
                  map: map
                });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent('Light ' + (i + 1) + ' at (' + loc + ',' + lat + ')');
        infowindow.open(map, marker);
        current_light_id = i + 1;
        request('GET',
                        {'attribute':'database', 'light id':i + 1},
                    (res, args) => {
                                current_light_info = res['data'];
                                update();
                                console.log(document.getElementById('switch').textContent)
                            }, null);
      }
    })(marker, i));
}