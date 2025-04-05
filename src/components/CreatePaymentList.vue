<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Navbar -->
    <div class="w-64 bg-white shadow-lg">
      <!-- Profil Bilgileri -->
      <div class="p-4 border-b">
        <div class="flex items-center space-x-3">
          <img :src="userPhotoUrl || '/img/default-avatar.png'" alt="Profil Fotoğrafı" class="w-12 h-12 rounded-full">
          <div>
            <h3 class="font-medium">{{ userName }}</h3>
            <p class="text-sm text-gray-500">{{ userEmail }}</p>
          </div>
        </div>
      </div>
      
      <!-- Menü -->
      <nav class="mt-4">
        <router-link to="/dashboard" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-home mr-3"></i>
          Ana Sayfa
        </router-link>
        <router-link to="/payment-list" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-list mr-3"></i>
          Ödeme Listesi
        </router-link>
        <router-link to="/create-payment-list" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-plus mr-3"></i>
          Ödeme Listesi Oluştur
        </router-link>
        <button @click="handleLogout" class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-sign-out-alt mr-3"></i>
          Çıkış
        </button>
      </nav>
    </div>

    <!-- Ana İçerik -->
    <div class="flex-1 overflow-auto p-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Yeni Ödeme Listesi Oluştur</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Liste Adı</label>
            <input type="text" v-model="listName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea v-model="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button @click="$router.push('/payment-list')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              İptal
            </button>
            <button @click="createList" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
              Liste Oluştur
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const userEmail = ref('')
const userPhotoUrl = ref('')
const listName = ref('')
const description = ref('')

// Kullanıcı bilgilerini yükle
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
  userName.value = `${userData.name || ''} ${userData.surname || ''}`
  userEmail.value = userData.email || ''
  userPhotoUrl.value = userData.photoUrl || '/img/default-avatar.png'
})

// Çıkış işlemi
const handleLogout = () => {
  // Cookie'leri temizle
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  
  // Local ve Session storage'ı temizle
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
  
  // Login sayfasına yönlendir
  router.push('/login')
}

const createList = () => {
  // Burada liste oluşturma API çağrısı yapılacak
  console.log('Liste oluşturuluyor:', {
    name: listName.value,
    description: description.value
  })
  
  // Başarılı oluşturma sonrası ödeme listesi sayfasına yönlendir
  router.push('/payment-list')
}
</script>

<style scoped>
/* Font Awesome için CDN ekleyin */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style> 