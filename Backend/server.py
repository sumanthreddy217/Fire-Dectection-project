from flask import Flask, render_template,request

app = Flask(__name__,
            template_folder='../Frontend/templates',
            static_folder='../Frontend/static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/camera')
def camera():
    return render_template('camera.html')

if __name__ == '__main__':
    app.run(debug=True)
