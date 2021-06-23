import exceptions
import utils
import time

# định nghĩa hàm chạy liên lạc với đèn
# light_id: id của đèn
# yellow_time: thời gian sáng của đèn vàng, thời gian này là cố định do nó không phụ thuộc vào lượng người lưu thông
def light(light_id, yellow_time = 2):

    # khởi tạo các client để connect với adafruit dựa trên các key được cung cấp CSE_BBC và CSE_BBC1 (dùng default của VuNguyenLong nếu lỗi)
    clients = [utils.connect_adafruit_io(0), utils.connect_adafruit_io(1)]
    YELLOW_TIME = yellow_time
    LIGHT_ID = light_id

    # hàm đếm ngược
    def clock(kind, t):
        while t > 0:
            print("\r{} {}".format('{0:02b}'.format(kind), t), end='')
            time.sleep(1)
            t -= 1
        print()

    prev = None
    while True:
        
        # kiểm tra xem đèn có được kích hoạt không
        activated = utils.access_database('select activated from lights where id = {}'.format(LIGHT_ID))[0][0]

        # giá trị của activated được lưu là {0, 1} nên khi chuyển thành xanh và đỏ phải cộng thêm 1
        utils.set_activated_light(clients[0], activated + 1)

        # nhận diện cạnh lên (từ 0 lên 1) của nút chạm, nếu có sẽ tự động nghịch đảo giá trị activated
        if prev is not None and prev != 1:
            new = utils.get_touch_value(clients[0])
            if prev == 0 and new == 1:
                utils.update_activated(LIGHT_ID, not activated)
                prev = new
                continue
        else:
            prev = utils.get_touch_value(clients[0])

        if activated:
            waiting_time = None
            running_time = None
            kind = utils.get_traffic_light_values(clients[0])
            manual = \
                utils.access_database('select manual from light_attributes where light_id = {}'.format(LIGHT_ID))[0][0]
            if kind != utils.LIGHT_VALUES.OFF:
                if kind == utils.LIGHT_VALUES.RED:
                    if manual:
                        print('Control Online')
                        waiting_time = \
                            utils.access_database(
                                'select waiting_time from Light_Attributes where id = {}'.format(LIGHT_ID))[0][0]
                        clock(kind, waiting_time)
                    else:
                        print('Control Offline')
                        density = \
                            utils.access_database(
                                'select density from Light_Attributes where id = {}'.format(LIGHT_ID))[0][
                                0]
                        waiting_time = utils.density_to_waiting_time(density)
                        clock(kind, waiting_time)

                    kind = utils.LIGHT_VALUES.GREEN
                elif kind == utils.LIGHT_VALUES.GREEN:
                    if manual:
                        print('Control Online')
                        running_time = \
                            utils.access_database(
                                'select running_time from Light_Attributes where id = {}'.format(LIGHT_ID))[0][0]
                        clock(kind, running_time)
                    else:
                        print('Control Offline')
                        density = \
                            utils.access_database(
                                'select density from Light_Attributes where id = {}'.format(LIGHT_ID))[0][
                                0]
                        running_time = utils.density_to_running_time(density)
                        clock(kind, running_time)

                    kind = utils.LIGHT_VALUES.YELLOW
                elif kind == utils.LIGHT_VALUES.YELLOW:
                    clock(kind, YELLOW_TIME)
                    kind = utils.LIGHT_VALUES.RED

                utils.set_traffic_light_values(clients[0], kind)
            else:
                utils.set_traffic_light_values(clients[0], utils.LIGHT_VALUES.RED)

            if not manual:
                light_strength = utils.get_light_strength_values(clients[1])
                utils.update_strength(LIGHT_ID, utils.light_sensor_to_strength(light_strength))

                if waiting_time is not None:
                    utils.update_waiting_time(LIGHT_ID, waiting_time)

                if running_time is not None:
                    utils.update_running_time(LIGHT_ID, running_time)

            utils.update_density(LIGHT_ID, utils.Density_Distribution.density(utils.get_minutes()))
        else:
            print('System down')
            utils.set_traffic_light_values(clients[0], utils.LIGHT_VALUES.OFF)
            time.sleep(5)

# tạo một đèn để chạy, do thiếu thiết bị thực nên không thể cùng lúc chạy nhiều đèn
light(1, yellow_time=5)