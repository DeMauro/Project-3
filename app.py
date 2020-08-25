from sklearn.externals import joblib 
from flask import Flask, render_template,request
import pandas as pd 

# create instance of Flask app
app = Flask(__name__)
model = joblib.load("Resources/test.joblib")

# create route that renders index.html template
@app.route("/", methods=["GET"])
def home():
    
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def results(): 
    # Collecting Purpose Value and Converting 
    print(request.form)
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
    # Age
    Age=request.form.get("Age")
    Age=int(Age)
    # Dependents
    Dependents=request.form.get("Dependents")
    Dependents=int(Dependents)
    #Employment
    Employment=request.form.get("Employment")
    if Employment == "Yes":
        Employment=1
    else:
        Employment=0
    #Salary
    Salary=request.form.get("Salary")
    Salary=int(Salary)
    # Is this your first loan
    first_loan=request.form.get("first_loan")
    if first_loan == "Yes":
        first_loan=1
    else:
        first_loan=0
    #have you repayed a loan
    Repay=request.form.get("Repay")
    if Repay == "Yes":
        Repay=1
    elif purpose == "No":
        Repay=0
    else:
        Repay=2
    #are you currently repaying a loan
    Current=request.form.get("Current")
    if Current == "Yes":
        Current=1
    elif Current == "No":
        Current=0
    else:
        Current=2
    #Savings
    Savings=request.form.get("Savings")
    Savings=int(Savings)
    #Checking
    Checking=request.form.get("Checking")
    Checking=int(Checking)
    #Credit_card
    Credit_card=request.form.get("Credit_card")
    Credit_card=int(Credit_card)
    #Credit_percent
    credit_percent=request.form.get("credit_percent")
    credit_percent=(int(credit_percent)/100)
    
    APorDe = model.predict([[purpose,first_loan,Repay,Current,Credit_card,credit_percent,Savings,Checking,Employment,Salary,Age,Dependents]])
    
    if APorDe == 0:
        result = "Denied!"
    else:
         result = "Approved!"
    return render_template("index.html", result=result)

if __name__ == "__main__":
    # 
    app.run(debug=True)

 