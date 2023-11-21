<script lang="ts">
    import io from 'socket.io-client';
    import {onMount} from 'svelte';

    const URL = "http://localhost:3000"

    const socket = io(URL, {autoConnect: false}); // Can connect to localhost 5000 - 5003 because backend server is running on 4 ports due to dividing work load

    let isUsernameSelected:Boolean = false;
    let messages = [];
    let message = '';
    let username = '';
    let users:Array<String> = [];
    let hi = 'hi';



    function onUsernameSelected(){
        if(username){
            isUsernameSelected = true;
            socket.auth = { username }; // sending username to auth section of socket so that we can access it in server 
            socket.connect();

        }else{
            alert("please type your usename")
        }     
    }


    // onMount function to run after every refreash
    onMount(()=>{
        const sessionID = localStorage.getItem("sessionID");


        if(sessionID){
            isUsernameSelected = true;
            socket.auth = {sessionID};
            socket.connect();
           
        }
        
        socket.on("session", ({sessionID, userID})=>{
            // sendign sessionID to server as in auth
            socket.auth = {sessionID};
            // Setting session Id on local storage
            localStorage.setItem("sessionID", sessionID);
        })  
    })



    

    // Socket.on for getting emmited massage from server 
    socket.on('message', (mssg)=>{
        messages = [...messages, mssg]
    })

    // for getting emitted all name of users from server
    socket.on('users', (users)=>{
        users.forEach((user)=> {
            console.log(user);

        });
    })


    // when error is detected in server for socket
    socket.on("connect_error", (err) => {
        console.log(err.message)
        if (err.message === "invalid username") {
            isUsernameSelected = false;        
        }
    });

    // for showing every connected users
    // socket.on("user connected", (user) => {
    //     console.log(user.userID);
    //     console.log(user);
    //     users = [user.userID, ...users]

    // });

    // for private message
    socket.on("private dm", ({hi, from})=>{
        console.log(hi); 
        console.log(`from: ${from}`);
    })



    // emitting message typed in input field after clicking send button
    function sendMessage(){

        socket.emit('chat-message', message)
        message = '';
    }

    function onMessage(user:String){
        if (user){
            socket.emit("private message", {
                hi,
                to:user
            })
        }
        console.log(user);

    }


   
  </script>

  <main>

    <h1>Chat App</h1>
    <div>
        <input bind:value={username} placeholder="Username" name="username">
        <button on:click={ onUsernameSelected}>Select</button>

    </div>

    <h2>List of Users Connected</h2>
    <div>
        {#each users as user}
        <div on:click={() => onMessage(user)}>{user}</div>
        {/each}
    </div>
    <div>
       <h2>Send Message here</h2>
    </div>

    <div>
        {#if isUsernameSelected}
        <input bind:value={message} placeholder="Messages" name="message">
        <button on:click={sendMessage}>Send</button>
        {:else}
        <div>Please select username</div>
        {/if}
    </div>
   
    
    <div>
        {#each messages as message}
        {message}
        {/each}
    </div>
  </main>