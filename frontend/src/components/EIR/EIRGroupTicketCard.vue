<template>
    <div class="max-w-md transform transition-all hover:scale-105 h-full">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden relative h-full flex flex-col">
        <!-- Ticket Header -->
        <div 
          :class="[
            'relative p-6',
            isInbound(eir) ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-rose-500 to-red-400'
          ]"
        >
          <div class="absolute -left-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-white/80 text-sm font-medium">Container</p>
                <h3 class="text-white text-2xl font-bold tracking-wider mt-1">{{ eir.container }}</h3>
                <p class="text-white/90 font-medium mt-1">{{ eir.size_type }}</p>
              </div>
              <span 
                :class="[
                  'px-4 py-1 rounded-full text-sm font-semibold',
                  isInbound(eir) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ isInbound(eir) ? 'IN' : 'OUT' }}
              </span>
            </div>
          </div>
        </div>
  
        <!-- Ticket Body -->
        <div class="p-6 bg-white flex-grow">
          <!-- Dotted line separator -->
          <div class="border-t-2 border-dashed border-gray-200 -mx-6 mb-6"></div>
          
          <!-- Details Grid -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="col-span-2">
              <p class="text-gray-500 text-sm">Receipt No.</p>
              <p class="font-medium mt-1">{{ eir.receipt_no || '-' }}</p>
            </div>
            <div class="flex flex-col space-y-2">
              <div>
                <p class="text-gray-500 text-xs">Vessel</p>
                <p class="text-sm mt-0.5 text-gray-700">{{ eir.vessel || '-' }}</p>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Voyage</p>
                <p class="text-sm mt-0.5 text-gray-700">{{ eir.voyage || '-' }}</p>
              </div>
            </div>
          </div>
  
          <!-- Status Badge -->
          <div class="flex items-center justify-between mb-6">
            <span class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              {{ eir.status.th }}
            </span>
          </div>
  
          <!-- Invoices -->
          <div class="space-y-3" v-if="eir.invoices?.length">
            <div 
              v-for="invoice in eir.invoices" 
              :key="invoice.invoice_no"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              @click="navigateToInvoice(eir.id, invoice.invoice_no)"
            >
              <div>
                <p class="text-sm font-medium">{{ invoice.invoice_no }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ formatAmount(invoice.total_amount) }}</p>
              </div>
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  invoice.status === 'ชำระแล้ว' ? 'bg-green-100 text-green-700' : 
                  invoice.status === 'รอชำระ' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-red-100 text-red-700'
                ]"
              >
                {{ invoice.status }}
              </span>
            </div>
          </div>
        </div>
  
        <!-- Ticket Footer -->
        <div class="px-6 py-4 bg-gray-50 flex justify-end">
          <button 
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            @click="navigateToEIR(eir.id)"
          >
            <span>ดูรายละเอียด</span>
            <span class="i-lucide-chevron-right h-4 w-4"></span>
          </button>
        </div>
  
        <!-- Ticket Edge Circles -->
        <div class="absolute left-0 top-1/2 w-4 h-4 -ml-2 bg-gray-100 rounded-full"></div>
        <div class="absolute right-0 top-1/2 w-4 h-4 -mr-2 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  defineProps({
    eir: {
      type: Object,
      required: true
    }
  })
  
  const isInbound = (eir) => eir.receipt_no?.includes('IN') || false
  
  const formatAmount = (amount) =>
    new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB' 
    }).format(amount)
  
  const navigateToEIR = (eirId) => {
    router.push(`/EIR/${eirId}`)
  }
  
  const navigateToInvoice = (eirId, invoiceNo) => {
    router.push(`/EIR/${eirId}?inv=${invoiceNo}`)
  }
  </script>