<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Navbar -->
    <div class="w-64 bg-white shadow-lg">
      <!-- Profil Bilgileri -->
      <div class="p-4 border-b">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <i class="fas fa-user text-2xl text-gray-600"></i>
          </div>
          <div>
            <h3 class="font-medium">{{ userName }}</h3>
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
            <h1 class="text-lg font-bold">Ödeme Listeleri (LST-1)</h1>
            <div class="flex space-x-2">
              <select v-model="selectedList" class="rounded border-gray-300 shadow-sm">
                <option value="">Liste Seçiniz</option>
                <option value="1">Liste 1</option>
                <option value="2">Liste 2</option>
              </select>
              <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                Tümünü Listele
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

        <!-- Filtreler -->
        <div class="p-4 border-b">
          <div class="flex space-x-4">
            <div class="flex-1">
              <div class="relative rounded-md shadow-sm">
                <input type="text" v-model="searchTerm" 
                  class="block w-full h-12 pr-10 sm:text-lg border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ara...">
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i class="fas fa-search text-gray-400 text-lg"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Yükleniyor göstergesi -->
        <div v-if="isLoading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p class="mt-2 text-gray-600">Veriler yükleniyor...</p>
        </div>

        <!-- Tablo -->
        <div class="overflow-x-auto" style="max-height: calc(100vh - 100px); position: relative;">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr class="text-xs">
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('id')">
                  Id <i :class="getSortIcon('cariKod')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('cariKod')">
                  Cari Kod <i :class="getSortIcon('cariKod')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('cariIsim')">
                  Cari İsim <i :class="getSortIcon('cariIsim')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('firmaTipi')">
                  Firma Tipi <i :class="getSortIcon('firmaTipi')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('firmaLokasyonu')">
                  Firma Lokasyonu <i :class="getSortIcon('firmaLokasyonu')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('birimAdi')">
                  Birim Adı <i :class="getSortIcon('birimAdi')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('bakiyeTL')">
                  Bakiye TL <i :class="getSortIcon('bakiyeTL')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('guncelBakiyeTL')">
                  Güncel Bakiye TL <i :class="getSortIcon('guncelBakiyeTL')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('bakiyeDoviz')">
                  Bakiye Döviz <i :class="getSortIcon('bakiyeDoviz')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('sonFatura')">
                  Son Fatura <i :class="getSortIcon('sonFatura')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('sonOdemeBilgisi')">
                  Son Ödeme Bilgisi <i :class="getSortIcon('sonOdemeBilgisi')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-center cursor-pointer hover:bg-gray-100" @click="toggleSort('nakit')">
                  Nakit <i :class="getSortIcon('nakit')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-center cursor-pointer hover:bg-gray-100" @click="toggleSort('havale')">
                  Havale <i :class="getSortIcon('havale')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-center cursor-pointer hover:bg-gray-100" @click="toggleSort('cek')">
                  Çek <i :class="getSortIcon('cek')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-center cursor-pointer hover:bg-gray-100" @click="toggleSort('senet')">
                  Senet <i :class="getSortIcon('senet')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('ortVade')">
                  Ort. Vade <i :class="getSortIcon('ortVade')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('not')">
                  Not <i :class="getSortIcon('not')" class="ml-1"></i>
                </th>
                <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('toplamOdeme')">
                  Toplam Ödeme <i :class="getSortIcon('toplamOdeme')" class="ml-1"></i>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 text-sm">
              <template v-for="(group, groupName) in groupedRows" :key="groupName">
                <tr class="bg-gray-100">
                  <td colspan="17" class="px-2 py-1 font-semibold">{{ groupName }}</td>
                </tr>
                <tr v-for="row in group" :key="row.cariKod">
                  <td class="px-2 py-1">{{ row.id }}</td>
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
                      @change="updatePaymentAmounts(row)">
                  </td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.havale" 
                      class="w-16 text-right border-gray-300 rounded"
                      @change="updatePaymentAmounts(row)">
                  </td>
                  <td class="px-2 py-1 text-center">
                    <input type="number" v-model="row.cek" 
                      class="w-16 text-right border-gray-300 rounded"
                      @change="updatePaymentAmounts(row)">
                  </td>
                  <td class="px-2 py-1 text-right">{{ formatNumber(row.senet) }}</td>
                  <td class="px-2 py-1 text-right">{{ row.ortVade }}</td>
                  <td class="px-2 py-1">{{ row.not }}</td>
                  <td class="px-2 py-1 text-right font-semibold">{{ formatNumber(row.toplamOdeme) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
          
          <!-- Footer - Toplam Satırı (Ayrı tablo olarak) -->
          <table class="min-w-full sticky bottom-0 z-10">
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="5" class="px-2 py-2 text-right font-semibold bg-gray-50">Toplam:</td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalBakiye) }}</td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalGuncelBakiye) }}</td>
                <td colspan="3" class="px-2 py-2 bg-gray-50"></td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalNakit) }}</td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalHavale) }}</td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalCek) }}</td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalSenet) }}</td>
                <td colspan="2" class="px-2 py-2 bg-gray-50"></td>
                <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Notification Component (Inline) -->
  <div v-if="notification.visible" 
       :class="['fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 transform', 
               notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white']">
    <div class="flex items-center">
      <span v-if="notification.type === 'success'" class="mr-2">✓</span>
      <span v-else class="mr-2">⚠</span>
      <p>{{ notification.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userName = ref('')
const userEmail = ref('')
const userPhotoUrl = ref('')
const selectedList = ref('')
const rows = ref([])
const isLoading = ref(false)
const searchTerm = ref('')
const sortColumn = ref('')
const sortDirection = ref('asc')
const notification = ref({ visible: false, message: '', type: 'success' })

// Kullanıcı bilgilerini yükle
onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
  userName.value = userData.surname || ''
  userEmail.value = userData.email || ''
  userPhotoUrl.value = userData.photoUrl || '/img/default-avatar.png'
  
  // Verileri yükle
  fetchPaymentList()
})

// API'den ödeme listesini çek
const fetchPaymentList = async () => {
  isLoading.value = true
  try {
    const listId = route.query.id || 'AKAL-LST-1' // URL'den id parametresini al, yoksa varsayılan değeri kullan
    const response = await fetch(`https://mobil.alkbusiness.com/api/Payment/GetPaymentList/${listId}`)
    const data = await response.json()
    console.log('API Response:', data) // API yanıtını kontrol et
    
    // API verilerini rows formatına dönüştür
    rows.value = data.map(item => {
      console.log('Item:', item) // Her bir öğeyi kontrol et
      return {
        id: item.id || item.Id || item.currentId || item.CurrentId,
        group: item.RelatedUnitIdName,
        cariKod: item.CurrentCode,
        cariIsim: item.CurrentName,
        firmaTipi: item.CompanyType || '',
        firmaLokasyonu: item.CompanyLocation || '',
        birimAdi: item.RelatedUnit || '',
        bakiyeTL: item.BalanceTL,
        guncelBakiyeTL: item.CurrentBalanceTL,
        bakiyeDoviz: item.ForeignCurrencyBalance,
        sonFatura: item.LastInvoiceInfo ? item.LastInvoiceInfo.split(' ')[0] : '',
        sonOdemeBilgisi: item.LastPaymentInfo ? item.LastPaymentInfo.split(' ')[0] : '',
        nakit: item.Cash,
        havale: item.WireTransfer,
        cek: item.Check,
        senet: item.PromissoryNote,
        ortVade: item.AverageMaturity,
        not: item.Description,
        toplamOdeme: item.TotalPayment
      }
    })
    
    showNotification('Veriler başarıyla yüklendi.', 'success')
  } catch (error) {
    console.error('Veri çekme hatası:', error)
    showNotification('Veri yüklenirken bir hata oluştu.', 'error')
  } finally {
    isLoading.value = false
  }
}

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

function updatePaymentAmounts(row) {
  // Toplam ödemeyi güncelle
  row.toplamOdeme = (Number(row.nakit) || 0) + 
                    (Number(row.havale) || 0) + 
                    (Number(row.cek) || 0) + 
                    (Number(row.senet) || 0)

  // API'ye gönder
  const sendToApi = async () => {
    try {
      const requestData = {
        Cash: Number(row.nakit) || 0,
        WireTransfer: Number(row.havale) || 0,
        Check: Number(row.cek) || 0,
        AverageMaturity: Number(row.ortVade) || 0,
        Description: row.not || ''
      }

      const response = await fetch(`https://mobil.alkbusiness.com/api/Payment/UpdatePaymentAmounts/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('API yanıt hatası: ' + response.status)
      } else {
        const updatedValue = row.nakit + row.havale + row.cek
        showNotification(`Ödeme başarıyla güncellendi. Toplam: ${formatNumber(updatedValue)}`, 'success')
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      showNotification(`Ödeme güncellenirken bir hata oluştu: ${error.message}`, 'error')
    }
  }

  // API'ye gönderimi başlat
  sendToApi()
}

// Sıralama fonksiyonu
const sortRows = (rows) => {
  if (!sortColumn.value) return rows

  return [...rows].sort((a, b) => {
    let aValue = a[sortColumn.value]
    let bValue = b[sortColumn.value]

    // Sayısal değerler için özel işlem
    if (['bakiyeTL', 'guncelBakiyeTL', 'bakiyeDoviz', 'nakit', 'havale', 'cek', 'senet', 'ortVade', 'toplamOdeme'].includes(sortColumn.value)) {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    }

    // Tarih değerleri için özel işlem
    if (['sonFatura', 'sonOdemeBilgisi'].includes(sortColumn.value)) {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
}

// Sıralama yönünü değiştir
const toggleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Sıralama ikonunu göster
const getSortIcon = (column) => {
  if (sortColumn.value !== column) return 'fas fa-sort'
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

// Filtrelenmiş ve sıralanmış satırları hesapla
const filteredAndSortedRows = computed(() => {
  let result = filteredRows.value
  return sortRows(result)
})

// Filtrelenmiş satırları hesapla
const filteredRows = computed(() => {
  if (!searchTerm.value) {
    return rows.value
  }
  
  const search = searchTerm.value.toLowerCase()
  return rows.value.filter(row => {
    return row.cariKod?.toLowerCase().includes(search) || 
           row.cariIsim?.toLowerCase().includes(search) ||
           (row.firmaTipi && row.firmaTipi.toLowerCase().includes(search)) ||
           (row.firmaLokasyonu && row.firmaLokasyonu.toLowerCase().includes(search)) ||
           (row.birimAdi && row.birimAdi.toLowerCase().includes(search)) ||
           (row.not && row.not.toLowerCase().includes(search))
  })
})

const groupedRows = computed(() => {
  const groups = {}
  filteredAndSortedRows.value.forEach(row => {
    const groupName = row.group || 'Diğer' // group olmayan satırları "Diğer" grubuna ekle
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(row)
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

const showNotification = (message, type) => {
  notification.value = { visible: true, message, type }
  setTimeout(() => {
    notification.value.visible = false
  }, 3000) // 3 saniye sonra otomatik olarak kaybolur
}
</script>

<style scoped>
/* Font Awesome için CDN ekleyin */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.table-container {
  position: relative;
  height: calc(100vh - 300px);
}

table {
  font-size: 0.875rem;
  width: 100%;
  border-collapse: collapse;
}

th {
  position: sticky;
  top: 0;
  background: #f9fafb;
  z-index: 10;
}

tfoot {
  position: sticky;
  bottom: 0;
  z-index: 10;
}

tfoot tr {
  background: #f9fafb;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

tfoot td {
  border-top: 1px solid #e5e7eb;
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