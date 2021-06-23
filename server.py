import utils
import exceptions

# Request form:
# {
#   status:['success', 'failed'],
#   command: ['GET', 'SET'],
#   args: // GET
#       {
#           attribute:  ['status', 'location', 'database', 'sensors'],
#           light id: int
#       }
#   args: // SET
#       {
#           attribute:  ['manual', 'activated', 'attributes'],
#           light id: int
#           value: <your value>
#       }
# }
adafruit_io_client = [utils.connect_adafruit_io(0), utils.connect_adafruit_io(1)]
clients = []

# hàm xử lý thông tin nhận được từ web
def process(comm, args):
    result = {'status':'', 'data':''}
    data = ''
    try:
        if comm == 'GET':
            light_id = args['light id']
            attribute = args['attribute']

            # tách điều khiển cho từng lệnh
            if attribute == 'status':
                loc, lat, activated = utils.access_database(
                    'select Loc, Lat, activated from Lights where id = {}'.format(light_id)
                )[0]

                manual, density, wait, running, strength = utils.access_database(
                    'select manual, density, waiting_time, running_time, strength from Light_Attributes where id = {}'.format(
                        light_id
                    )
                )[0]
                data = {
                    'manual'        : manual,
                    'activated'     : activated,
                    'signal'        : utils.get_traffic_light_values(adafruit_io_client[0]),
                    'strength'      : strength,
                    'density'       : density,
                    'waiting time'  : wait,
                    'running time'  : running,
                    'loc'           : loc,
                    'lat'           : lat
                }
            elif attribute == 'location':
                loc, lat = utils.access_database('select Loc, Lat from Lights where id = {}'.format(light_id))[0]
                data = {
                    'loc': loc,
                    'lat': lat
                }
            elif attribute == 'sensors':
                data = {
                    'signal'        : utils.get_traffic_light_values(adafruit_io_client[0]),
                    'strength'      : utils.light_sensor_to_strength(
                                            utils.light_sensor_to_strength(
                                                utils.get_light_strength_values(adafruit_io_client[1])
                                            )
                                        )
                }
            elif attribute == 'database':
                manual, density, wait, running, strength = utils.access_database(
                    'select manual, density, waiting_time, running_time, strength from Light_Attributes where id = {}'.format(
                        light_id)
                )[0]
                activated = utils.access_database(
                    'select activated from Lights where id = {}'.format(
                        light_id)
                )[0][0]
                data = {
                    'activated'     : activated,
                    'strength'      : strength,
                    'manual'        : manual,
                    'density'       : density,
                    'waiting time'  : wait,
                    'running time'  : running
                }
            else:
                raise Exception('Not such an attribute ' + attribute)
        elif comm == 'SET':
            light_id = args['light id']
            attribute = args['attribute']
            value = args['value']

            if attribute != 'manual':
                manual = utils.access_database(
                    'select manual from Light_Attributes where id = {}'.format(
                        light_id)
                )[0][0]
                if not manual:
                    raise exceptions.ManualControlNotGranted()

            data = ''

            if attribute == 'manual':
                utils.update_manual(light_id, (True if int(value) == 1 else False))
            elif attribute == 'activated':
                utils.update_activated(light_id, (True if int(value) == 1 else False))
            elif attribute == 'attributes':
                utils.update_waiting_time(light_id, value['waiting time'])
                utils.update_running_time(light_id, value['running time'])
                utils.update_strength(light_id, value['strength'])
            else:
                raise Exception('Not such an attribute ' + attribute)
        else:
            raise Exception('Invalid Command')

        result['status'] = 'success'
        result['data'] = data
    except Exception as e:
        result['status'] = 'failed'
        result['reason'] = str(e)

    return result
