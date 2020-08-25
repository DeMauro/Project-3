from sklearn.externals import joblib 
from flask import Flask, render_template,request
import pandas as pd 

# create instance of Flask app
app = Flask(__name__)




# create route that renders index.html template
@app.route("/", methods=["POST","GET"])
def home():
    if request.method ==  "POST":
        # Collecting Purpose Value and Converting
        purpose=request.form.get("Purpose")
        if purpose == "Home":
            purpose=0
        elif purpose == "Business":
            purpose=1 
        elif purpose == "Investment":
            purpose=2
        elif purpose == "Emergency Funds":
            purpose=3
        else:
            purpose=4
        # Collect other variables

        print(purpose)
    return render_template("index.html")



@app.route("/predict")
def results(): 

    

    return jsonify()

if __name__ == "__main__":
    # model = joblib.load("Resources/test.pkl")
    app.run(debug=True)
