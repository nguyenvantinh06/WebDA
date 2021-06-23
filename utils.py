from Adafruit_IO import *
import json
import exceptions
import math
import datetime
import mysql.connector as db_conn

DEFAULT_USERNAME = ['VuNguyenLong']*2
DEFAULT_KEY = ['aio_Iwky10iEp5l1D0bisPDBDYn3J7s9']*2

USERNAME    = ['CSE_BBC', 'CSE_BBC1']
KEY         = None

DB_NAME = 'DA'
DB_USER = 'ODBC'

class LIGHT_VALUES:
    OFF     = 0
    GREEN   = 1
    RED     = 2
    YELLOW  = 3

class Density_Distribution:
    std     = 329.0895268261612
    mean    = 569.5
    n       = 1140

    distribution = None

    @staticmethod
    def density(minutes):
        if Density_Distribution.distribution is None:
            Density_Distribution.distribution = Density_Distribution.__norm(
                                                    Density_Distribution.mean,
                                                    Density_Distribution.std
                                                )
        return Density_Distribution.distribution(minutes)

    @staticmethod
    def __norm(mean, std):
        def __norm_x(x):
            power = -0.5 * math.pow((x - mean) / std, 2)
            return math.pow(math.e, power)
        return __norm_x


class Database:
    HOST = 'localhost'

    @staticmethod
    def init_database(db_name, user, password=''):
        db = db_conn.connect(
            host=Database.HOST,
            user=user,
            password=password,
            database=db_name
        )
        return db

def load_keys():
    global KEY
    global USERNAME
    try:
        file = open('keys.txt', 'r')
        KEY = list(map(lambda x: x.replace('\n', ''), file.readlines()))
        file.close()

        for i in range(len(KEY)):
            Client(USERNAME[i], KEY[i]).feeds()
    except RequestError:
        try:
            print('Errors happened. Request keys...')
            import requests
            res = json.loads(requests.get('http://dadn.esp32thanhdanh.link').text)
            KEY = [res['keyBBC'], res['keyBBC1']]

            file = open('keys.txt', 'w')
            file.writelines(list(map(lambda x: x + '\n', KEY)))
            file.close()
            print('Key has been updated')

            for i in range(len(KEY)):
                Client(USERNAME[i], KEY[i]).feeds()
        except:
            print('Error happend, using default keys')
            USERNAME = DEFAULT_USERNAME
            KEY = DEFAULT_KEY
load_keys()


def connect_adafruit_io(account_index):
    return Client(USERNAME[account_index], KEY[account_index])

def density_to_waiting_time(density):
    return int(10 + 50 * (1 - density))

def density_to_running_time(density):
    return int(10 + 50 * density)

def get_traffic_light_values(adafruit_io_client:Client):
    return int(json.loads(adafruit_io_client.receive('bk-iot-traffic').value)['data'], base=2)

def get_light_strength_values(adafruit_io_client:Client):
    return int(json.loads(adafruit_io_client.receive('bk-iot-light').value)['data'])

def light_sensor_to_strength(light_sensor_values):
    return 1 / (1 + math.pow(math.e, -4 * (light_sensor_values - 512) / 512)) * 800 + 224

def set_traffic_light_values(adafruit_io_client:Client, value):
    if value not in range(0, 4):
        raise exceptions.InvalidValue(value)
    else:
        value = '{0:02b}'.format(value)

    values = {
        "id":'6',
        "name":"TRAFFIC",
        "data":value,
        "unit":""
    }
    return adafruit_io_client.send('bk-iot-traffic', json.dumps(values))

def set_activated_light(adafruit_io_client:Client, value):
    if value not in range(0, 3):
        raise exceptions.InvalidValue(value)

    values = {
        "id": '1',
        "name": "LED",
        "data": value,
        "unit": ""
    }
    return adafruit_io_client.send('bk-iot-led', json.dumps(values))

def get_touch_value(adafruit_io_client:Client):
    return int(json.loads(adafruit_io_client.receive('bk-iot-touch').value)['data'])

def get_minutes():
    now = datetime.datetime.now()
    return now.hour * 60 + now.minute

def access_database(comm):
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute(comm)
    result = [i for i in cursor]
    database.close()
    if result:
        return result
    else:
        raise Exception('Command return empty')

def update_manual(light_id, status):
    if status not in [True, False]:
        raise exceptions.InvalidValue(status)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Light_Attributes set manual = {} where light_id = {}'.format(status, light_id))
    database.commit()
    database.close()


def update_strength(light_id, value):
    value = float(value)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Light_Attributes set strength = {} where light_id = {}'.format(value, light_id))
    database.commit()
    database.close()

def update_waiting_time(light_id, t):
    t = int(t)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Light_Attributes set waiting_time = {} where light_id = {}'.format(t, light_id))
    database.commit()
    database.close()

def update_running_time(light_id, t):
    t = int(t)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Light_Attributes set running_time = {} where light_id = {}'.format(t, light_id))
    database.commit()
    database.close()

def update_density(light_id, value):
    value = float(value)
    if not (0 <= value <= 1):
        raise exceptions.InvalidValue(value)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Light_Attributes set density = {} where light_id = {}'.format(value, light_id))
    database.commit()
    database.cmd_quit()

def update_activated(light_id, status):
    if status not in [True, False]:
        raise exceptions.InvalidValue(status)
    database = Database.init_database(DB_NAME, DB_USER)
    cursor = database.cursor()
    cursor.execute('update Lights set activated = {} where id = {}'.format(status, light_id))
    database.commit()
    database.close()