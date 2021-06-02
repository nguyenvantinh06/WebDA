from flask import *
import server
import json

app = Flask('DA')

@app.route('/')
def home():
    @after_this_request
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    return render_template('test.html')

@app.route('/info/', methods=['POST'])
def info():
    @after_this_request
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    data = json.loads(request.data)
    result = server.process(data['command'], data['args'])
    return jsonify(result)

if __name__ == '__main__':
    app.run()