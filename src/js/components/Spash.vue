<template>
  <div class="align-items-center d-flex justify-content-center h-100 pb-5">
    <div class="container">
      <h1 class="my-3 text-center">Pong</h1>
      <template v-if="!$root.game">

        <template v-if="!showForm"><div class="mb-5 row">
          <div class="col">
            <h5 class="text-center">Crea una sala o únete a una ya existente</h5>
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <button type="button" class="btn btn-lg btn-primary" @click="create_room">Crear una sala nueva</button>
          </div>
          <div class="col text-center">
            <button type="button" class="btn btn-lg btn-primary" @click="join_room_btn">Unirse a una existente</button>
          </div>
        </div>
        </template>

        <template v-else>
        <div class="col-5 mx-auto text-center pt-5">
          <h5>Código de la sala:</h5>
          <input type="text" class="form-control mb-3" v-model="roomId">
          <button class="btn btn-primary" @click="join_room">Unirse</button>
        </div>
        </template>
        
      </template>

      <template v-else>
        <div class="col-5 mx-auto text-center pt-5">
          <h5>Código de la sala:</h5>
          <h3>{{ $root.game.roomId }}</h3>
          <p>Esperando al jugador 2</p>  
        </div>
      </template>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showForm: false,
      roomId: null
    }
  },
  sockets: {
    create_room(data) {
      if (data.error) return console.error('create_room', data.error);
      console.log('create_room', data.error);
    },
    join_room(data) {
      if (data.error) return console.error('join_room', data.error);
      console.log('join_room', data.error);
    }
  },
  methods: {
    create_room: function() {
      this.$socket.emit('create_room');
    },
    join_room_btn: function() {
      this.showForm = true;
    },
    join_room: function() {
      this.$socket.emit('join_room', this.roomId);
    }
  }
};
</script>

<style>
.login {
  height: 100%;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}

.form-signin .checkbox {
  font-weight: 400;
}

.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}

.form-signin .form-control:focus {
  z-index: 2;
}

.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
  margin-bottom: 10px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>