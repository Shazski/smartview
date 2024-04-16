var express = require('express');
const async = require('hbs/lib/async');
const { response } = require('../app');
const adminHelper = require('../helpers/admin-helper');
var router = express.Router();
var productHelpers= require('../helpers/product-helpers');
const { getAllShippedProducts } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
var user=require('../routes/users')
const verifyLogin = (req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/admin-login')
  }
}

router.get('/',verifyLogin,async function(req, res) {
  if(req.session.loggeIn){
    let count = await productHelpers.getCount()
    let admin=req.session.admin
    productHelpers.getallProducts().then((products)=>{
    res.render('admi/view-products',{admin,products,count});
  })
  }else{
    res.render('admi/admin-login')
  }
});

router.get("/admin-login",(req,res)=>{
    res.render('admi/admin-login')
})

router.post("/admin-login",(req,res)=>{
  adminHelper.adminLogin(req.body).then((adminres)=>{
    if(adminres.stat){
      req.session.loggeIn=true
      req.session.admin=adminres.admin
      res.redirect('/admin')
    }else{
      res.render('admi/admin-login')
    }
  })
})

router.get('/add-elivations',verifyLogin,(req,res)=>{
  res.render('admi/add-elivations',{admin:true})
})

router.post('/add-elivations',(req,res)=>{
  productHelpers.addProducts(req.body,(id)=>{
    let image = req.files.image
    image.mv('./public/images/'+id+'.jpg')
    let plan1 = req.files.plan1
    plan1.mv('./public/plan1/'+id+'.jpg')
    let plan2 = req.files.plan2
    plan2.mv('./public/plan2/'+id+'.jpg')
    let plan3 = req.files.plan3
    plan3.mv('./public/plan3/'+id+'.jpg')
    res.render('admi/add-elivations',{admin:true})
  })

})

router.get('/delete-products/:id',(req,res)=>{
  let proId =req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})

router.get('/edit-products/:id',verifyLogin,async(req,res)=>{
  let newPro =await productHelpers.productDetails(req.params.id)
    res.render('admi/edit-products',{admin:true,newPro})
})    

router.get('/admin-logout',(req,res)=>{
  req.session.admin=null
  req.session.loggeIn=null
  res.redirect('/admin')
})

router.post('/edit-products/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let id = req.params.id
      let image = req.files.image
    image.mv('./public/images/'+id+'.jpg')
    }
  })
})

router.get('/all-users',verifyLogin,async(req,res)=>{
 let users =await productHelpers.getAllUsers()
 res.render('admi/all-users',{users,admin:true})
})

router.get('/messages',verifyLogin,async(req,res)=>{
  let message = await userHelpers.getAllContact()
  res.render('admi/messages',{message,admin:true})
})

router.get('/delete-req/:id',(req,res)=>{
  let collegeDeleteId =req.params.id
  productHelpers.deleteReq(collegeDeleteId).then((response)=>{
    res.redirect('/admin/archi-request')
  })
})

router.get('/approve-req/',(req,res)=>{
  let collegeEmail=req.query.email
  let collegeId=req.query.id
  productHelpers.approveReq(collegeEmail,collegeId).then((response)=>{
    res.redirect('/admin/archi-request')
  })
})

router.get('/archi-request',verifyLogin,async(req,res)=>{
  let request = await userHelpers.getRequest()
  res.render('admi/archi-request',{request,admin:true})
})


router.get('/archi-index',verifyLogin, function(req, res) {
  if(req.session.loggeIn){
    let admin=req.session.admin
    productHelpers.getAllPlans().then((colleges)=>{

      res.render('admi/archi-index',{admin,colleges});
    })

  }else{
    res.render('admi/admin-login')
  }
});


module.exports = router;
