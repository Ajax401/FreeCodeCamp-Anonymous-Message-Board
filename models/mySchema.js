const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = ({

 _id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  text:{
    type:String,
    required:true
  },
  created_on:{
    type:Date,
    required:true
    },
    bumped_on:{
     type:Date,
     required:true
    },
    delete_password:{
     type:String,
     required:true
   },
    reported:{
      type:Boolean,
      default:false
    }

})

const blogSchema = ({

  board:{
     type:String,
     required:true
   },
   text:{
     type:String,
     required:true
   },
   created_on:{
     type:Date,
     required:true
   },
   bumped_on:{
     type:Date,
     required:true
   },
   reported:{
     type:Boolean,
     default:false
   },
   delete_password:{
     type:String,
     required:true
   },
   replies:[replySchema]

})

const mySchema = mongoose.model('blogData',blogSchema);
module.exports = mySchema;