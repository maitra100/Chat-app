const express=require("express");
const socketio=require("socket.io");
const path=require("path");
const http=require("http");
const formatMessage=require("./util/messages");
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require("./util/users");

const app=express();
const server=http.createServer(app);
const io=socketio(server);

app.use(express.static(path.join(__dirname,'htmlcss')));
const chatman="chatbot";

io.on('connection',socket=>{
  socket.on('joinRoom',({username,room})=>{
    const user=userJoin(socket.id,username,room);

    socket.join('user.room');

   socket.emit('message',formatMessage(chatman,`welcome to chatcord`));
   socket.broadcast
   .to('user.room')
   .emit('message',formatMessage(chatman,`${user.username} joined the chat`));

   io.emit('roomUsers',{
     room:user.room,
     users:getRoomUsers(user.room),
   });

  });
 
 socket.on('disconnect',()=>{
   let user=userLeave(socket.id);
   if(user){
   io.emit('message',formatMessage("USER",`${user.username} left the chat`));
   }
   io.emit('roomUsers',{
     room:user.room,
     users:getRoomUsers(user.room),
   });
 });

 socket.on('chatMessage',msg=>{
   const user=getCurrentUser(socket.id);
   io.emit('message',formatMessage(user.username,msg));
 });
});

const PORT=process.env.PORT || 3000;

server.listen(PORT,()=> console.log(`Serving running on ${PORT}`));