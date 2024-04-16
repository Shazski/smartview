var db = require ('../config/connection')
var nodemailer = require('nodemailer')
var collName = require("../config/collections") 
var promise = require("promise")
const { resolve, reject } = require('promise')
const { response } = require('express')
const async = require('hbs/lib/async')
var objectId = require('mongodb').ObjectId

module.exports ={

    addProducts:(product,callback)=>{
        db.get().collection('adminpro').insertOne(product).then((data)=>{
            callback(data.insertedId)
        })
    },
    getallProducts:()=>{
        return new promise(async(resolve,reject)=>{
            let product =await db.get().collection(collName.plan_collection).find().toArray()
            resolve(product)
        })
    },
    getallArchiPlans:(id)=>{
        return new promise(async(resolve,reject)=>{
            let product =await db.get().collection(collName.plan_collection).find({archiId:id}).toArray()
            resolve(product)
        })
    },
    deleteProduct:(proId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.plan_collection).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    productDetails:(proId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.plan_collection).findOne({_id:objectId(proId)}).then((products)=>{
                resolve(products)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.plan_collection)
            .updateOne({_id:objectId(proId)},
            {$set:{
                planNumber:proDetails.planNumber,
                sqft:proDetails.sqft,
                floor:proDetails.floor,
                beds:proDetails.beds,
                baths:proDetails.baths,
                price:proDetails.price,
            }}).then((response)=>{
                resolve(response)
            })
            
        })
    },
   
    getAllUsers:()=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.user_collection).find().toArray().then((response)=>{
                resolve(response)
            })
        })
    },


    getCount:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collName.user_collection).find().count().then((response)=>{
                resolve(response)
            })
        });
    },


    deleteReq:(collegeDeleteId)=>{
        return new promise((resolve,reject)=>{
            db.get().collection(collName.colleges_collection).updateOne({_id:objectId(collegeDeleteId)},{
                $set:{
                    permission:"rejected"
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    approveReq:(collegeEmail,collegeId)=>{
       return new promise((resolve,reject)=>{
        var transporter = nodemailer.createTransport({
            secure: true,
            port: 465,
            service: 'gmail',
            auth: {
              user: "ecommerce1419@gmail.com",
              pass: "iqtyaldszzgoweap"
            }
          });
          
          var mailOptions = {
            from: 'ecommerce1419@gmail.com',
            to: collegeEmail,
            subject: 'College registration Approval',
            text: 'Your are approved by admin! Now you can login"'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              resolve('mail not sent')
            } else {
                console.log('Email sent: ' + info.response);
                db.get().collection(collName.colleges_collection).updateOne({_id:objectId(collegeId)},{
                    $set:{
                        permission:"true"
                    }
                }).then((response)=>{
                    resolve(response)
                })
            }
          });
          
       })
    },
}