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
          <div class="p-4 flex flex-col sm:flex-row justify-between items-center border-b">
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-0">
              <h1 class="text-lg font-bold sm:hidden">Ödeme Listeleri (LST-1)</h1>
              <div class="flex space-x-2">
    
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="printTable" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm flex items-center">
                <i class="fas fa-print mr-1"></i> Yazdır
              </button>
              
              <button @click="fetchPaymentList" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm flex items-center">
                <i class="fas fa-sync-alt mr-1"></i> Yenile
              </button>
            </div>
          </div>

          <!-- Filters -->
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

          <!-- Loading indicator -->
          <div v-if="isLoading" class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p class="mt-2 text-gray-600">Veriler yükleniyor...</p>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto" style="max-height: calc(100vh - 220px); position: relative;">
            <table class="min-w-full divide-y divide-gray-200">
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
                    <td colspan="16" class="px-2 py-1 font-semibold">{{ groupName }}</td>
                  </tr>
                  <tr v-for="row in group" :key="row.cariKod">
                    <!-- Removed ID cell -->
                    <td class="px-2 py-1">
                      <div class="flex flex-col">
                        <span class="font-bold">{{ row.cariKod }}</span>
                        <span class="text-gray-600 text-sm">{{ row.cariIsim }}</span>
                      </div>
                    </td>
                    <td class="px-2 py-1">{{ row.firmaTipi }}</td>
                    <td class="px-2 py-1">{{ row.birimAdi }}</td>
                    <td class="px-2 py-1 text-right" :class="{'text-red-600': row.bakiyeTL < 0}">
                      {{ formatNumber(row.bakiyeTL) }}
                    </td>
                    <td class="px-2 py-1 text-right" :class="{'text-red-600': row.guncelBakiyeTL < 0}">
                      {{ formatNumber(row.guncelBakiyeTL) }}
                    </td>
                    <td class="px-2 py-1 text-right">{{ formatNumber(row.bakiyeDoviz) }}</td>
                    <td class="px-2 py-1">{{ isValidDate(row.sonFatura) ? formatDate(row.sonFatura) : '' }}</td>
                    <td class="px-2 py-1">{{ isValidDate(row.sonOdemeBilgisi) ? formatDate(row.sonOdemeBilgisi) : '' }}</td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.nakit)" 
                        @input="updateCurrencyField($event, row, 'nakit')"
                        class="w-20 text-right border-gray-300 rounded bg-green-100" 
                        @blur="updatePaymentAmounts(row)">
                    </td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.havale)" 
                        @input="updateCurrencyField($event, row, 'havale')"
                        class="w-20 text-right border-gray-300 rounded bg-green-100"
                        @blur="updatePaymentAmounts(row)">
                    </td>
                    <td class="px-2 py-1 text-center">
                      <input type="text" 
                        :value="formatCurrency(row.cek)" 
                        @input="updateCurrencyField($event, row, 'cek')"
                        class="w-20 text-right border-gray-300 rounded bg-green-100"
                        @blur="updatePaymentAmounts(row)">
                    </td>
                    <td class="px-2 py-1 text-right">
                      <input type="number" v-model="row.ortVade" 
                        class="w-16 text-right border-gray-300 rounded bg-green-100"
                        @change="updatePaymentAmounts(row)">
                    </td>
                    <td class="px-2 py-1">
                      <input type="text" v-model="row.not" 
                        class="w-full border-gray-300 rounded bg-green-100"
                        @change="updatePaymentAmounts(row)">
                    </td>
                    <td class="px-2 py-1 text-right">{{ formatNumber(row.toplamOdeme) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
            
            <!-- Footer - Total Row (As a separate table) -->
            <table class="min-w-full sticky bottom-0 z-10">
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="px-2 py-2 text-right font-semibold bg-gray-50">Toplam:</td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalBakiye) }}</td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalGuncelBakiye) }}</td>
                  <td colspan="3" class="px-2 py-2 bg-gray-50"></td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalNakit) }}</td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalHavale) }}</td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalCek) }}</td>
                  <td colspan="2" class="px-2 py-2 bg-gray-50"></td>
                  <td class="px-2 py-2 text-right font-semibold bg-gray-50">{{ formatNumber(totalAmount) }}</td>
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
const rows = ref([])
const isLoading = ref(false)
const searchTerm = ref('')
const sortColumn = ref('')
const sortDirection = ref('asc')
const notification = ref({ visible: false, message: '', type: 'success' })
const isNavbarOpen = ref(false) // For mobile overlay
const isCollapsed = ref(true) // Always start collapsed

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
  
  // Load payment data
  fetchPaymentList()
})

// Fetch payment list from API
const fetchPaymentList = async () => {
  isLoading.value = true
  try {
    const listId = route.query.id || 'AKAL-LST-1' // Get id parameter from URL, or use default value
    const response = await fetch(`https://mobil.alkbusiness.com/api/Payment/GetPaymentList/${listId}`)
    const data = await response.json()
    
    // Convert API data to rows format
    rows.value = data.map(item => {
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

// Parse currency input and update the model
function updateCurrencyField(event, row, field) {
  // Remove non-numeric characters except decimal point
  let value = event.target.value.replace(/[^\d.,]/g, '')
  
  // Handle comma as decimal separator (Turkish format)
  value = value.replace(/,/g, '.')
  
  // If multiple decimal points, keep only the first one
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // Convert to number and update the model
  row[field] = value === '' ? 0 : parseFloat(value)
}

function updatePaymentAmounts(row) {
  // Update total payment
  row.toplamOdeme = (Number(row.nakit) || 0) + 
                    (Number(row.havale) || 0) + 
                    (Number(row.cek) || 0)

  // Send to API
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
</style>