class InvalidValue(Exception):
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return 'Value error ' + str(self.value)

class ManualControlNotGranted(Exception):
    def __str__(self):
        return 'Manual control not granted'