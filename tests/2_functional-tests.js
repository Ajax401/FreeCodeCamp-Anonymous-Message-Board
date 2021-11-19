const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

chai.use(chaiHttp);
let myId;
let myPassword = 'milo'; 
suite('Functional Tests', function() {
   test('test for creation of document',(done)=>{
     chai.request(server)
		.post('/api/threads/A new chat/')
    .redirects(0)
		.send({
			board: 'A new chat',
			text: 'Hi there',
			delete_password: myPassword
		})
		.end((err, res) => {
			assert.equal(res.status, 302)
      let divider = res.text;
			divider = divider.split('/');
      myId =  divider[3];
      assert.strictEqual(mongoose.isValidObjectId(myId),true)
			done()
		})
     })
    test('Viewing the 10 most recent threads with 3 replies each',(done)=>{
      chai.request(server)
      .get('/api/threads/first chat/')
		  .end((err, res) => {
			assert.equal(res.status, 200)
      assert.isAtMost(res.body.length,10)
      let arrVal = res.body;
      let lengthTest = arrVal.every((el,i)=>{
        if(el.replies.length <= 3){
          return true
        }
      })
      assert.strictEqual(lengthTest,true)
			done()
		})
    })
    test('Deleting a thread with the incorrect password',(done)=>{
      chai.request(server)
      .delete('/api/threads/A new Chat/')
      .redirects(0)
		  .send({
			 board: 'A new chat',
			 thread_id:myId,
       delete_password:'No password'
		  })
		  .end((err, res) => {
      //console.log(res,body)
       assert.equal(res.status, 200)
			 assert.strictEqual(res.body,'incorrect password')
       done();
		 })
    })
    test('Deleting a thread with the correct password',(done)=>{
      chai.request(server)
      .delete('/api/threads/A new Chat/')
      .redirects(0)
		  .send({
			 board: 'A new chat',
			 thread_id:myId,
       delete_password:myPassword
		  })
		  .end((err, res) => {
      //console.log(res.body)
       assert.equal(res.status, 200)
			 assert.strictEqual(res.body,'success')
       done();
		 })
    })
    test('Reporting a thread',(done)=>{
      chai.request(server)
      .put('/api/threads/first chat/')
      .redirects(0)
		  .send({
			 board: 'first chat',
			 thread_id:'6196686acfbf88946c197e2a',
		  })
		  .end((err, res) => {
       assert.equal(res.status, 200)
       assert.strictEqual(res.body,'success')
       done();
		 })
    })
    test('Creating a new reply',(done)=>{
      chai.request(server)
      .post('/api/replies/first chat/')
      .redirects(0)
		  .send({
			 board: 'first chat',
			 thread_id:'6196686acfbf88946c197e2a',
       text:'How are you',
       delete_password:'Mito'
		  })
		  .end((err, res) => {
       //console.log(res)
       assert.equal(res.status, 302)
       assert.strictEqual(res.text,'Found. Redirecting to /b/first%20chat/6196686acfbf88946c197e2a')
       done();
		 })
    })
    test('Viewing a single thread with all replies',(done)=>{
      chai.request(server)
      .get('/api/replies/first chat/')
      .redirects(0)
		  .query({
			 thread_id:'6195de62ccc1ad3658923f9b',
		  })
		  .end((err, res) => {
       //console.log(res)
       assert.equal(res.status,200)
       assert.strictEqual(res.body._id,'6195de62ccc1ad3658923f9b')
       assert.strictEqual(res.body.board,'first chat')
       assert.strictEqual(res.body.replies.length,2)
       done();
		 })
    })
    test('Deleting a thread with the incorrect password',(done)=>{
      chai.request(server)
      .delete('/api/replies/fist chat/')
      .redirects(0)
		  .send({
			 board: 'first chat',
			 thread_id:'6196686acfbf88946c197e2a',
       reply_id:'61973ba2fe8920db87c85d7f',
       delete_password:'No password'
		  })
		  .end((err, res) => {
      //console.log(res,body)
       assert.equal(res.status, 200)
			 assert.strictEqual(res.body,'incorrect password')
       done();
		 })
    })
    test('Deleting a thread with the correct password',(done)=>{
      chai.request(server)
      .delete('/api/replies/fist chat/')
      .redirects(0)
		  .send({
			 board: 'first chat',
			 thread_id:'6196686acfbf88946c197e2a',
       reply_id:'61973ba2fe8920db87c85d7f',
       delete_password:'Mito'
		  })
		  .end((err, res) => {
      console.log(res)
       assert.equal(res.status, 200)
			 assert.strictEqual(res.body,'success')
       done();
		 })
    })
    test('Reporting a reply',(done)=>{
      chai.request(server)
      .put('/api/replies/first chat/')
      .redirects(0)
		  .send({
			 board: 'first chat',
			 thread_id:'6196686acfbf88946c197e2a',
       reply_id:'61973ef690f51eedcf33b737'
		  })
		  .end((err, res) => {
       assert.equal(res.status, 200)
       assert.strictEqual(res.body,'success')
       done();
		 })
    })
});

