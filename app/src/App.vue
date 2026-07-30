<script setup>
import { session } from "./stores/session";
import Login from "./pages/Login.vue";
import Layout from "./components/Layout.vue";
</script>

<template>
  <!-- Gate de sessão: sem usuário autenticado, o app é a tela de login. Com
       usuário, entra no shell autenticado (login → dashboard). -->
  <Login v-if="!session.user" />
  <Layout v-else>
    <router-view />
  </Layout>
</template>
