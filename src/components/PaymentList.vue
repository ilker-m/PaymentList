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
      <div class="bg-white shadow rounded-lg">
        <div class="p-4 flex justify-between items-center border-b">
          <div class="flex items-center space-x-4">
            <h1 class="text-lg font-bold">Ödeme Listeleri (LST-1-27.03.2025)</h1>
            <div class="flex space-x-2">
              <select v-model="selectedList" class="rounded border-gray-300 shadow-sm">
                <option value="">Liste Seçiniz</option>
                <option value="1">Liste 1</option>
                <option value="2">Liste 2</option>
              </select>
              <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                Tümünü Listele
              </button>
              <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                Sil
              </button>
              <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                Yenile
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm">Hareketleri Göster</span>
            <button class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm">
              Yazdır
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr class="text-xs">
                <th class="w-8 px-2 py-2"><input type="checkbox" v-model="selectAll"></th>
                <th class="px-2 py-2 text-left">Cari Kod</th>
                <th class="px-2 py-2 text-left">Cari İsim</th>
                <th class="px-2 py-2 text-left">Firma Tipi</th>
                <th class="px-2 py-2 text-left">Firma Lokasyonu</th>
                <th class="px-2 py-2 text-left">Birim Adı</th>
                <th class="px-2 py-2 text-right">Bakiye TL</th>
                <th class="px-2 py-2 text-right">Güncel Bakiye TL</th>
                <th class="px-2 py-2 text-right">Bakiye Döviz</th>
                <th class="px-2 py-2 text-left">Son Fatura</th>
                <th class="px-2 py-2 text-left">Son Ödeme Bilgisi</th>
                <th class="px-2 py-2 text-center">Nakit</th>
                <th class="px-2 py-2 text-center">Havale</th>
                <th class="px-2 py-2 text-center">Çek</th>
                <th class="px-2 py-2 text-center">Senet</th>
                <th class="px-2 py-2 text-right">Ort. Vade</th>
                <th class="px-2 py-2 text-left">Not</th>
                <th class="px-2 py-2 text-right">Toplam Ödeme</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-sm">
              <template v-for="(group, groupName) in groupedRows" :key="groupName">
                <tr class="bg-gray-100">
                  <td colspan="18" class="px-2 py-1 font-semibold">{{ groupName }}</td>
                </tr>
                <tr v-for="row in group" :key="row.cariKod" :class="{'bg-gray-50': row.selected}">
                  <td class="px-2 py-1"><input type="checkbox" v-model="row.selected"></td>
                  <td class="px-2 py-1">{{ row.cariKod }}</td>
                  <td class="px-2 py-1">{{ row.cariIsim }}</td>
                  <td class="px-2 py-1">{{ row.firmaTipi }}</td>
                  <td class="px-2 py-1">{{ row.firmaLokasyonu }}</td>
                  <td class="px-2 py-1">{{ row.birimAdi }}</td>
                  <td class="px-2 py-1 text-right" :class="{'text-red-600': row.bakiyeTL < 0}">
                    {{ formatNumber(row.bakiyeTL) }}
                  </td>
                  <td class="px-2 py-1 text-right" :class="{'text-red-600': row.guncelBakiyeTL < 0}">
                    {{ formatNumber(row.guncelBakiyeTL) }}
                  </td>
                  <td class="px-2 py-1 text-right">{{ formatNumber(row.bakiyeDoviz) }}</td>
                  <td class="px-2 py-1">{{ formatDate(row.sonFatura) }}</td>
                  <td class="px-2 py-1">{{ formatDate(row.sonOdemeBilgisi) }}</td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.nakit" 
                      class="w-16 text-right border-gray-300 rounded" 
                      @change="updateTotalOdeme(row)">
                  </td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.havale" 
                      class="w-16 text-right border-gray-300 rounded"
                      @change="updateTotalOdeme(row)">
                  </td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.cek" 
                      class="w-16 text-right border-gray-300 rounded"
                      @change="updateTotalOdeme(row)">
                  </td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.senet" 
                      class="w-16 text-right border-gray-300 rounded"
                      @change="updateTotalOdeme(row)">
                  </td>
                  <td class="px-2 py-1 text-right">{{ row.ortVade }}</td>
                  <td class="px-2 py-1">{{ row.not }}</td>
                  <td class="px-2 py-1 text-right font-semibold">{{ formatNumber(row.toplamOdeme) }}</td>
                </tr>
              </template>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="6" class="px-2 py-2 text-right font-semibold">Toplam:</td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalBakiye) }}</td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalGuncelBakiye) }}</td>
                <td colspan="3" class="px-2 py-2"></td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalNakit) }}</td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalHavale) }}</td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalCek) }}</td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalSenet) }}</td>
                <td colspan="2" class="px-2 py-2"></td>
                <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const userEmail = ref('')
const userPhotoUrl = ref('')

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

const selectedList = ref('')
const selectAll = ref(false)

const rows = ref([
  {
    group: '14 - Depo ve Lojistik',
    cariKod: '320000302729',
    cariIsim: 'UPS HIZLI KARGO TAŞIMACILIK A.Ş.',
    firmaTipi: 'Kargo',
    firmaLokasyonu: 'İstanbul',
    birimAdi: 'Lojistik',
    bakiyeTL: -1525.71,
    guncelBakiyeTL: 1525.71,
    bakiyeDoviz: 0,
    sonFatura: '2025-03-25',
    sonOdemeBilgisi: '2025-03-27',
    nakit: 4.00,
    havale: 0,
    cek: 0,
    senet: 0,
    ortVade: 90,
    not: 'ÖDEME AŞAMASINDA',
    toplamOdeme: 4.00
  },
  {
    group: '17 - Diğer',
    cariKod: '320000101214',
    cariIsim: 'SEVİM YAPAN',
    firmaTipi: 'Elişi',
    firmaLokasyonu: 'Aydın',
    birimAdi: 'Üretim',
    bakiyeTL: 3574.80,
    guncelBakiyeTL: 74.80,
    bakiyeDoviz: 0,
    sonFatura: '2025-03-20',
    sonOdemeBilgisi: '2025-03-25',
    nakit: 1500.00,
    havale: 2000.00,
    cek: 0,
    senet: 0,
    ortVade: 15,
    not: '',
    toplamOdeme: 3500.00
  },
  {
    group: '17 - Diğer',
    cariKod: '320000105566',
    cariIsim: 'ŞİMŞEK EGE ETİKET',
    firmaTipi: 'Etiket',
    firmaLokasyonu: 'İzmir',
    birimAdi: 'Üretim',
    bakiyeTL: 6545.20,
    guncelBakiyeTL: 0,
    bakiyeDoviz: 0,
    sonFatura: '2025-03-15',
    sonOdemeBilgisi: '2025-03-20',
    nakit: 3000.00,
    havale: 3545.20,
    cek: 0,
    senet: 0,
    ortVade: 30,
    not: '',
    toplamOdeme: 6545.20
  }
])

function updateTotalOdeme(row) {
  row.toplamOdeme = (Number(row.nakit) || 0) + 
                    (Number(row.havale) || 0) + 
                    (Number(row.cek) || 0) + 
                    (Number(row.senet) || 0)
}

const groupedRows = computed(() => {
  const groups = {}
  rows.value.forEach(row => {
    if (!groups[row.group]) {
      groups[row.group] = []
    }
    groups[row.group].push(row)
  })
  return groups
})

const totalAmount = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.toplamOdeme) || 0), 0)
})

const totalBakiye = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.bakiyeTL) || 0), 0)
})

const totalGuncelBakiye = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.guncelBakiyeTL) || 0), 0)
})

const totalNakit = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.nakit) || 0), 0)
})

const totalHavale = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.havale) || 0), 0)
})

const totalCek = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.cek) || 0), 0)
})

const totalSenet = computed(() => {
  return rows.value.reduce((sum, row) => sum + (Number(row.senet) || 0), 0)
})

function formatNumber(value) {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR')
}
</script>

<style scoped>
/* Font Awesome için CDN ekleyin */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.table-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

table {
  font-size: 0.875rem;
}

th {
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 1;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 