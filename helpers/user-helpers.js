var db = require ('../config/connection')
var collName = require("../config/collections") 
const bcrypt = require('bcryptjs')
const promise = require('promise')
const { reject, resolve } = require('promise')
const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const res = require('express/lib/response')

module.exports = {
    doSignup:(userData)=>{
        return new promise(async(resolve,reject)=>{
            
            let respo ={}
            userData.password =await bcrypt.hash(userData.password,10)
            db.get().collection(collName.user_collection).findOne({$or:[{email:userData.email},{firstname:userData.firstname}]}).then((status)=>{
                if(status){
                    respo.status=true
                    resolve(respo)
                }else{
                    db.get().collection(collName.user_collection).insertOne(userData)
                    resolve({status:false})
                }
            })
                
            
            })
            
        
    },


    doLogin:(loginData)=>{
        return new promise(async(resolve,reject)=>{
            let Status = false
            let response= {}
            let user = await db.get().collection(collName.user_collection).findOne({email:loginData.email})
            if(user){
               
                bcrypt.compare(loginData.password,user.password).then((status)=>{
                    
                    if(status){
                        response.user = user
                        response.status =true
                        resolve(response)
                        
                    }else{
                        resolve({status:false})
                    }

                })  
            }else{
                console.log("login failed");
                resolve({status:false})
            }
        })
    },

    getSearched:(sqft,floor,beds,baths)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.plan_collection).find({sqft:sqft,floor:floor,beds:beds,baths:baths}).toArray().then((response)=>{
                resolve(response)
            })
        });
    },
    getElivations:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.plan_collection).find().toArray().then((response)=>{
                resolve(response)
            })
        });
    },

    getPrice:(id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.plan_collection).findOne({_id:ObjectId(id)}).then((response)=>{
                resolve(response.price)
            })
        });
    },

    addPayment:(details,userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.payment_collection).insertOne(details).then((response)=>{
                db.get().collection(collName.plan_collection).updateOne({_id:ObjectId(details.planId)},{
                    $push:{
                        userId:userId
                    }
                })
            }).then((response)=>{
                resolve(response)
            })
        });
    },

    getUserPlans:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.plan_collection).find({userId:userId}).toArray().then((response)=>{
                console.log(response);
                resolve(response)
            })
        });
    },


    addContact:(message)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.contact_collection).insertOne(message).then((response)=>{
                resolve(response)
            })
        });
    },

    getAllContact:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.contact_collection).find().toArray().then((response)=>{
                resolve(response)
            })
        });
    },

    addCollege:(collegeData)=>{
        return new promise(async(resolve,reject)=>{
            let respo ={}
            collegeData.password =await bcrypt.hash(collegeData.password,10)
            db.get().collection(collName.colleges_collection).findOne({$or:[{email:collegeData.email},{archiName:collegeData.archiName}]}).then((status)=>{
                if(status){
                    respo.status=true
                    resolve(respo)
                }else if(collegeData.permission === 'false'){
                        
                        db.get().collection(collName.colleges_collection).insertOne(collegeData).then((response)=>{
                            resolve(response.insertedId)
                        })
                        
                    }else{
                        respo.reg="false"
                        resolve(respo)
                    }
                    
                
            })
                
            
            })
            
        
    },

    collegeLogin:(collegeLoginData)=>{
        return new promise(async(resolve,reject)=>{
            let Status = false
            let response= {}
            let college = await db.get().collection(collName.colleges_collection).findOne({email:collegeLoginData.email})
            if(college){
               
                bcrypt.compare(collegeLoginData.password,college.password).then((status)=>{
                    
                    if(status&&college.permission ==="true"){
                        response.college = college
                        response.status =true
                        resolve(response)
                        
                    }else{
                        resolve({status:false})
                    }

                })  
            }else{
                console.log("login failed");
                resolve({status:false})
            }
        })
    },
    
    getRequest:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.colleges_collection).find({permission:"false"}).toArray().then((response)=>{
                resolve(response)
            })
        });
    },

    
}
