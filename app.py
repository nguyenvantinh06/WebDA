from flask import *
import server
import json

# tạo instance của app tên 'DA'
app = Flask('DA')

# đường dẫn mặc định vào trang web
@app.route('/')
def home():
    @after_this_request #sau khi nhận được request thì gửi message kèm header này để tránh lỗi access control khi sử dụng trên browser
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
	
    # phản hồi lại cho browser
    return render_template('test.html')

# method dùng để cập nhật và truy xuất thông tin từ web
# POST được sử dụng do các message này đều chứa dữ liệu truyền đi chứ không chỉ request
@app.route('/info/', methods=['POST'])
def info():
    @after_this_request
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    data = json.loads(request.data) # đọc json nhận được
    result = server.process(data['command'], data['args']) # xử lý, kết quả trả về dưới dạng dictionary được định nghĩa trong file server.py
    return jsonify(result) # encode sang json

if __name__ == '__main__':
    app.run()