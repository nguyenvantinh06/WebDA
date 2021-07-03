// biến global và constant 
const url = '/info/'; //địa chỉ để request
const COMM = 'status' //command dùng để refresh
let current_light_info = null; //info của đèn đang được chọn
let current_light_id = null; //id của đèn đang được chọn
let skip = false; //bỏ 1 interval trong vòng lặp update

// Hàm nhận các dữ liệu input
function collect_inputs()
{
    const strength = document.getElementById('light-strength').value;
    const run = document.getElementById('running-time').value;
    const wait = document.getElementById('waiting-time').value;
    return {'running time':run, 'waiting time':wait, 'strength':strength};
}

// Hàm request dữ liệu lên server
function request(command, data, callback, args=null)
{
    const Http = new XMLHttpRequest();//gửi 1 request 
    Http.open('POST', url); //sử dụng post để đấy data qua server
    Http.send(JSON.stringify({"command":command, "args":data}));//gửi command post qua cho server đính kèm thêm command và data

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

function update_manual()
{
    request('SET',
            {'attribute':'manual', 'light id':current_light_id, 'value':!current_light_info['manual']},
        (res, args)=>{
                        if (res['status'] === 'success')
                        {
                            current_light_info['manual'] = !current_light_info['manual'];
                            update();
                        }
        }, null);
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
    if (state) shutdown();
    else turn_on();
}

function set()
{
    const data = collect_inputs();
    console.log(data);
    request('SET',
            {
                    'attribute':'attributes',
                    'light id': current_light_id,
                    'value': data
            }, (res, args) => {
                    request('GET',
                        {
                                'attribute':'status',
                                'light id':current_light_id
                            },
                        (res, args) => {
                                current_light_info = res['data'];
                                update();
                            }, null);
        }, null);
}

function reset()
{
    document.getElementById('light-strength').innerHTML = current_light_info['strength'].toFixed(5);
    document.getElementById('waiting-time').innerHTML = current_light_info['waiting time'];
    document.getElementById('running-time').innerHTML = current_light_info['running time'];
}

function update()
{
    swap();
    document.getElementById('light_id').innerHTML = "ID: " + current_light_id;
    document.getElementById('strength').innerHTML = "Strength: " + current_light_info['strength'].toFixed(5);
    document.getElementById('density').innerHTML = "Destiny: " + current_light_info['density'].toFixed(5);
    document.getElementById('waiting_time').innerHTML = "Waiting Time: " + current_light_info['waiting time'];
    document.getElementById('running_time').innerHTML = "Running Time: " + current_light_info['running time'];

    if (current_light_info['manual'])
        document.getElementById('content').classList.toggle('show', true);
    else document.getElementById('content').classList.toggle('show', false);

    document.getElementById('light-strength').placeholder = current_light_info['strength'].toFixed(5);
    document.getElementById('waiting-time').placeholder = current_light_info['waiting time'];
    document.getElementById('running-time').placeholder = current_light_info['running time'];

    document.getElementById('light-strength').defaultValue = current_light_info['strength'].toFixed(5);
    document.getElementById('waiting-time').defaultValue = current_light_info['waiting time'];
    document.getElementById('running-time').defaultValue = current_light_info['running time'];

    const css_on = {
        'red':'background: repeating-linear-gradient(#f00, #e00 5px);\n' +
            '        box-shadow: 0 0 40px #f00;\n' +
            '        z-index: 1;',
        'yellow':'background: repeating-linear-gradient(#fd0, #ec0 5px);\n' +
            '        box-shadow: 0 0 40px #fd0;\n' +
            '        z-index: 1;',
        'green':'background: repeating-linear-gradient(#0d0, #0c0 5px);\n' +
            '        box-shadow: 0 0 40px #0d0;\n' +
            '        z-index: 1;'
    };

    const css_off = {
        'red':'background: repeating-linear-gradient(#333, #443 5px);\n' +
            '        box-shadow: 0 0 0px #000;\n' +
            '        z-index: 1;',
        'yellow':'background: repeating-linear-gradient(#333, #443 5px);\n' +
            '        box-shadow: 0 0 0px #000;\n' +
            '        z-index: 1;',
        'green':'background: repeating-linear-gradient(#333, #443 5px);\n' +
            '        box-shadow: 0 0 0px #000;\n' +
            '        z-index: 1;'
    };

    const name = ['green', 'red', 'yellow'];
    const index = current_light_info['signal'];

    for (let i = 1; i <= name.length; i++)
    {
        let css = css_off;
        if (i === index) css = css_on;

        const doc = document.getElementById(name[i - 1]);
        doc.style.cssText = css[name[i - 1]];
    }
}

function activate()
{
    request('SET',
            {'attribute':'activated', 'light id':current_light_id, 'value':!current_light_info['activated']},
        (res, args)=>{
                        if (res['status'] === 'success')
                        {
                            skip = true;
                            current_light_info['activated'] = !current_light_info['activated'];
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
                        {'attribute':COMM, 'light id':i + 1},
                    (res, args) => {
                                current_light_info = res['data'];
                                update();
                            }, null);
      }
    })(marker, i));
}

// renew status after 20s
setInterval(()=>{
    if ((current_light_id != null) && !skip)
        request('GET',
                {'attribute':COMM, 'light id':current_light_id},
            (res, args) => {
                        current_light_info = res['data'];
                        update();
                    }, null);
    skip = false;
}, 3000);