require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var moment = require('moment');
var enforce = require('express-sslify');
let push = require('web-push'); 
const app = express();
app.use(enforce.HTTPS({ trustProtoHeader: true }));

let tempUsn='';

//setting up view engine
app.set('view engine','ejs');
app.use(express.static('public'));


//body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("body-parser").json())

//mongo connections
//mongoose.connect('mongodb://localhost:27017/hostelapp');
mongoose.connect(process.env.MONGODB_URL,{ useNewUrlParser: true },{ useUnifiedTopology: true });

//keys for notification
let vapidkeys={
  publicKey: process.env.VAP_ID_PUBLIC,
  privateKey: process.env.VAP_ID_PRIVATE
}

//database schemeas
const userSchema = new mongoose.Schema({
	usn:String,
	name:String,
	email:String,
	phone:Number,
	branch:String,
	floor:String,
	room:String,
	admission:String,
	subkey:String,
}); 
const inoutSchema = new mongoose.Schema({
	usn:String,
	status:String,
	day:String,
	date:String,
	time:String,
	destination:String,
});
const complaintSchema = new mongoose.Schema({
	usn:String,
	date:String,
	department:String,
	description:String,
});
const applicationSchema = new mongoose.Schema({
	usn:String,
	date:String,
	subject:String,
	to:String,
	body:String,
}); 
const noticeSchema = new mongoose.Schema({
	date:String,
	subject:String,
	from:String,
	body:String,
});
const palrequired = new mongoose.Schema({
	date:String,
	name:String,
	number:String,
	requiredfor:String,
	numberofpeople:Number,
	message:String,
	expirein:Number,
});
const alumniSchema = new mongoose.Schema({
	name:String,
	number:String,
	interests:String,
	skills:String,
	tech:String,
	fb:String,
	insta:String,
	twitter:String,
	linkedin:String,
	github:String,
	website:String,
	rooms:String,
	password:String,
});

const NewUser = mongoose.model('User',userSchema);
const Newinout = mongoose.model('Inout',inoutSchema);
const Newcomplaint = mongoose.model('Complaint',complaintSchema);
const Newapplication = mongoose.model('Application',applicationSchema);
const Newnotice = mongoose.model('Notice',noticeSchema);
const Newpal = mongoose.model('Pal',palrequired);
const Newalumni = mongoose.model('Alumni',alumniSchema);

//all get routes
app.get('/',(req,res)=>{
	res.render('dashboard');
});
app.get('/register',(req,res)=>{
	res.render('registeration',{status2:'disabled',status1:"",error:"",usnvalue:""});
});
app.get('/editProfile',(req,res)=>{
	res.render('editProfile',{status2:'disabled',status1:"",error:"",usnvalue:""});
});
app.get('/downloadapk',(req,res)=>{
	res.render('confermationsanderrors/downloadpage',{picture:7,message:"Press download button to begin download"});
});
app.get('/aboutapplication',(req,res)=>{
	res.render('aboutapp');
});
						/////////inout
app.get('/inout',(req,res)=>{
	res.render('inout/inOut',{status2:'disabled',status1:"",error:"",usnvalue:""});
});
app.get('/goingout',(req,res)=>{
	res.render('inout/goingout',{day:moment().format('dddd'),date:moment().format('YYYY-MM-D'),time:moment().format('LT')});
});
app.get('/commingin',(req,res)=>{
	res.render('inout/commingin',{day:moment().format('dddd'),date:moment().format('YYYY-MM-D'),time:moment().format('LT')});
});
						////////////complaint
app.get('/complaint',(req,res)=>{
	res.render('complaint/complaint',{status2:'disabled',status1:"",error:"",usnvalue:""});
});						
						////////////application
app.get('/application',(req,res)=>{
	res.render('application/application',{status2:'disabled',status1:"",error:"",usnvalue:""});
});
						////////////notice
app.get('/notice',(req,res)=>{
	res.render('notices/searchnotice');
});
						////////////authorizeddashboard
app.get('/authorized',(req,res)=>{
	res.render('authorized/authorizedpassword');
});	
app.get('/inoutsearch',(req,res)=>{
	res.render('authorized/inouts/inoutsearch');
});
app.get('/complaintsearch',(req,res)=>{
	res.render('authorized/complaint/complaintsearchpage');
});
app.get('/applicationsearch',(req,res)=>{
	res.render('authorized/appli/applisearch');
});
app.get('/sendnotice',(req,res)=>{
	res.render('authorized/sendnotice/sendnotice');
});
app.get('/usnsearch',(req,res)=>{
	res.render('authorized/usnloockup/usnsearchpage');
});
/////////////////////////////////////////////////friends and fun/////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/palrequired',(req,res)=>{
	Newpal.find((err,ads)=>{
		if (err) console.log(err)
		else {
			adarray=[];
			todelete=[];
			 ads.forEach(ad=>{
					checktodelete(ad)?adarray.push(ad):todelete.push(ad);
					})
			 deletead(todelete);
			res.render('friendsandfun/palrequired/paldashboard',{data:adarray});

		}
	});
});
app.get('/palcreate',(req,res)=>{
	res.render('friendsandfun/palrequired/palcreate');
});
app.get('/alumni',(req,res)=>{
	Newalumni.find((err,alumni)=>{
		if (err) console.log(err)
		else
			res.render('friendsandfun/alumni/alumnidashboard',{data:alumni});
	});
});
app.get('/alumnicreate',(req,res)=>{
	res.render('friendsandfun/alumni/alumnicreate');
});


//all post routes
app.post('/verifiedusn',(req,res)=>{
	NewUser.find((error,user)=>{
		if(error)
			res.render('registeration',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
		else{
				if(checkUsnAlreadyExist(req.body.usn.toUpperCase(),user)==1)
				{
					error = "usn already exists contact developer for details.";
					res.render('registeration',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
				}
				else {
					tempUsn = req.body.usn.toUpperCase();
					error = `Usn verified, fill details.`
					res.render('registeration',{status2:'',status1:"disabled",error:error,usnvalue:req.body.usn.toUpperCase()});
					}
			}
	})
		
});

app.post('/newuser',(req,res)=>{
	const user1 = new NewUser({
		usn:tempUsn,
		name:req.body.name,
		email:req.body.email,
		phone:req.body.phone,
		branch:req.body.branch,
		floor:req.body.floor,
		room:req.body.room,
		admission:req.body.admission,
		subkey:req.body.subscription,
	});
	user1.save();
	sendNotification("Welcome Onboard",`Hi! ${user1.name} This is how your notfications will look, keep an eye on them.`,user1.subkey);
	res.render('confermationsanderrors/createeditprofile',{message:'USN added successfully',picture:1});
});
                                   //////authorized section entry
app.post('/showauthdashboard',(req,res)=>{
	(req.body.Password=="jsshostel123")?res.render('authorized/authorized'):res.send('<h1>Incorrect password</h1>');
	
});                                   

                                    //////editingprofiles
app.post('/verifyediting',(req,res)=>{
	NewUser.find((error,user)=>{
		if(error)
			res.render('editProfile',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
		else{
				if(checkUsnAlreadyExist(req.body.usn.toUpperCase(),user)==1)
				{
					tempUsn = req.body.usn.toUpperCase();
					error = "Usn exists, edit details.";
					res.render('editProfile',{status2:'',status1:"disabled",error:error,usnvalue:req.body.usn.toUpperCase()});
				}
				else {
					error = `Usn does not exist. Register first.`
					res.render('editProfile',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
					}
			}
	})
		
});    
app.post('/confirmediting',(req,res)=>{
	NewUser.updateOne({usn:tempUsn},{
						name:req.body.name,
						email:req.body.email,
						phone:req.body.phone,
						branch:req.body.branch,
						floor:req.body.floor,
						room:req.body.room,
						admission:req.body.admission
					},(error)=>{if(error)console.log(error);}
					);

	res.render('confermationsanderrors/createeditprofile',{message:'USN edited successfully',picture:1});
});      


                                    //////inout register
app.post('/verifyinout',(req,res)=>{
	NewUser.find((error,user)=>{
		if(error)
			res.render('inout/inOut',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
		else{
				if(checkUsnAlreadyExist(req.body.usn.toUpperCase(),user)==1)
				{
					tempUsn = req.body.usn.toUpperCase();
					error = "Usn found, select from options.";
					res.render('inout/inOut',{status2:'',status1:"disabled",error:error,usnvalue:req.body.usn.toUpperCase()});
				}
				else {
					error = `Usn does not exist. Register first.`
					res.render('inout/inOut',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
					}
			}
	})
		
});                                      
app.post('/confirminout',(req,res)=>{
	const inout1 = new Newinout({
		usn:tempUsn,
		status:req.body.status,
		day:req.body.day,
		date:req.body.date,
		time:req.body.time,
		destination:req.body.destination
	});
	inout1.save();
	res.render('confermationsanderrors/createeditprofile',{message:'Register updated successfully',picture:2});
});


                                    //////complaint
app.post('/verifycomplaint',(req,res)=>{
	NewUser.find((error,user)=>{
		if(error)
			res.render('complaint/complaint',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
		else{
				if(checkUsnAlreadyExist(req.body.usn.toUpperCase(),user)==1)
				{
					tempUsn = req.body.usn.toUpperCase();
					error = "Register your complaint. Date is being recorded.";
					res.render('complaint/complaint',{status2:'',status1:"disabled",error:error,usnvalue:req.body.usn.toUpperCase()});
				}
				else {
					error = `Usn does not exist. Register first.`
					res.render('complaint/complaint',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
					}
			}
	})
		
});                                      
app.post('/confirmcomplaint',(req,res)=>{
	const complaint1 = new Newcomplaint({
		usn:tempUsn,
		date:moment().format('YYYY-MM-D'),
		department:req.body.department,
		description:req.body.description,
	});
	complaint1.save();
	res.render('confermationsanderrors/createeditprofile',{message:'Complaint updated successfully',picture:3});
});
                                    //////application
app.post('/verifyapplication',(req,res)=>{
	NewUser.find((error,user)=>{
		if(error)
			res.render('application/application',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
		else{
				if(checkUsnAlreadyExist(req.body.usn.toUpperCase(),user)==1)
				{
					tempUsn = req.body.usn.toUpperCase();
					error = "Write application. Date is being recorded.";
					res.render('application/application',{status2:'',status1:"disabled",error:error,usnvalue:req.body.usn.toUpperCase()});
				}
				else {
					error = `Usn does not exist. Register first.`
					res.render('application/application',{status2:'disabled',status1:"",error:error,usnvalue:req.body.usn.toUpperCase()});
					}
			}
	})
		
});                                      
app.post('/confirmapplication',(req,res)=>{
	const application1 = new Newapplication({
		usn:tempUsn,
		date:moment().format('YYYY-MM-D'),
		subject:req.body.subject,
		to:req.body.to,
		body:req.body.body,
	});
	application1.save();
	res.render('confermationsanderrors/createeditprofile',{message:'Application sent successfully',picture:4});
});
                           /////////inout register search result
app.post('/showinout',(req,res)=>{
	let regexp = new RegExp(`${req.body.month}-`,'g');
	Newinout.find({"date":{$regex:regexp}},(error,inout)=>{
		if(error)console.log(error);
		else{
			res.render('authorized/inouts/inoutview',{data:inout});
		}
	});
});

                           /////////complaint register search result
app.post('/showcomplaint',(req,res)=>{
	let regexp = new RegExp(`${req.body.month}-`,'g');
	Newcomplaint.find({$and:[{"date":{$regex:regexp}},{"department":req.body.department}]},(error,complaint)=>{
		if(error)console.log(error);
		else{
			res.render('authorized/complaint/complaintsearchresults',{data:complaint});
		}
	});
});
app.post('/deletecomplaint',(req,res)=>{

	Newcomplaint.deleteOne({_id:req.body.s2},(err)=>{
		if(err)
			console.log(err);
		else{
			let department=req.body.complaintdepartment;
			let name="";
			let notificationkey="";
			NewUser.findOne({"usn":req.body.complaintusn},(error,person)=>{
				if(error)console.log(error);
				else {name=person.name;
					  notificationkey=person.subkey;
					  console.log(name+notificationkey);
					  sendNotification('Complaint Solved',`Hi ${name}!, Your complaint related to ${department} seems to be solved, Please contact hostel athority for further details`,notificationkey);
				}
			})
			console.log('deleted successfully');
		}
	})
});
                           /////////application search result
app.post('/showapplication',(req,res)=>{
	let regexp = new RegExp(`${req.body.month}-`,'g');
	Newapplication.find({"date":{$regex:regexp}},(error,application)=>{
		if(error)console.log(error);
		else{
			res.render('authorized/appli/appliview',{data:application});
		}
	});
});
						///////////////write new notce save
app.post('/confirmnotice',(req,res)=>{
	const notice1 = new Newnotice({
		date:moment().format('YYYY-MM-D'),
		subject:req.body.subject,
		from:req.body.from,
		body:req.body.body,
	});
	notice1.save();
	NewUser.find((error,person)=>{
				if(error)console.log(error);
 				else {
 					person.forEach((ele)=>{
 						name=ele.name;
 						subject=req.body.subject;
						from=req.body.from;
						notificationkey=ele.subkey;
						sendNotification(`New notice from ${from}`,`${name}, ${subject}`,notificationkey);
 					})
				}
			});
	res.send('Notice sent successfully!');
});						
                           /////////view notice on main dashboard
app.post('/shownotice',(req,res)=>{
	let regexp = new RegExp(`${req.body.month}-`,'g');
	Newnotice.find({"date":{$regex:regexp}},(error,application)=>{
		if(error)console.log(error);
		else{
			res.render('notices/viewnotice',{data:application});
		}
	});
});
app.post('/showusn',(req,res)=>{
	console.log(req.body.usn);
	NewUser.findOne({"usn":req.body.usn.toUpperCase()},(error,user)=>{
		if(error)console.log(error);
		else{
			res.render('authorized/usnloockup/usnsearchresults',{ele:user});
		}
	});
});
/////////////////////////////////////////////////friends and fun/////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/confirmpal',(req,res)=>{
	const pal1 = new Newpal({
			date:moment().format('YYYY-MM-D'),
			name:req.body.name,
			number:req.body.phone,
			requiredfor:req.body.for,
			numberofpeople:req.body.numberofpeople,
			message:req.body.message,
			expirein:req.body.expire,
	});
	pal1.save();
	let filter={};
	req.body.filter!='All'?filter["floor"]=req.body.filter:null;
	NewUser.find(filter,(error,people)=>{
		if(error)console.log(error);
		else people.forEach(ele=>{
			sendNotification(`Pal required for ${req.body.for}`,`Hi ${ele.name}, Looks like ${req.body.name} is planning something interesting.`,ele.subkey);
		});
	});
	res.render('confermationsanderrors/createeditprofile',{message:'Message sent and pinned to wall',picture:5});
});

app.post('/confirmalumni',(req,res)=>{
	const alumni1 = new Newalumni({
		name: req.body.name,
		number: req.body.phone,
		interests: req.body.interests,
		skills: req.body.skills,
		tech: req.body.tech,
		fb: req.body.fb,
		insta: req.body.insta,
		twitter: req.body.twitter,
		linkedin: req.body.linkedin,
		github: req.body.github,
		website: req.body.website,
		rooms: req.body.rooms,
		password: req.body.password,
	});
	alumni1.save();
	res.redirect('/alumni');
});
app.post('/editcard',(req,res)=>{
	Newalumni.findOne({_id:req.body.id},(error,item)=>{
		if(error) console.log(error);
		else {
			if(item.password===req.body.password)
				res.render('friendsandfun/alumni/alumniedit',{
					id:item.id,
					name:item.name,
					phone:item.number,
					interests: item.interests,
					skills: item.skills,
					tech: item.tech,
					fb: item.fb,
					insta: item.insta,
					twitter: item.twitter,
					linkedin: item.linkedin,
					github: item.github,
					website: item.website,
					rooms: item.rooms,
					password: item.password,
				});
			else res.send('incorrect password');
		}
	})
});
app.post('/confirmalumniedit',(req,res)=>{
	Newalumni.updateOne({_id:req.body.id},{		
		name: req.body.name,
		number: req.body.phone,
		interests: req.body.interests,
		skills: req.body.skills,
		tech: req.body.tech,
		fb: req.body.fb,
		insta: req.body.insta,
		twitter: req.body.twitter,
		linkedin: req.body.linkedin,
		github: req.body.github,
		website: req.body.website,
		rooms: req.body.rooms,
		password: req.body.password,},error=>{if(error) console.log(error);});
		res.render('confermationsanderrors/createeditprofile',{message:'Card edited successfully',picture:6});
});


app.listen(process.env.PORT||3000,()=>{
	console.log('server running on port 3000');
})













// --------------------------------------functions

function checkUsnAlreadyExist(receivedUsn,availableusn){	
					let verdict=0;
					availableusn.forEach((obj)=>{
						if(obj.usn==receivedUsn)
						{
							verdict=1;
						}
					});
					return verdict;	
				}

function checktodelete(ad){
	if(moment().add(ad.expirein, 'days').format('YYYY-MM-D')<moment().format('YYYY-MM-D'))
		return false;
	return true;
}
function deletead(adarray){
	adarray.forEach(ele=>{
		Newpal.deleteOne({_id:ele.id},(error)=>{
			if(error)console.log(error);
		})
	})
}				

function sendNotification(title,body,subscription){
		if(subscription!='')
		{
		  push.setVapidDetails('mailto:shukladitya9@gmail.com',vapidkeys.publicKey,vapidkeys.privateKey);
		  console.log(title);
		  console.log(body);
		  console.log(subscription);
	      let payload = JSON.stringify({title:title,body:body});
	      subscription=JSON.parse(subscription);
		  let sub=subscription;
		  push.sendNotification(sub,payload).catch(err=>console.log(err));
		}
		else
			console.log('subscription not present');
}				
