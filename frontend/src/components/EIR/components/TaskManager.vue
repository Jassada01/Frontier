<script setup>
import { ref, onMounted } from "vue";
import Multiselect from "vue-multiselect";
import CONFIG from '../../../config/config';
import axios from "axios";
import moment from 'moment';  // Import Moment.js
import Swal from 'sweetalert2';




const props = defineProps({
    eirId: {
        type: Number,
        required: true,
    },
});

const emit = defineEmits(["tasksSaved", "tasksUpdated"]); // เพิ่ม tasksUpdated event

const taskOptions = ref([]);
const tasks = ref([]);
const newTask = ref(null);
const isLoading = ref(false);
// EIRForm.vue - เพิ่มตัวแปรและฟังก์ชันใหม่
const currentTasks = ref([]); // เพิ่มตัวแปรเก็บค่า tasks

// เพิ่มฟังก์ชันรับค่า tasks ที่ update
const handleTasksUpdated = (updatedTasks) => {
    currentTasks.value = updatedTasks;
    //console.log('Tasks updated:', currentTasks.value);
    // ทำอย่างอื่นกับ tasks ที่ได้รับมาตามต้องการ
};


const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('DD MMM YYYY HH:mm');
};

const completeTask = async (task) => {
    if (!task.task_id) return;

    try {
        isLoading.value = true;
        await axios.put(`${CONFIG.API_SERVER}/api/tasks/${task.task_id}/complete`);
        await fetchEIRTasks(); // จะ emit tasksUpdated ผ่าน fetchEIRTasks
        emit("tasksSaved");
    } catch (error) {
        console.error("Error completing task:", error);
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ Task');
    } finally {
        isLoading.value = false;
    }
};


const fetchMasterTasks = async () => {
    try {
        const response = await axios.get(`${CONFIG.API_SERVER}/api/common/tasks`);
        taskOptions.value = response.data.map((task) => ({
            task_id: task.task_id,
            task_name: task.task_name,
            task_description: task.task_description,
        }));
    } catch (error) {
        console.error("Error fetching master tasks:", error);
    }
};

const fetchEIRTasks = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get(`${CONFIG.API_SERVER}/api/tasks`, {
            params: { eir_id: props.eirId },
        });
        tasks.value = response.data.map((task) => ({
            task_id: task.task_id,
            task_name: task.task_name,
            task_details: task.task_details,
            complete_datetime: task.complete_datetime,
            cancel_flag: task.cancel_flag
        }));
        // ส่งข้อมูล tasks กลับไปที่ parent
        emit("tasksUpdated", tasks.value);
    } catch (error) {
        console.error("Error fetching EIR tasks:", error);
    } finally {
        isLoading.value = false;
    }
};

const addNewTask = async (taskName) => {
    if (!taskName.trim()) return;

    const newTaskData = {
        eir_id: props.eirId,
        task_name: taskName.trim(),
        task_details: ""
    };

    try {
        isLoading.value = true;
        const response = await axios.post(`${CONFIG.API_SERVER}/api/tasks/batch`, {
            tasks: [newTaskData],
        });

        if (response.data.inserted_count > 0) {
            await fetchEIRTasks(); // จะ emit tasksUpdated ผ่าน fetchEIRTasks
            emit("tasksSaved");
        }
    } catch (error) {
        console.error("Error adding new task:", error);
    } finally {
        isLoading.value = false;
        newTask.value = null;
    }
};

const selectTask = async (task) => {
    const isTaskExist = tasks.value.some((t) => t.task_name === task.task_name);
    if (isTaskExist) {
        newTask.value = null;
        return;
    }

    const newTaskData = {
        eir_id: props.eirId,
        task_name: task.task_name,
        task_details: task.task_description || ""
    };

    try {
        isLoading.value = true;
        const response = await axios.post(`${CONFIG.API_SERVER}/api/tasks/batch`, {
            tasks: [newTaskData],
        });

        if (response.data.inserted_count > 0) {
            await fetchEIRTasks();
            emit("tasksSaved");
        }
    } catch (error) {
        console.error("Error adding selected task:", error);
    } finally {
        isLoading.value = false;
        newTask.value = null;
    }
};

const removeTask = async (task, index) => {
    if (!task.task_id) {
        tasks.value.splice(index, 1);
        return;
    }

    try {
        const result = await Swal.fire({
            title: 'ยืนยันการลบงาน',
            text: `คุณต้องการลบงาน "${task.task_name}" ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่, ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            isLoading.value = true;
            await axios.delete(`${CONFIG.API_SERVER}/api/tasks/${task.task_id}`);
            tasks.value.splice(index, 1);
            emit("tasksSaved");

            Swal.fire(
                'ลบสำเร็จ',
                'Task ถูกลบเรียบร้อยแล้ว',
                'success'
            );
        }
    } catch (error) {
        console.error("Error removing task:", error);
        Swal.fire(
            'เกิดข้อผิดพลาด',
            'ไม่สามารถลบ Task ได้',
            'error'
        );
    } finally {
        isLoading.value = false;
    }
};


onMounted(() => {
    fetchMasterTasks();
    fetchEIRTasks();
});
</script>

<template>
    <div class="container mx-auto px-4">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column - Task Input -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h4 class="text-lg font-semibold mb-4">เพิ่มรายการใหม่</h4>
                <Multiselect v-model="newTask" :options="taskOptions" :searchable="true" :allow-empty="false"
                    placeholder="พิมพ์เพื่อค้นหาหรือเพิ่มคำสั่งใหม่" @tag="addNewTask" @select="selectTask"
                    :taggable="true" label="task_name" track-by="task_name" :loading="isLoading" :disabled="isLoading">
                    <template #option="{ option }">
                        <div class="flex flex-col">
                            <span class="font-medium">{{ option.task_name }}</span>
                            <span v-if="option.task_description" class="text-sm text-gray-500">
                                {{ option.task_description }}
                            </span>
                        </div>
                    </template>
                </Multiselect>
            </div>

            <!-- Right Column - Tasks List -->
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="text-lg font-semibold">รายการงาน</h4>
                    <span class="text-sm text-gray-500">
                        ทั้งหมด: {{ tasks.length }} รายการ
                    </span>
                </div>

                <div class="task-container max-h-[calc(100vh-250px)] overflow-y-auto">
                    <div v-if="isLoading" class="flex justify-center items-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>

                    <ul v-else-if="tasks.length > 0" class="task-list space-y-2">
                        <li v-for="(task, index) in tasks" :key="task.task_id || index"
                            class="task-item group p-3 rounded-lg border transition-colors duration-200" :class="{
                                'bg-success/10 border-success/20': task.complete_datetime,
                                'bg-gray-50 hover:bg-white': !task.complete_datetime
                            }">
                            <div class="flex items-center gap-3 w-full">
                                <div class="flex-1">
                                    <div class="font-medium"
                                        :class="{ 'text-green-700': task.complete_datetime, 'text-gray-900': !task.complete_datetime }">
                                        {{ task.task_name }}
                                    </div>
                                    <div v-if="task.complete_datetime" class="text-sm text-green-700">
                                        เสร็จสิ้น: {{ formatDate(task.complete_datetime) }}
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <!-- Complete Button -->
                                    <button v-if="!task.complete_datetime"
                                        class="opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-ghost text-success hover:bg-success/10"
                                        @click="completeTask(task)" :disabled="isLoading">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <!-- Delete Button -->
                                    <button v-if="!task.complete_datetime"
                                        class="opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-ghost text-error hover:bg-error/10"
                                        @click="removeTask(task, index)" :disabled="isLoading">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <div v-else class="flex flex-col items-center justify-center py-8 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>ยังไม่มี Tasks</p>
                        <p class="text-sm">เริ่มเพิ่ม Task ใหม่ได้จากช่องด้านซ้าย</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.task-container {
    max-height: calc(100vh - 250px);
    overflow-y: auto;
}

.task-list {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.task-item {
    padding: 0.75rem;
    border-radius: 0.5rem;
    border-width: 1px;
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
}
</style>