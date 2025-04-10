<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-24 w-auto" src="/img/logo.png" alt="ALK Business Logo">
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              E-posta
            </label>
            <div class="mt-1">
              <input id="email" v-model="email" type="email" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <div class="mt-1">
              <input id="password" v-model="password" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember_me" type="checkbox" v-model="rememberMe"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="remember_me" class="ml-2 block text-sm text-gray-900">
                Beni hatırla
              </label>
            </div>

            <div class="text-sm">
              <a href="#" @click.prevent="showForgotPassword = true" class="font-medium text-blue-600 hover:text-blue-500">
                Şifremi unuttum
              </a>
            </div>
          </div>

          <div>
            <button type="submit" :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş yap' }}
            </button>
          </div>

          <div class="mt-4 text-center">
            <p class="text-sm text-red-600" id="message" v-if="message">{{ message }}</p>
          </div>
        </form>
      </div>
    </div>

    <!-- Şifremi Unuttum Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Şifre Sıfırlama</h3>
        <p class="text-sm text-gray-500 mb-4">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
        <div class="space-y-4">
          <input type="email" id="forgotEmail" v-model="forgotEmail" placeholder="E-posta adresiniz"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          <p class="text-sm text-red-600" id="forgotMessage" v-if="forgotMessage">{{ forgotMessage }}</p>
          <div class="flex justify-end space-x-3">
            <button @click="showForgotPassword = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
              İptal
            </button>
            <button @click="handleForgotPassword" :disabled="isLoadingForgot" id="sendforgotButton"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50">
              {{ isLoadingForgot ? 'Gönderiliyor...' : 'Gönder' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false) // Set to false by default (unchecked)
const isLoading = ref(false)
const message = ref('')

// Şifremi unuttum
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const isLoadingForgot = ref(false)
const forgotMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    message.value = "Email ve şifre boş bırakılamaz."
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    // IP adresini al
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipResponse.json()
    const ipAddress = ipData.ip || "IP alınamadı"

    // Log kaydı oluştur
    const logData = {
      "ApplicationName": "PaymentListApp",
      "Users": encodeURIComponent(email.value),
      "DeviceInfo": "Kullanıcının tarayıcı bilgisi " + navigator.userAgent,
      "IpAdress": ipAddress
    }

    await fetch('https://mobil.alkbusiness.com/api/Log/AddLog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    })

    // Login isteği
    const url = `https://mobil.alkbusiness.com/api/User/Login?Email=${encodeURIComponent(email.value)}&Password=${encodeURIComponent(password.value)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (data && data.Status === "success") {
      // Cookie'leri ayarla
      document.cookie = `Name=${data.Name}; path=/;`
      document.cookie = `Email=${data.Email}; path=/;`
      document.cookie = `UnitId=${data.UnitId}; path=/;`
      document.cookie = `Surname=${data.Surname}; path=/;`
      
      // Kullanıcı bilgilerini sakla
      const userData = {
        name: data.Name,
        email: data.Email,
        unitId: data.UnitId,
        surname: data.Surname
      }

      if (rememberMe.value) {
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData))
      }

      // payment-list'de yönlendir
      await router.push('/payment-list')
    } else {
      message.value = data.message || "Giriş başarısız.."
    }
  } catch (error) {
    console.error("Login error:", error)
    message.value = "Bir hata oluştu. Lütfen tekrar deneyin."
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!forgotEmail.value) {
    forgotMessage.value = "Lütfen email adresinizi girin."
    return
  }

  isLoadingForgot.value = true
  forgotMessage.value = ''

  try {
    const response = await fetch(
      `https://mobil.alkbusiness.com/api/User/ChangePassword?email=${encodeURIComponent(forgotEmail.value)}`,
      { method: 'POST' }
    )

    const data = await response.json()

    if (response.ok && data.code === 200) {
      forgotMessage.value = data.message
      setTimeout(() => {
        showForgotPassword.value = false
        forgotEmail.value = ''
        forgotMessage.value = ''
      }, 3000)
    } else if (data.code === 409) {
      forgotMessage.value = data.message
    } else {
      forgotMessage.value = "Bir hata oluştu. Lütfen tekrar deneyin."
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    forgotMessage.value = "Bir hata oluştu. Lütfen tekrar deneyin."
  } finally {
    isLoadingForgot.value = false
  }
}

// Enter tuşu ile login
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !showForgotPassword.value) {
    handleLogin()
  }
})
</script>