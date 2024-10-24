<template>
    <div>
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-8">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-error">
            <span>{{ error }}</span>
        </div>

        <!-- Content -->
        <div v-else>
            <!-- Files Display -->
            <div v-if="attachments.length > 0">
                <h3 class="text-sm font-semibold mb-1">เอกสารแนบ</h3>
                <div class="flex flex-wrap gap-2">
                    <div v-for="(doc, index) in attachments" :key="index"
                        class="w-20 h-20 rounded overflow-hidden border border-gray-200">
                        <img v-if="isImageFile(doc.file_url)" :src="doc.file_url"
                            @click="openGallery(getImageFiles(), getImageIndex(doc))"
                            class="w-full h-full object-cover cursor-pointer" />
                        <a v-else :href="doc.file_url" target="_blank"
                            class="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-1 hover:bg-gray-200">
                            <i :class="getFileIcon(doc.file_name)" class="text-xl mb-1"></i>
                            <span class="text-xs text-center break-words w-full" :title="doc.file_name">
                                {{ truncateFileName(doc.file_name) }}
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gallery Modal -->
        <dialog ref="modalRef" class="modal" :class="{ 'modal-open': showGallery }">
            <div class="modal-box max-w-4xl">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        @click="closeGallery">✕</button>
                </form>
                <div class="relative">
                    <img :src="currentImage" class="max-h-[60vh] mx-auto mb-4" />
                    <div class="absolute top-2 left-2">
                        <span class="badge badge-primary">
                            {{ getCurrentImageSubtype }}
                        </span>
                    </div>
                    <div class="text-center text-sm text-gray-600 mt-2">
                        {{ currentIndex + 1 }} / {{ currentGalleryImages.length }}
                    </div>
                </div>
                <div class="flex justify-between mt-4">
                    <button @click="prevImage" class="btn btn-primary">ก่อนหน้า</button>
                    <button @click="nextImage" class="btn btn-primary">ถัดไป</button>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button @click="closeGallery">close</button>
            </form>
        </dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import CONFIG from '../../../config/config';

const props = defineProps({
    type: {
        type: String,
        required: true,
        validator: (value) => ['IN', 'OUT'].includes(value)
    },
    relateEir: {
        type: [Number, String],
        required: true
    }
});

// State
const loading = ref(true);
const error = ref(null);
const attachments = ref([]);
const showGallery = ref(false);
const modalRef = ref(null);
const currentGalleryImages = ref([]);
const currentIndex = ref(0);

// Computed
const currentImage = computed(() => {
    if (currentGalleryImages.value.length === 0) return '';
    return currentGalleryImages.value[currentIndex.value].file_url;
});

// Methods
const fetchAttachments = async () => {
    try {

        loading.value = true;
        const response = await axios.get(`${CONFIG.API_SERVER}/api/EIR/getBookingOrContainerFiles`, {
            params: {
                type: props.type,
                relate_eir: props.relateEir
            }
        });
        attachments.value = response.data;
    } catch (err) {
        console.error('Error fetching attachments:', err);
        error.value = 'ไม่สามารถดึงข้อมูลไฟล์แนบได้';
    } finally {
        loading.value = false;
    }
};

const isImageFile = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'fas fa-file-pdf text-red-500';
        case 'xls':
        case 'xlsx':
            return 'fas fa-file-excel text-green-500';
        case 'doc':
        case 'docx':
            return 'fas fa-file-word text-blue-500';
        default:
            return 'fas fa-file text-gray-500';
    }
};

const truncateFileName = (fileName, maxLength = 15) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.slice(0, -(extension.length + 1));
    const truncatedName = nameWithoutExtension.slice(0, maxLength - 3) + '...';
    return `${truncatedName}.${extension}`;
};

const getImageFiles = () => {
    return attachments.value
        .filter(file => isImageFile(file.file_url))
        .map(file => ({
            ...file,
            file_url: file.file_url,
            subtype: file.subtype
        }));
};

// เพิ่ม computed property
const getCurrentImageSubtype = computed(() => {
    if (currentGalleryImages.value.length === 0) return '';
    const currentFile = currentGalleryImages.value[currentIndex.value];
    switch (currentFile.subtype) {
        case 'BL':
            return 'เอกสาร BL';
        case 'Container':
            return 'รูปภาพตู้';
        default:
            return currentFile.subtype;
    }
});

const getImageIndex = (doc) => {
    return getImageFiles().findIndex(file => file.file_url === doc.file_url);
};

const openGallery = (images, index) => {
    currentGalleryImages.value = images;
    currentIndex.value = index;
    showGallery.value = true;
    nextTick(() => {
        modalRef.value?.showModal();
    });
};

const closeGallery = () => {
    showGallery.value = false;
    modalRef.value?.close();
};

const nextImage = () => {
    if (currentIndex.value < currentGalleryImages.value.length - 1) {
        currentIndex.value++;
    }
};

const prevImage = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
};

// Handle keyboard events
const handleKeyDown = (e) => {
    if (!showGallery.value) return;

    switch (e.key) {
        case 'Escape':
            closeGallery();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
    }
};

// Lifecycle
onMounted(() => {
    fetchAttachments();
    document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.modal-box {
    max-height: 90vh;
}

.modal-box img {
    object-fit: contain;
}

dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
}

dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes zoom {
    from {
        transform: scale(0.95);
    }

    to {
        transform: scale(1);
    }
}

.modal {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
}

.modal.modal-open {
    opacity: 1;
    visibility: visible;
}
</style>