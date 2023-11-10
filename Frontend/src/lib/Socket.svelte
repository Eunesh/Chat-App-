<script lang="ts">
    import io from 'socket.io-client';

    const socket = io("http://localhost:5000");

    let messages = [];
    let message = '';

    socket.on('message', (mssg)=>{
        messages = [...messages, mssg]
    })


    function sendMessage(){
        socket.emit('chat-message', message)
        message = '';
    }


   
  </script>

  <main>
    <h1>Chatting</h1>
    <input bind:value={message} placeholder="Messages">
    <button on:click={sendMessage}>Send</button>
    <div>
        {#each messages as message}
        {message}
        {/each}
    </div>
  </main>