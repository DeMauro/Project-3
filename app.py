import joblib 
from flask import Flask, render_template,request, jsonify, make_response
import pandas as pd 
from random import sample


# SQLALCHEMY SETUP
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import psycopg2

#################################################
# Database Setup
#################################################

#make sure you have your own config on your computer in the SQL folder
# from config import key

pg_user = 'postgres'
pg_pwd = 'iheartdata'
pg_port = "5432"
rds = 'p3.cbbgji2378b1.us-east-2.rds.amazonaws.com'

database = 'fastloan'
url = f"postgresql://{pg_user}:{pg_pwd}@{rds}:{pg_port}/{database}"


engine = create_engine(f'{url}')

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
Loanaccept = Base.classes.loanaccept

# create instance of Flask app
app = Flask(__name__)

model = joblib.load("Resources/test.joblib")

print(model)

# create route that renders index.html template
@app.route("/", methods=["GET"])
def home():
    
    return render_template("index.html")

@app.route("/assessment", methods=["GET"])
def assessment():
    
    return render_template("assessment.html")


# route to make prediction off of model
@app.route("/predict", methods=["POST"])
def results():      
    # print(request.form) #print the value of each of the forms on the webpage    
    
    purpose= int(request.form.get("Purpose")) # Purpose of loan    
    Age= int(request.form.get("Age")) # Age of applicant    
    Dependents= int(request.form.get("Dependents"))# number of dependents    
    Employment= int(request.form.get("Employment"))# are they employed    
    Salary= int(request.form.get("Salary"))# Yearly salary    
    first_loan= int(request.form.get("first_loan"))# Is this their first loan    
    Repay= int(request.form.get("Repay"))# Have they repayed a loan    
    Current= int(request.form.get("Current"))# are they currently repaying a loan    
    Savings= int(request.form.get("Savings"))# Total amount in savings account    
    Checking= int(request.form.get("Checking"))# Total amount in checking account    
    Credit_card= int(request.form.get("Credit_card"))# Total credit card limit    
    credit_percent= int(request.form.get("credit_percent"))# Avg. percent of credit used last year...
    credit_percent= (int(credit_percent)/100) # Converted to decimal
     
    # line up values to match model values and predict
    APorDe = model.predict([[purpose,first_loan,Repay,Current,Credit_card,credit_percent,Savings,Checking,Employment,Salary,Age,Dependents]])
    AporDe2 = int(APorDe[0])
    #used to check (with print above) that values are received correctly 
    # print(purpose,Age,Dependents,Employment,Salary,first_loan,Repay,Current,Savings,Checking,Credit_card,credit_percent)
    
    # report result back to webpage
    if AporDe2 == 0:
        result = "Denied!"
    else:
        result = "Approved!"
         
     
    #add to the sql database here (add to the outcome and the application db)
    session = Session(engine) 
    newuser = Loanaccept(purpose = purpose, first_loan=first_loan, otherloans_repaid=Repay, repaying=Current, credit_limit=Credit_card, limit_used=credit_percent, savings=Savings, checking=Checking, employeed=Employment, salary=Salary, age=Age, dependents=Dependents,granted=AporDe2)
    session.add(newuser)
    session.commit()
    user_id=newuser.id
    #also find out how to send these values to js
    print(user_id)
    
    response = make_response(render_template("assessment.html", result=result))
    response.set_cookie("user_id",str(user_id))
    
    session.close()
    return response
    
 
@app.route("/api/data")
def data():
    
    # A couple of functions to speed up dictionary creation
    def groupbar(list_objectD, list_objectA, i):
        vname = [{'granted':'Declined','value':list_objectD[i]['value']}, {'granted':'Accepted','value':list_objectA[i]['value']}]
        return vname
    
    def dictionary_bar_list(query):
        mylist = []
        for i in query:
            group = i[0]
            value = i[1]
            dic = {'group':group, 'value':value}
            mylist.append(dic)
            
        return mylist
    
    # function for simple bar chart
    def simplebar_dic(query):
        decline = query[0]
        accept = query[1]
        accept_dic = {'group':accept[0], 'value':int(accept[1])}
        decline_dic = {'group':decline[0], 'value':int(decline[1])}
    
        simplebar_list = [accept_dic, decline_dic]
    
        return simplebar_list
    
    def dictionary_scatter_list(query):
        mylist = []
    
        for i in query:
            dic = {
                "user_id": i[0],
                "credit_limit": i[1],
                "limit_used": i[2],
                "age": i[3],
                "checking": i[4],
                "savings": i[5],
                "granted": i[6]
            }
            mylist.append(dic) 
            
        return mylist
    
    #need to create an empty list before running these two function
    #allows persone to name the list whatever they want
    def combine_list(mylist, data_name, data_list,i):
        mylist.append({'Category':data_name[i],'Value':data_list[i]})
    

    # Create our session (link) from Python to the DB
    session = Session(engine)
    
    ### CREATE PURPOSE DICTIONARY LIST ######
    #Query Database
    purposeData_accept = session.query(Loanaccept.purpose, func.count(Loanaccept.purpose)).\
        filter(Loanaccept.granted == 1).group_by(Loanaccept.purpose).all()
    
    purposeData_decline = session.query(Loanaccept.purpose, func.count(Loanaccept.purpose)).\
        filter(Loanaccept.granted == 0).group_by(Loanaccept.purpose).all()
    
    #Convert Query to list of dictionaries
    df_purpose_A = dictionary_bar_list(purposeData_accept)
    df_purpose_D = dictionary_bar_list(purposeData_decline)
    
    #create dictionaries for each purpose type (for grouped bar graph)
    Home = groupbar(df_purpose_D,df_purpose_A,0)
    Business = groupbar(df_purpose_D,df_purpose_A,1)
    Investment = groupbar(df_purpose_D,df_purpose_A,2)
    Emergency = groupbar(df_purpose_D,df_purpose_A,3)
    Other = groupbar(df_purpose_D,df_purpose_A,4)
    
    #create lists to loop over with function
    data_names = ['Home','Business','Investment','Emergency','Other']
    data_lists = [Home, Business, Investment, Emergency, Other]
    
    #Combine reorganized dictionaries into list
    bar_purpose = []
    for i in range(len(data_names)):
        combine_list(bar_purpose, data_names, data_lists,i)
        
    ### CREATE FIRSTLOAN DICTIONARY LIST ######
    
    firstloanData_accept = session.query(Loanaccept.first_loan, func.count(Loanaccept.first_loan)).\
        filter(Loanaccept.granted == 1).group_by(Loanaccept.first_loan).all()
    
    firstloanData_decline = session.query(Loanaccept.first_loan, func.count(Loanaccept.first_loan)).\
        filter(Loanaccept.granted == 0).group_by(Loanaccept.first_loan).all()
    
    
    df_firsloan_A = dictionary_bar_list(firstloanData_accept)
    
    df_firsloan_D = dictionary_bar_list(firstloanData_decline)
    
    Not_FirstLoan = groupbar(df_firsloan_D,df_firsloan_A,0)
    FirstLoan = groupbar(df_firsloan_D,df_firsloan_A,1)
    
    #Create list to loop over
    data_names = ['Not_FirstLoan','FirstLoan']
    data_lists = [Not_FirstLoan, FirstLoan]
    
    bar_firstloan = []
    for i in range(len(data_names)):
        combine_list(bar_firstloan, data_names, data_lists,i)
    
    ### CREATE SALARY DICTIONARY LIST###
    
    salary_bar_query= session.query(Loanaccept.granted, func.avg(Loanaccept.salary)).\
            group_by(Loanaccept.granted).all()
    
    salary_bar = simplebar_dic(salary_bar_query)
    
    
    
    ### CREATE CREDIT DICTIONARY LIST ######
    
    #query the credit data
    credit = session.query(Loanaccept.id, Loanaccept.credit_limit, Loanaccept.limit_used, Loanaccept.age, Loanaccept.checking, Loanaccept.savings, Loanaccept.granted).all()
    
    #put it into dictionary format
    credit_list = dictionary_scatter_list(credit)
    
    #grab a random sample of 300
    credit_sample = sample(credit_list, 300)
    
    ### COMBINE DICTIONARY LISTS INTO MASTER DICTIONARY ######
    my_data = {'bar_purpose':bar_purpose, 'bar_firstloan':bar_firstloan, 'scatter_credit': credit_sample, 'bar_salary':salary_bar}
        
    session.close()
    
    #Return the JSON representation of your dictionary
    return (jsonify(my_data))


if __name__ == "__main__":


    app.run(debug=True) 

