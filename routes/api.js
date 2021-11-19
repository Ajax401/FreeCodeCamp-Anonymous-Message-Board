'use strict';
const mongodb = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');
const blogData = require('../models/mySchema.js');

const MONGODB_CONNECTION_STRING = process.env.DB;
module.exports = function (app) {
   mongoose.connect( MONGODB_CONNECTION_STRING, { useNewUrlParser: true })
  .then(() => console.log("MongoDb connected"))
  .catch(err => console.log(err));
  app.route('/api/threads/:board')
  .post((req,res)=>{
    let {board,text,delete_password} = req.body;
    
    let myChat = '',
        myContext = text,
        myCurrentDate = new Date().toUTCString(),
        editDate = new Date().toUTCString(),
        removeBlog = delete_password;
        !board||board === ''?myChat = req.params.board:myChat = board; //console.log(myChat)   
  
    let blogger = new blogData({
      board:myChat,
      text:myContext,
      created_on:myCurrentDate,
      bumped_on:editDate,
      reported:false,
      delete_password:removeBlog
    })
    blogger.save((err,info)=>{
      if(!err && info){
			return res.redirect('/b/' + info.board + '/' + info.id)
		}
    })
    
  }).get((req,res)=>{
     let title = req.params.board;
     //console.log(title)
     let findMe = {
       board:title
     };
  
    blogData.exists(findMe).then((data)=> {
      if(data){
       blogData.find(findMe,"-__v -delete_password -reported -replies.delete_password -replies.reported",{lean:true,limit:10}).sort({"bumped_on":-1}).then((data)=>{
           
          data.forEach((info)=>{
           info['replycount'] = info.replies.length; 
           info.replies = info.replies.slice(0,3)
         })
         res.status(200).json(data)
        
       })
      }else{
        res.json({
          err:'No such thread exists!'
        })
      }
      }).catch(err => 'Following error ocurred ' + err)   
  })
  .delete((req,res)=>{
    //console.log(req.body);
    let {board,thread_id,delete_password} = req.body;
    let myId = thread_id,
        myChat = board,
        removeBlog = delete_password;
        
    let findMe = {
        _id:myId,
        board:myChat,
        delete_password:removeBlog
    };
    let objectTest = mongoose.isValidObjectId(thread_id);
    if(objectTest){
       blogData.exists({$and:[{_id:myId},{board:myChat},{delete_password:removeBlog}]}).then((found)=>{
    if(found){
    blogData.deleteOne(findMe).then(
      res.status(200).json("success"))
    }
    if(!found){
       res.status(200).json("incorrect password")
    }
  }).catch(err => 'Following error ocurred ' + err)
    }
  
    if(!objectTest){
      res.json('err: No such thread exists!')
   }

  })
  .put((req,res)=>{
    //console.log(req.body)
    let {board,thread_id} = req.body;
    let objectTest = mongoose.isValidObjectId(thread_id);
    if(objectTest){
    let myId = thread_id, 
        myChat = board;
    let update = {
      $set:{
        reported:true
      }
    }    
    blogData.findOneAndUpdate({$and:[{_id:myId},{board:myChat}]},update).then((found)=>{
      if(found){
      res.status(200).json('success')
      }else{
         res.json('err: No such thread exists!')
     }
     
    })
   }
   
   if(!objectTest){
      res.json('err: No such thread exists!')
   }

  })
  .put((req,res)=>{
    //console.log(req.body)
    let {board,thread_id} = req.body;
    let objectTest = mongoose.isValidObjectId(thread_id);
    if(objectTest){
    let myId = thread_id, 
        myChat = board;
    let update = {
      $set:{
        reported:true
      }
    }    
    blogData.findOneAndUpdate({$and:[{_id:myId},{board:myChat}]},update).then((found)=>{
      if(found){
      res.status(200).json('success')
      }else{
         res.json('err: No such thread exists!')
     }
     
    })
   }
   
   if(!objectTest){
      res.json('err: No such thread exists!')
   }

  })
  ;
    
  app.route('/api/replies/:board')
  .post((req,res)=>{
    
   let {board,thread_id,text,delete_password} = req.body;
  
   let objectTest = mongoose.isValidObjectId(thread_id);   
   if(objectTest){
        let myChat = board,
        myContext = text,
        editDate = new Date().toUTCString(),
        myCurrentDate = new Date().toUTCString(),
        removeBlog = delete_password;
        !board||board === ''?myChat = req.params.board:myChat = board;
    let findMe = {
      _id:thread_id,
      board:myChat
    };
    let update = {
      $set:{
        bumped_on:editDate
      },
       $push:{
        replies: {
       _id:ObjectId(),
        text:myContext,
        created_on:editDate,
        delete_password:removeBlog,
        reported:false
    } 
       }
      }
    
    blogData.findOneAndUpdate({$and:[{_id:thread_id,board:myChat}]},update,{new:true}).then((found)=>{
      if(found){
        return res.redirect('/b/' + found.board + '/' + found.id) 
      }else{
        res.json({
          err:'No such thread exists!'
        })
      }
    })
   }

   if(!objectTest){
       res.json({
          err:'No such thread exists!'
        })
   }
  }).get((req,res)=>{
   let title_id;
   
   let objectTest =  mongoose.isValidObjectId(req.query.thread_id);
  
   if(objectTest){
    title_id = req.query.thread_id;
    let findMe = {
     _id:title_id,
   };
   blogData.findById(findMe,"-__v -delete_password -reported -replies.delete_password -replies.reported",{lean:true}).then((found)=>{
     if(found){
     res.json(found)
     }else{
         res.json({
          err:'No such thread exists!'
        })
     }
     }).catch(err => 'Following error ocurred ' + err)
   }
   if(!objectTest){
     res.json({
          err:'No such thread exists!'
        })
   }
}).delete((req,res)=>{
  
  let {board,thread_id,reply_id,delete_password} = req.body;
  let myId = thread_id,
      myChat = board,
      replyMeId = reply_id,
      removeBlog = delete_password,
      editText = '[deleted]';
   
    let update = {
      $set:{
        'replies.$.text':editText
      }
    }
    
   blogData.findOneAndUpdate({ _id:myId,
       board:myChat,replies:{$elemMatch:{
      _id:replyMeId,
       delete_password:removeBlog
   }}
      },update).then((found)=>{
     console.log(found)
     if(found){
       res.status(200).json("success")
     }
     if(!found){
       res.status(200).json("incorrect password")
     }
   })
})
.put((req,res)=>{
  //console.log(req.body);
  let {board,thread_id,reply_id} = req.body;
  let objectTest = mongoose.isValidObjectId(thread_id);
  let objectTest1 = mongoose.isValidObjectId(reply_id);
  let update = {
      $set:{
        'replies.$.reported':true
      }
    }
  if(objectTest&&objectTest1){
    let myChat = board,
        myId = thread_id,
        replyMeId = reply_id; 
     blogData.findOneAndUpdate({ _id:myId,
       board:myChat,replies:{$elemMatch:{
      _id:replyMeId   
   }}},update).then((found)=>{
     if(found){
       res.status(200).json('success')
     }
     if(!found){
       res.json('err: No such thread exists!')
     }
   })
  }
  if(!objectTest&&!objectTest1){
     res.json('err: No such thread exists!')
   }
})

  ;

};