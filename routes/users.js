var express = require('express');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
const { response, render } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper =  require('../helpers/product-helpers')
var userHelper = require ('../helpers/user-helpers');
const { route } = require('./admin');
const verifyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
const verifyarchi = (req,res,next)=>{
  if(req.session.college){
    next()
  }else{
    res.redirect('/archi-login')
  }
}

router.get('/',verifyLogin, async function(req, res, next) {
  let user = req.session.user
    res.render('user/view-products',{admin:false,user}); 
  
});

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
    
  }else{
    res.render('user/user-login',{'loginerror':req.session.loginErr})
    req.session.loginErr = false
  }
    
})

router.get('/signup',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/user-signup')

  }
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((respo)=>{
    
    if(respo.status){
      emailExits="Email or Username already taken.Try different username or email"
      res.render('user/user-signup',{emailExits})
    }else{
      res.redirect('/login')
    }
  })
})
    
  


router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or password!please check it"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.loggedIn=null
  res.redirect('/')
})

router.post('/filter',(req,res)=>{
  req.session.sqft = req.body.sqft
  req.session.floor = req.body.floor
  req.session.beds = req.body.beds
  req.session.baths = req.body.baths
  res.redirect('/view-searched-elivations')
})

router.get('/view-searched-elivations',verifyLogin,async(req,res)=>{
  let elivations = await userHelper.getSearched(req.session.sqft,req.session.floor,req.session.beds,req.session.baths)
  res.render('user/view-elivations',{elivations,user:req.session.user})
})
router.get('/elivations',verifyLogin,async(req,res)=>{
  let elivations = await userHelper.getElivations()
  res.render('user/view-elivations',{elivations,user:req.session.user})
})

router.get('/payment/:id',verifyLogin,async(req,res)=>{
  id = req.params.id
  userId = req.session.user._id
  let price = await userHelper.getPrice(id)
  res.render('user/payment',{price,userId,id,user:req.session.user})
})

router.post('/payment',(req,res)=>{
  userHelper.addPayment(req.body,req.session.user._id).then((response)=>{
    res.redirect('/congrats')
  })
})

router.get('/congrats',verifyLogin,(req,res)=>{
  res.render('user/congrats',{user:req.session.user})
})

router.get('/my-plans',verifyLogin,async(req,res)=>{
  let plans = await userHelper.getUserPlans(req.session.user._id)
  res.render('user/my-plans',{plans,user:req.session.user})
})
router.get('/plan-details/:id',verifyLogin,async(req,res)=>{
  id= req.params.id
  res.render('user/images',{id,user:req.session.user})
})

router.get('/contact',verifyLogin,(req,res)=>{
  res.render('user/contact',{user:req.session.user})
})

router.post('/contact',(req,res)=>{
  userHelper.addContact(req.body).then((response)=>{
    res.redirect('/contact')
  })
})

router.get('/archi-reg',(req,res)=>{
  res.render('user/archi-reg')
})
router.post('/archi-reg',(req,res)=>{
  userHelper.addCollege(req.body).then((respo)=>{
    if(respo.status){
      emailExits="Email or Username already taken.Try different username or email"
      res.render('user/archi-reg',{emailExits})
    }else if(respo.reg){
      wrongAdmincode="Admincode is wrong please contact with admin"
            res.render('user/archi-reg',{wrongAdmincode})
    } else{
      let image = req.files.image
      image.mv('./public/images/'+respo+'.jpg')
      res.redirect('/archi-login')
    }
  })
})


router.get('/archi-login',(req,res)=>{
  res.render('user/archi-login',{loginerr:req.session.loginErr})
})
router.post('/archi-login',(req,res)=>{
  userHelper.collegeLogin(req.body).then((response)=>{
    if(response.status){
      req.session.collegeLogin=true
      req.session.college = response.college
      college=req.session.college
      res.redirect('archi-index')
    }else{
      req.session.loginErr="You are not approved By admin"
      res.redirect('/archi-login')
    }
  })
})

router.get('/archi-index',verifyarchi,async(req,res)=>{
 let plans = await productHelpers.getallArchiPlans(req.session.college._id)
  res.render('user/archi-index',{plans})
})
router.get("/add-archi-elivations",(req,res)=>{
  let archiId = req.session.college._id
  let contact = req.session.college.mobile
  res.render('user/add-archiplans',{archiId,contact})
})

router.post('/add-archi-elivations',(req,res)=>{
  productHelper.addProducts(req.body,(id)=>{
    let image = req.files.image
    image.mv('./public/images/'+id+'.jpg')
    let plan1 = req.files.plan1
    plan1.mv('./public/plan1/'+id+'.jpg')
    let plan2 = req.files.plan2
    plan2.mv('./public/plan2/'+id+'.jpg')
    let plan3 = req.files.plan3
    plan3.mv('./public/plan3/'+id+'.jpg')
    res.render('user/add-archiplans',{admin:false})
  })

})


module.exports =router
