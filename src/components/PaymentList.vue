<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile Overlay -->
    <div v-if="isNavbarOpen" 
         class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
         @click="isNavbarOpen = false">
    </div>

    <!-- Sidebar/Navbar - Claude Style -->
    <div :class="[
      'fixed z-30 transition-all duration-300 ease-in-out h-full',
      isCollapsed ? 'w-16' : 'w-64',
      'bg-white shadow-lg overflow-hidden',
      'md:relative', // Always visible on desktop
      isNavbarOpen ? 'left-0' : '-left-64 md:left-0' // Hidden off-screen on mobile unless open
    ]">
      <!-- Sidebar Header with Toggle Button -->
      <div class="border-b border-gray-200">
        <!-- Toggle Button Above Profile -->
        <div class="p-2 flex justify-center">
          <button 
            @click="toggleSidebar" 
            class="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-500">
            <i :class="['fas', isCollapsed ? 'fa-expand-alt' : 'fa-compress-alt']"></i>
          </button>
        </div>
        
        <!-- User Info Section -->
        <div class="px-4 pb-4 flex items-center">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-user text-gray-600"></i>
          </div>
          <div :class="isCollapsed ? 'hidden' : 'block ml-3'">
            <h3 class="font-medium truncate text-sm">{{ userName }}</h3>
          </div>
        </div>
      </div>
      
      <!-- Menu -->
      <nav class="mt-2">
        <router-link to="/payment-list" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-list text-lg w-6 text-center"></i>
          <span :class="isCollapsed ? 'hidden' : 'ml-3'">Ödeme Listesi</span>
        </router-link>

        <button @click="handleLogout" class="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100">
          <i class="fas fa-sign-out-alt text-lg w-6 text-center"></i>
          <span :class="isCollapsed ? 'hidden' : 'ml-3'">Çıkış</span>
        </button>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Top Bar for Mobile Only Toggle Button -->
      <div class="bg-white shadow-sm p-2 flex items-center md:hidden z-10">
        <button @click="isNavbarOpen = !isNavbarOpen" class="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition-colors">
          <i class="fas" :class="isNavbarOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
      </div>
      
      <!-- Main Content -->
      <div class="flex-1 overflow-auto p-4">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 pt-5 pb-2 flex flex-col justify-between items-center">
            <h1 class="text-xl font-bold mb-2">Ödeme Listeleri</h1>
          </div>

          <!-- Filters -->
          <div class="p-6 border-b bg-gray-50">
            <div class="flex flex-col space-y-6">
              <!-- Arama Kutusu ve Liste Seçici (yan yana) -->
              <div class="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <!-- Liste Seçici (sol tarafta) -->
                <div class="md:w-1/3">
                  <label for="list-selector" class="block text-sm font-medium text-gray-700 mb-1">Liste Adı</label>
                  <select 
                    id="list-selector" 
                    v-model="selectedList" 
                    @change="fetchPaymentList"
                    class="block w-full h-12 px-4 py-2 text-lg border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                    <option v-for="list in paymentLists" :key="list.Id" :value="list.ListName">
                      {{ list.ListName }}
                    </option>
                  </select>
                </div>
                
                <!-- Arama Kutusu (sağ tarafta) -->
                <div class="flex-1">
                  <label for="search-box" class="block text-sm font-medium text-gray-700 mb-1">Ara</label>
                  <div class="relative rounded-md shadow-sm">
                    <input 
                      id="search-box"
                      type="text" 
                      v-model="searchTerm" 
                      class="block w-full h-12 px-4 py-2 pr-10 text-lg border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ara...">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <i class="fas fa-search text-gray-400 text-lg"></i>
                    </div>
                  </div>
                </div>
                
                <!-- Butonlar -->
                <div class="flex items-center space-x-2 md:self-end">
                  <button @click="printTable" class="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 text-sm flex items-center h-12">
                    <i class="fas fa-print mr-1"></i> Yazdır
                  </button>
                  
                  <button @click="fetchPaymentList" class="bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 text-sm flex items-center h-12">
                    <i class="fas fa-sync-alt mr-1"></i> Yenile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-2 text-gray-600">Veriler yükleniyor...</p>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto" style="max-height: calc(100vh - 220px); position: relative;">
            <table class="min-w-full divide-y divide-gray-200" tabindex="0" @keydown="handleTableKeydown">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr class="text-xs">
                  <!-- Removed ID column -->
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('cariKod')">
                    Cari Bilgileri <i :class="getSortIcon('cariKod')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('firmaTipi')">
                    Firma Tipi <i :class="getSortIcon('firmaTipi')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('birimAdi')">
                    Birim Adı <i :class="getSortIcon('birimAdi')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('bakiyeTL')">
                    Bakiye TL <i :class="getSortIcon('bakiyeTL')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('guncelBakiyeTL')">
                    Güncel TL <i :class="getSortIcon('guncelBakiyeTL')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('bakiyeDoviz')">
                    Bakiye Döviz <i :class="getSortIcon('bakiyeDoviz')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('sonFatura')">
                    Son Fatura <i :class="getSortIcon('sonFatura')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('sonOdemeBilgisi')">
                    Son Ödeme <i :class="getSortIcon('sonOdemeBilgisi')" class="ml-1"></i>
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
                  <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('ortVade')">
                    Ort. Vade <i :class="getSortIcon('ortVade')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-left cursor-pointer hover:bg-gray-100" @click="toggleSort('not')">
                    Not <i :class="getSortIcon('not')" class="ml-1"></i>
                  </th>
                  <th class="px-2 py-2 text-right cursor-pointer hover:bg-gray-100" @click="toggleSort('toplamOdeme')">
                    Toplam <i :class="getSortIcon('toplamOdeme')" class="ml-1"></i>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 text-sm">
                <template v-for="(group, groupName) in groupedRows" :key="groupName">
                  <tr class="bg-gray-100">
                    <td colspan="14" class="px-2 py-1 font-semibold">{{ groupName }}</td>
                  </tr>
                  <tr v-for="(row, rowIdx) in group" :key="row.cariKod">
                    <!-- Removed ID cell -->
                    <td class="px-2 py-1" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 0)">
                      <div class="flex flex-col">
                        <span class="font-bold">{{ row.cariKod }}</span>
                        <span class="text-gray-600 text-sm">{{ row.cariIsim }}</span>
                      </div>
                    </td>
                    <td class="px-2 py-1" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 1)">{{ row.firmaTipi }}</td>
                    <td class="px-2 py-1" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 2)">{{ row.birimAdi }}</td>
                    <td class="px-2 py-1 text-right" :class="{'text-red-600': row.bakiyeTL < 0}" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 3)">
                      {{ formatNumber(row.bakiyeTL) }}
                    </td>
                    <td class="px-2 py-1 text-right" :class="{'text-red-600': row.guncelBakiyeTL < 0}" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 4)">
                      {{ formatNumber(row.guncelBakiyeTL) }}
                    </td>
                    <td class="px-2 py-1 text-right" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 5)">{{ formatNumber(row.bakiyeDoviz) }}</td>
                    <td class="px-2 py-1" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 6)">{{ isValidDate(row.sonFatura) ? formatDate(row.sonFatura) : '' }}</td>
                    <td class="px-2 py-1" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 7)">{{ isValidDate(row.sonOdemeBilgisi) ? formatDate(row.sonOdemeBilgisi) : '' }}</td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.nakit)" 
                        @input="validateNumericInput($event, row, 'nakit')"
                        @focus="onCurrencyFocus($event, row, 'nakit'); setActiveCell(getGlobalRowIndex(groupName, rowIdx), 8)"
                        @blur="onCurrencyBlur($event, row, 'nakit'); updatePaymentAmounts(row)"
                        class="w-20 text-right border-gray-300 rounded bg-green-100"
                        tabindex="0">
                    </td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.havale)" 
                        @input="validateNumericInput($event, row, 'havale')"
                        @focus="onCurrencyFocus($event, row, 'havale'); setActiveCell(getGlobalRowIndex(groupName, rowIdx), 9)"
                        @blur="onCurrencyBlur($event, row, 'havale'); updatePaymentAmounts(row)"
                        class="w-20 text-right border-gray-300 rounded bg-green-100"
                        tabindex="0">
                    </td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.cek)" 
                        @input="validateNumericInput($event, row, 'cek')"
                        @focus="onCurrencyFocus($event, row, 'cek'); setActiveCell(getGlobalRowIndex(groupName, rowIdx), 10)"
                        @blur="onCurrencyBlur($event, row, 'cek'); updatePaymentAmounts(row)"
                        class="w-20 text-right border-gray-300 rounded bg-green-100"
                        tabindex="0">
                    </td>
                    <td class="px-2 py-1 text-right">
                      <input type="number" v-model="row.ortVade" 
                        @focus="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 11)"
                        class="w-16 text-right border-gray-300 rounded bg-green-100"
                        @change="updatePaymentAmounts(row)"
                        tabindex="0">
                    </td>
                    <td class="px-2 py-1">
                      <input type="text" v-model="row.not" 
                        @focus="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 12)"
                        class="w-full border-gray-300 rounded bg-green-100"
                        @change="updatePaymentAmounts(row)"
                        tabindex="0">
                    </td>
                    <td class="px-2 py-1 text-right" tabindex="0" @click="setActiveCell(getGlobalRowIndex(groupName, rowIdx), 13)">{{ formatNumber(row.toplamOdeme) }}</td>
                  </tr>
                </template>
              </tbody>
              <tfoot class="bg-gray-50 sticky bottom-0 z-10">
                <tr>
                  <td class="px-2 py-2 text-left font-semibold">Toplam:</td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalBakiye) }}</td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalGuncelBakiye) }}</td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalBakiyeDoviz) }}</td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalNakit) }}</td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalHavale) }}</td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalCek) }}</td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2 text-right font-semibold">{{ formatNumber(totalAmount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
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
const paymentLists = ref([])
const rows = ref([])
const isLoading = ref(false)
const searchTerm = ref('')
const sortColumn = ref('')
const sortDirection = ref('asc')
const notification = ref({ visible: false, message: '', type: 'success' })
const isNavbarOpen = ref(false) // For mobile overlay
const isCollapsed = ref(true) // Always start collapsed
const activeCell = ref(null) // Tabloda aktif hücre

// Cookie'den değer okumak için yardımcı fonksiyon
const getCookieValue = (cookieName) => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {})
  return cookies[cookieName] || ''
}

// Kullanıcı ID'sini al ve oturum kontrolü yap
const checkUserSession = () => {
  const userId = getCookieValue('UserId')
  if (!userId) {
    showNotification('Kullanıcı bilgisi bulunamadı, lütfen tekrar giriş yapın.', 'error')
    router.push('/login')
    return null
  }
  return userId
}

// Toggle sidebar collapsed/expanded state (Claude-style)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  
  // Save preference to localStorage
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString());
}

// Setup events and load initial data
onMounted(() => {
  // Handle resize events for responsive adjustments
  window.addEventListener('resize', () => {
    // Close mobile overlay when resizing to desktop
    if (window.innerWidth >= 768 && isNavbarOpen.value) {
      isNavbarOpen.value = false;
    }
  });

  // Load user data
  const userData = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}')
  userName.value = userData.surname || ''
  userEmail.value = userData.email || ''
  userPhotoUrl.value = userData.photoUrl || '/img/default-avatar.png'
  
  // Always start with collapsed sidebar
  isCollapsed.value = true;
  localStorage.setItem('sidebarCollapsed', 'true');
  
  // On mobile, initially hide the navbar
  if (window.innerWidth < 768) {
    isNavbarOpen.value = false; // Start with navbar closed on mobile
  }
  
  // Önce liste bilgilerini yükle
  fetchPaymentLists()
})

// Ödeme listelerini API'den çek
const fetchPaymentLists = async () => {
  try {
    // Kullanıcı oturumunu kontrol et
    const userId = checkUserSession()
    if (!userId) return
    
    const response = await fetch(`https://mobil.alkbusiness.com/api/Payment/GetPaymentTop?UserId=${userId}`)
    const data = await response.json()
    
    if (data && data.length > 0) {
      paymentLists.value = data
      selectedList.value = data[0].ListName // İlk listeyi seç
      
      // Liste bilgileri yüklendikten sonra verileri yükle
      fetchPaymentList()
    } else {
      showNotification('Liste verileri bulunamadı.', 'error')
    }
  } catch (error) {
    console.error('Liste çekme hatası:', error)
    showNotification('Listeler yüklenirken bir hata oluştu.', 'error')
  }
}

// Fetch payment list from API
const fetchPaymentList = async () => {
  if (!selectedList.value) return
  
  isLoading.value = true
  try {
    // Kullanıcı oturumunu kontrol et
    const userId = checkUserSession()
    if (!userId) return
    
    // Yeni API formatı - query parametreleri ile
    const listNo = selectedList.value
    const response = await fetch(`https://mobil.alkbusiness.com/api/Payment/GetPaymentList?ListNo=${listNo}&UserId=${userId}`)
    const data = await response.json()
    
    // Convert API data to rows format
    rows.value = data.map(item => {
      return {
        id: item.Id || item.id || '',
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
        ortVade: item.AverageMaturity,
        not: item.Description,
        toplamOdeme: item.TotalPayment
      }
    }).filter(row => row.sonFatura && row.sonOdemeBilgisi)
    
    showNotification('Veriler başarıyla yüklendi.', 'success')
  } catch (error) {
    console.error('Veri çekme hatası:', error)
    showNotification('Veri yüklenirken bir hata oluştu.', 'error')
  } finally {
    isLoading.value = false
  }
}

// Validate date to check if it's a valid date
const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date) && date.toString() !== 'Invalid Date'
}

// Logout process
const handleLogout = () => {
  // Clear cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  
  // Clear local and session storage
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
  
  // Redirect to login page
  router.push('/login')
}

// Format currency values for display
function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return ''
  return new Intl.NumberFormat('tr-TR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(value)
}

// Event handler for currency field focus
function onCurrencyFocus(event, row, field) {
  // Doğru alanın değerini göster
  if (field === 'nakit') {
    event.target.value = row.nakit || ''
  } else if (field === 'havale') {
    event.target.value = row.havale || ''
  } else if (field === 'cek') {
    event.target.value = row.cek || ''
  }
}

// Event handler for currency field blur
function onCurrencyBlur(event, row, field) {
  // Get value and parse it
  let value = event.target.value
  
  // Remove all non-numeric characters except comma and dot
  value = value.replace(/[^\d.,]/g, '')
  
  // Remove dots (thousand separators in Turkish locale)
  value = value.replace(/\./g, '')
  
  // Replace comma with dot for JS parsing
  value = value.replace(/,/g, '.')
  
  // Parse to number and update the model
  const numericValue = parseFloat(value)
  const parsedValue = isNaN(numericValue) ? 0 : numericValue
  
  // Her alan kendi değerini almalı, karışıklık olmamalı
  if (field === 'nakit') {
    row.nakit = parsedValue
  } else if (field === 'havale') {
    row.havale = parsedValue
  } else if (field === 'cek') {
    row.cek = parsedValue
  }
  
  // Toplam değeri burada güncelle - tablonun hemen yenilenmesi için
  row.toplamOdeme = (Number(row.nakit) || 0) + 
                   (Number(row.havale) || 0) + 
                   (Number(row.cek) || 0)
  
  // Format for display
  event.target.value = formatCurrency(parsedValue)
}

// Validate numeric input to prevent letter input
function validateNumericInput(event, row, field) {
  // Get the current input value
  let value = event.target.value
  
  // Remove any non-numeric characters (except comma and dot for decimals)
  let filteredValue = value.replace(/[^\d.,]/g, '')
  
  // Update the input field with the filtered value if it changed
  if (value !== filteredValue) {
    event.target.value = filteredValue
  }
}

// Vue currency formatter directive - NOT USED ANYMORE
const vCurrency = {
  mounted: (el, binding) => {
    const formatValue = (value) => {
      if (value === '' || value === null || value === undefined) return ''
      
      const locale = binding.value?.locale || 'tr-TR'
      const currency = binding.value?.currency || ''
      
      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...(currency && { style: 'currency', currency })
      })
      
      return formatter.format(value)
    }
    
    const getValue = () => {
      let value = el.value
      
      // Remove all non-numeric characters except decimal separator
      value = value.replace(/[^\d.,]/g, '')
      
      // Handle Turkish number format (dot as thousands separator, comma as decimal)
      value = value.replace(/\./g, '') // Remove dots (thousand separators)
      value = value.replace(/,/g, '.') // Replace comma with dot for JS parsing
      
      return parseFloat(value) || 0
    }
    
    // When input changes - now just store the raw value without formatting
    el.addEventListener('input', (e) => {
      const rawValue = getValue()
      if (binding.value && typeof binding.value === 'object') {
        binding.value.value = rawValue
      }
      // No DOM update here - let user continue typing without formatting
    })
    
    // Clear input on focus and show raw value
    el.addEventListener('focus', () => {
      const numericValue = getValue()
      el.value = numericValue || ''
    })
    
    // Format on blur - only format when user leaves the field
    el.addEventListener('blur', () => {
      const numericValue = getValue()
      if (binding.value && typeof binding.value === 'object') {
        binding.value.value = numericValue
        binding.value.formatted = formatValue(numericValue)
      }
      el.value = formatValue(numericValue)
    })
  }
}

function updatePaymentAmounts(row) {
  // Update total payment - API tarafında da güncellemek için
  row.toplamOdeme = (Number(row.nakit) || 0) + 
                    (Number(row.havale) || 0) + 
                    (Number(row.cek) || 0)

  // Send to API
  const sendToApi = async () => {
    try {
      // Kullanıcı oturumunu kontrol et
      const userId = checkUserSession()
      if (!userId) return

      // API'nin beklediği sadece bu alanları içeren istek gövdesi
      const requestData = {
        Cash: Number(row.nakit) || 0,
        WireTransfer: Number(row.havale) || 0,
        Check: Number(row.cek) || 0,
        AverageMaturity: Number(row.ortVade) || 0,
        Description: row.not || ''
      }

      // URL'de ID parametresi ile çağrı yap
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
        const updatedValue = row.toplamOdeme
        showNotification(`Ödeme başarıyla güncellendi. Toplam: ${formatNumber(updatedValue)}`, 'success')
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      showNotification(`Ödeme güncellenirken bir hata oluştu: ${error.message}`, 'error')
    }
  }

  // Start API submission
  sendToApi()
}

// Yazdır fonksiyonunu ekleyelim
// Yazdır fonksiyonunu ekleyelim
const printTable = () => {
  // Verinin tamamını içeren yeni bir pencere oluşturalım
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  
  // Yeni pencere için HTML içeriği oluşturalım
  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ödeme Listesi</title>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 4px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .group-header {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .text-right {
          text-align: right;
        }
        .text-red {
          color: red;
        }
        .total-row {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            padding: 0;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      </style>
    </head>
    <body>
      <h2>Ödeme Listesi</h2>
      <table>
        <thead>
          <tr>
            <th>Cari Bilgileri</th>
            <th>Firma Tipi</th>
            <th>Birim Adı</th>
            <th class="text-right">Bakiye TL</th>
            <th class="text-right">Güncel TL</th>
            <th class="text-right">Bakiye Döviz</th>
            <th>Son Fatura</th>
            <th>Son Ödeme</th>
            <th class="text-right">Nakit</th>
            <th class="text-right">Havale</th>
            <th class="text-right">Çek</th>
            <th class="text-right">Ort. Vade</th>
            <th>Not</th>
            <th class="text-right">Toplam</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Gruplara göre tüm satırları ekleyelim
  Object.entries(groupedRows.value).forEach(([groupName, groupRows]) => {
    // Grup başlığı
    printContent += `
      <tr class="group-header">
        <td colspan="14">${groupName}</td>
      </tr>
    `;
    
    // Grup satırları
    groupRows.forEach(row => {
      printContent += `
        <tr>
          <td>
            <div>${row.cariKod}</div>
            <div>${row.cariIsim}</div>
          </td>
          <td>${row.firmaTipi || ''}</td>
          <td>${row.birimAdi || ''}</td>
          <td class="text-right ${row.bakiyeTL < 0 ? 'text-red' : ''}">${formatNumber(row.bakiyeTL)}</td>
          <td class="text-right ${row.guncelBakiyeTL < 0 ? 'text-red' : ''}">${formatNumber(row.guncelBakiyeTL)}</td>
          <td class="text-right">${formatNumber(row.bakiyeDoviz)}</td>
          <td>${isValidDate(row.sonFatura) ? formatDate(row.sonFatura) : ''}</td>
          <td>${isValidDate(row.sonOdemeBilgisi) ? formatDate(row.sonOdemeBilgisi) : ''}</td>
          <td class="text-right">${formatNumber(row.nakit)}</td>
          <td class="text-right">${formatNumber(row.havale)}</td>
          <td class="text-right">${formatNumber(row.cek)}</td>
          <td class="text-right">${row.ortVade || ''}</td>
          <td>${row.not || ''}</td>
          <td class="text-right">${formatNumber(row.toplamOdeme)}</td>
        </tr>
      `;
    });
  });
  
  // Toplam satırı ekleyelim
  printContent += `
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" class="text-right">Toplam:</td>
            <td class="text-right">${formatNumber(totalBakiye.value)}</td>
            <td class="text-right">${formatNumber(totalGuncelBakiye.value)}</td>
            <td colspan="3"></td>
            <td class="text-right">${formatNumber(totalNakit.value)}</td>
            <td class="text-right">${formatNumber(totalHavale.value)}</td>
            <td class="text-right">${formatNumber(totalCek.value)}</td>
            <td colspan="2"></td>
            <td class="text-right">${formatNumber(totalAmount.value)}</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;
  
  // Yeni pencereye içeriği yazalım
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // İçerik yüklendikten sonra yazdırma işlemini başlatalım
  printWindow.onload = function() {
    // Kısa bir gecikme ekleyelim (resimlerin yüklenmesi için)
    setTimeout(function() {
      printWindow.print();
      // Yazdırma işlemi tamamlandıktan sonra pencereyi kapatmak istiyorsanız:
      // printWindow.close();
    }, 500);
  };
  
  // Yazdırma işlemi başarılı bildirimini göster
  showNotification('Yazdırma işlemi başlatıldı.', 'success');
}
// Sorting function
const sortRows = (rows) => {
  if (!sortColumn.value) return rows

  return [...rows].sort((a, b) => {
    let aValue = a[sortColumn.value]
    let bValue = b[sortColumn.value]

    // Special processing for numerical values
    if (['bakiyeTL', 'guncelBakiyeTL', 'bakiyeDoviz', 'nakit', 'havale', 'cek', 'ortVade', 'toplamOdeme'].includes(sortColumn.value)) {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    }

    // Special processing for date values
    if (['sonFatura', 'sonOdemeBilgisi'].includes(sortColumn.value)) {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
}

// Toggle sort direction
const toggleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

// Show sort icon
const getSortIcon = (column) => {
  if (sortColumn.value !== column) return 'fas fa-sort'
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

// Calculate filtered and sorted rows
const filteredAndSortedRows = computed(() => {
  let result = filteredRows.value
  return sortRows(result)
})

// Calculate filtered rows
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
    const groupName = row.group || 'Diğer' // Add rows without group to "Other" group
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(row)
  })
  return groups
})

const totalAmount = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.toplamOdeme) || 0), 0)
})

const totalBakiye = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.bakiyeTL) || 0), 0)
})

const totalGuncelBakiye = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.guncelBakiyeTL) || 0), 0)
})

const totalBakiyeDoviz = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.bakiyeDoviz) || 0), 0)
})

const totalNakit = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.nakit) || 0), 0)
})

const totalHavale = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.havale) || 0), 0)
})

const totalCek = computed(() => {
  return filteredAndSortedRows.value.reduce((sum, row) => sum + (Number(row.cek) || 0), 0)
})

function formatNumber(value) {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function formatDate(date) {
  if (!date) return ''
  const formattedDate = new Date(date).toLocaleDateString('tr-TR')
  return formattedDate === 'Invalid Date' ? '' : formattedDate
}

const showNotification = (message, type) => {
  notification.value = { visible: true, message, type }
  setTimeout(() => {
    notification.value.visible = false
  }, 3000) // Disappears automatically after 3 seconds
}

// Table navigation handlers
const handleTableKeydown = (event) => {
  if (!activeCell.value) return
  
  const { rowIndex, cellIndex } = activeCell.value
  let nextRowIndex = rowIndex
  let nextCellIndex = cellIndex
  
  switch (event.key) {
    case 'ArrowUp':
      nextRowIndex = Math.max(0, rowIndex - 1)
      event.preventDefault()
      break
    case 'ArrowDown':
      nextRowIndex = Math.min(getFlattenedRows().length - 1, rowIndex + 1)
      event.preventDefault()
      break
    case 'ArrowLeft':
      nextCellIndex = Math.max(0, cellIndex - 1)
      event.preventDefault()
      break
    case 'ArrowRight':
      // İlgili satırda kaç hücre var hesaplanmalı (örnek olarak 14 varsayıyorum)
      nextCellIndex = Math.min(13, cellIndex + 1)
      event.preventDefault()
      break
    case 'Tab':
      if (event.shiftKey) {
        nextCellIndex = Math.max(0, cellIndex - 1)
      } else {
        nextCellIndex = Math.min(13, cellIndex + 1)
      }
      if (nextCellIndex === cellIndex) {
        if (event.shiftKey) {
          nextRowIndex = Math.max(0, rowIndex - 1)
          nextCellIndex = 13 // Son hücre
        } else {
          nextRowIndex = Math.min(getFlattenedRows().length - 1, rowIndex + 1)
          nextCellIndex = 0 // İlk hücre
        }
      }
      event.preventDefault()
      break
    case 'Enter':
      // Enter tuşu aşağı gider
      nextRowIndex = Math.min(getFlattenedRows().length - 1, rowIndex + 1)
      event.preventDefault()
      break
    default:
      return // Diğer tuşlar için bir şey yapma
  }
  
  // Yeni hücreyi bul ve odaklan
  focusCell(nextRowIndex, nextCellIndex)
}

// Hücreye tıklama ile aktif hücreyi ayarla
const setActiveCell = (rowIndex, cellIndex) => {
  activeCell.value = { rowIndex, cellIndex }
}

// Belirli bir hücreye odaklan
const focusCell = (rowIndex, cellIndex) => {
  activeCell.value = { rowIndex, cellIndex }
  
  // DOM'da ilgili hücreyi bul ve odaklan
  setTimeout(() => {
    const rows = document.querySelectorAll('tbody tr:not(.bg-gray-100)') // Grup başlıkları hariç
    if (rows[rowIndex]) {
      const cells = rows[rowIndex].querySelectorAll('td')
      if (cells[cellIndex]) {
        const input = cells[cellIndex].querySelector('input')
        if (input) {
          input.focus()
        } else {
          cells[cellIndex].focus()
        }
      }
    }
  }, 0)
}

// Düzleştirilmiş satırları al (grup başlıkları hariç)
const getFlattenedRows = () => {
  return Object.values(groupedRows.value).flat()
}

// Gruba ve grup içindeki indekse göre genel satır indeksini hesapla
const getGlobalRowIndex = (groupName, rowIndexInGroup) => {
  let globalIndex = 0
  
  for (const [gName, rows] of Object.entries(groupedRows.value)) {
    if (gName === groupName) {
      return globalIndex + rowIndexInGroup
    }
    globalIndex += rows.length
  }
  
  return 0
}
</script>

<style scoped>
/* Font Awesome import */
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

/* Transitions */
.transition-all {
  transition-property: all;
}

.transition-opacity {
  transition-property: opacity;
}

.duration-300 {
  transition-duration: 300ms;
}

.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile sidebar positioning */
@media (max-width: 768px) {
  .sidebar-transition {
    transition: all 0.3s ease;
  }
}

/* Additional responsive styles */
/* No extra mobile styles needed initially, relying on Tailwind classes */
@media (max-width: 640px) {
  th, td {
    padding: 0.5rem 0.25rem;
    font-size: 0.75rem;
  }
  
  .overflow-x-auto {
    max-height: calc(100vh - 180px);
  }
}

/* Landscape mode for mobile devices */
@media (max-height: 500px) and (orientation: landscape) {
  .overflow-x-auto {
    max-height: calc(100vh - 100px);
  }
  
  /* Make sidebar smaller in landscape */
  .w-64 {
    width: 160px !important;
  }
  
  /* Reduce padding in filters area */
  .p-6 {
    padding: 0.75rem !important;
  }
  
  /* Reduce vertical spacing */
  .space-y-6 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
  }
}
</style>