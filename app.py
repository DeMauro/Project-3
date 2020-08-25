import joblib 
from flask import Flask, render_template,request
import pandas as pd 

# create instance of Flask app
app = Flask(__name__)
model = joblib.load("Resources/test.joblib")

# create route that renders index.html template
@app.route("/", methods=["GET"])
def home():
    
    return render_template("index.html")

# route to make prediction off of model
@app.route("/predict", methods=["POST"])
def results():      
    # print(request.form) #print the value of each of the forms on the webpage    
    
    purpose=request.form.get("Purpose") # Purpose of loan    
    Age=request.form.get("Age") # Age of applicant    
    Dependents=request.form.get("Dependents")# number of dependents    
    Employment=request.form.get("Employment")# are they employed    
    Salary=request.form.get("Salary")# Yearly salary    
    first_loan=request.form.get("first_loan")# Is this their first loan    
    Repay=request.form.get("Repay")# Have they repayed a loan    
    Current=request.form.get("Current")# are they currently repaying a loan    
    Savings=request.form.get("Savings")# Total amount in savings account    
    Checking=request.form.get("Checking")# Total amount in checking account    
    Credit_card=request.form.get("Credit_card")# Total credit card limit    
    credit_percent=request.form.get("credit_percent")# Avg. percent of credit used last year...
    credit_percent=(int(credit_percent)/100) # Converted to decimal
    
    # line up values to match model values and predict
    APorDe = model.predict([[purpose,first_loan,Repay,Current,Credit_card,credit_percent,Savings,Checking,Employment,Salary,Age,Dependents]])
    
    #used to check (with print above) that values are received correctly 
    # print(purpose,Age,Dependents,Employment,Salary,first_loan,Repay,Current,Savings,Checking,Credit_card,credit_percent)
    
    # report result back to webpage
    if APorDe == 0:
        result = "Denied!"
    else:
         result = "Approved!"
    return render_template("index.html", result=result)

if __name__ == "__main__":
    app.run(debug=True) 