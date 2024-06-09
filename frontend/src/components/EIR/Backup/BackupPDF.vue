<template>
    <div>
        <li @click="generatePDF"><a><i class="fa-solid fa-file-pdf"></i> Print</a></li>
    </div>
</template>
<script setup>
import { jsPDF } from 'jspdf';
import font_config from '../../config/font_config';
import moment from 'moment';

// นำเข้ารูปภาพ
import backgroundImage from '../../assets/backgroundImage.png';

const thSarabunBase64 = font_config.thSarabunBase64;
const checkSVGBase64 = `data:image/png;base64,${font_config.check_png}`;

const props = defineProps({
    data: {
        type: Object,
        required: true
    }
});

const { data } = toRefs(props);

function generateCheckMarkObject(doc, entryType, dropContainer) {
    if (entryType === "IN") {
        doc.addImage(checkSVGBase64, 'PNG', 65, 130, 15, 15);
    } else if (entryType === "OUT") {
        doc.addImage(checkSVGBase64, 'PNG', 65, 160, 15, 15);
    }

    if (dropContainer) {
        doc.addImage(checkSVGBase64, 'PNG', 168, 160, 15, 15);
    }
}

const generatePDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');

    // นำเข้าฟอนต์ TH Sarabun New
    doc.addFileToVFS('THSarabunNew.ttf', thSarabunBase64);
    doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
    doc.setFont('THSarabunNew');

    // เพิ่มรูปภาพ background
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
        doc.addImage(img, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

        generateCheckMarkObject(doc, data.value.entry_type, data.value.drop_container);

        doc.setFontSize(16);

        // Header
        doc.text(data.value.receipt_no, 425, 130);
        doc.text(moment(data.value.date).format('D/M/YYYY H:mm'), 425, 155);

        // Info Line 1
        doc.text(data.value.agent_code, 105, 200);
        doc.text(data.value.container, 265, 200);
        doc.text(data.value.container_color, 470, 200);

        // Info Line 2
        doc.text(data.value.client_code, 105, 222);
        doc.text(data.value.size_type, 365, 222);
        doc.text(formatNumberValue(data.value.tare), 470, 222);

        // Info Line 3
        doc.text(data.value.booking_bl, 105, 243);
        doc.text(data.value.seal_no, 235, 243);
        doc.text(data.value.vessel, 360, 243);
        doc.text(data.value.voyage, 470, 243);

        // Driver Info 1
        doc.text(data.value.truck_license, 108, 305);
        doc.text(data.value.truck_company, 360, 305);

        // Driver Info 2
        doc.text(data.value.driver_name, 108, 325);
        doc.text(data.value.tel, 360, 325);

        // Original Yard
        doc.text(data.value.yard, 108, 350);

        // Add conditions dynamically
        data.value.conditions.forEach((condition) => {
            doc.addImage(checkSVGBase64, 'PNG', condition.position_x, condition.position_y, 15, 15);
        });

        // Remark
        doc.text(data.value.remark, 135, 482);

        // PIC Name
        doc.text(data.value.update_user_name, 365, 715, { align: "center" });

        doc.save(`${data.value.receipt_no}.pdf`);
    };
};
</script>
