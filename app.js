const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyparser=require('body-parser');
const flash=require('connect-flash');
const session=require('express-session');
const shortid=require('shortid');
const nodemailer=require('nodemailer');
const PORT=process.env.PORT ||3000;


const DBa='mongodb+srv://abdullah:abd123@cluster0.34stq.mongodb.net/empdata?retryWrites=true&w=majority'

mongoose.connect(DBa,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
       
    });

 const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

    console.log("Connected");
});


let employeeschema=new mongoose.Schema({
    empid:{
        type:String,
       default:shortid.generate
    },
    name : String,
    phone : String,
    email:String,
    hobbies:String
});
let Employee=mongoose.model('Employee',employeeschema); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret:"nodejs",
    resave:true,
    saveUninitialized:true
}));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success_msg=req.flash(('success_msg'));
    res.locals.error_msg=req.flash(('error_msg'));
    res.locals.error=req.flash(('error'));
    next();
});



app.get("/",(req,res)=>{
    Employee.find({})
    .then(employee=>{
        res.render('home',{employee:employee});
    }).catch(err=>{
        console.log(err);

    })
   
})


app.get("/employee/new",(req,res)=>{

    res.render('new');
})

app.get("/employee/search",(req,res)=>{
    res.render('search',{employee:""});
});


app.post("/employee/new",(req,res)=>{
    let emp={
       
        name : req.body.empname,
        phone : req.body.pnumber,
        email : req.body.email,
        hobbies:req.body.ehobby
    };
    Employee.create(emp)
    .then(employee=>{
        
            req.flash('success_msg','Employee Added Successfully');
        
       
        res.redirect('/');
        console.log(success_msg);
       
        }).catch(err=>{
           req.flash('error_msg','Employee Cannot be added');
        });
  
});
app.get('/employee',(req,res)=>{
    let querysearch={name:req.query.empname};
    Employee.findOne(querysearch)
    .then(employee=>{
        res.render('search',{employee:employee})
    }).catch(err=>{
        console.log(err);
    })
})
app.get('/edit/:id',(req,res)=>{
    let qry={_id:req.params.id};
    Employee.findOne(qry)
    .then(employee=>{
        res.render('update',{employee:employee});
    }).catch(err=>{
        console.log(err);
    
    });
})
app.get('/delete/:id',(req,res)=>{
    let serachquery={_id : req.params.id};
    Employee.deleteOne(serachquery)
    .then(employee=>{
        req.flash('success_msg','Employee deleted Successfully');
        
       
        res.redirect("/");
    }).catch(err=>{
        req.flash('error_msg','Employee Cannot be deleted');
    })
})
app.post('/edit/:id',(req,res)=>{
    let searchquery={_id:req.params.id};
    Employee.updateOne(searchquery,{$set:{
        name:req.body.empname,
        email:req.body.email,
        phone:req.body.pnumber,
        hobby:req.body.ehobby
    }})
    .then(employee=>{
        req.flash('success_msg','Employee Updated Successfully');
        res.redirect('/');
    }).catch(err=>{
       req.flash('error_msg','Error cannot updated Employee');
    })
 

})
let data='';

var name='';
var id='';
var phone='';
var email='';
var hobby='';
let transport=nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth:{
        user:'abdirfanwork7007@gmail.com',
        pass:'wwaoazdunuktytbk'
    }
});

app.post('/send',async(req,res)=>{
    let selected=req.body.select;
if(!Array.isArray(selected)){
    let abc=await Employee.findOne({_id:selected})
    
        
         
       id=abc.empid;
       name=abc.name;
       phone=abc.phone;
       email=abc.email;
       hobby=abc.hobbies;
       data=`\n${1} Employee\nID: ${id}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nHobby: ${hobby}\n`
       
}
else{
   

   // console.log(index);
   for(let i=0;i<selected.length;i++){
    let abc=await Employee.findOne({_id:selected[i]})
    
        
         
       id=abc.empid;
       name=abc.name;
       phone=abc.phone;
       email=abc.email;
       hobby=abc.hobbies;
       data=data+`\n${i+1} Employee\nID: ${id}\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nHobby: ${hobby}\n`
       
       
       
   
 
    
     
     //arr.push(data);
    
     
     
     
    
    //console.log(arr);
 
 }
}
 console.log(data);
 const mail={
     from:"abdirfanwork@gmail.com",
     to:"abd.irfan7007@gmail.com",
     subject:"Sending Employee Data",
     text:data
     }
 
     transport.sendMail(mail,(err,info)=>{
         if(err){
             console.log(err);
 
         }
         else{
             console.log("Email sent"+ info.response);
             data='';
         }
     })
    
//console.log(data);
  
   
  
})

app.listen(PORT, () => {
    console.log("Started");
})


