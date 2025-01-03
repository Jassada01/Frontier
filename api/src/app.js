const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const clientRoutes = require("./routes/clientRoutes");
const agentRoutes = require("./routes/agentRoutes");
const zoneRoutes = require("./routes/zoneRoutes");
const truckCompanyRoutes = require("./routes/truckCompanyRoutes");
const commonRoutes = require("./routes/commonRoutes");
const driverRoutes = require("./routes/driverRoutes");
const yardsRoutes = require("./routes/yardsRoutes");
const equipmentInterchangeReceiptRoutes = require("./routes/equipmentInterchangeReceiptRoutes");
const priceRoutes = require("./routes/priceRoutes");
const priceListCustomRoutes = require("./routes/priceListCustomRoutes");
const eirMatchRoutes = require("./routes/eirMatchRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const lineUserProfilesRoutes = require("./routes/lineUserProfilesRoutes");
const detentionLogsRoutes = require("./routes/detentionLogsRoutes"); // เพิ่มการนำเข้าเส้นทางนี้
const clientFreeDropPeriodRoutes = require("./routes/clientFreeDropPeriodRoutes");
const requestContainerReturnRoutes = require("./routes/requestContainerReturnRoutes"); // เพิ่มบรรทัดนี้
const lineGroupCombinedRoutes = require("./routes/lineGroupCombinedRoutes"); // เพิ่มบรรทัดนี้
const requestContainerReceiveRoutes = require("./routes/requestContainerReceiveRoutes"); // เพิ่มบรรทัดนี้
const eirTasksRoutes = require("./routes/eirTasksRoutes"); // เพิ่มบรรทัดนี้
const firebaseUploadFileRoutes = require("./routes/firebaseUploadFileRoutes"); // เพิ่มบรรทัดนี้
const groupEirRoutes = require("./routes/groupEirRoutes"); // เพิ่มบรรทัดนี้



const app = express();

// ใช้ CORS middleware
app.use(
  cors({
    origin: true, // เพิ่ม origin ของ IP address
    credentials: true, // เพื่ออนุญาตการส่งคุกกี้
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api", uploadRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/truck_companies", truckCompanyRoutes);
app.use("/api/common", commonRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/yards", yardsRoutes);
app.use("/api/EIR", equipmentInterchangeReceiptRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/price_custom", priceListCustomRoutes);
app.use("/api/eir_match", eirMatchRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/line_user_profiles", lineUserProfilesRoutes);
app.use("/api/detentionLogs", detentionLogsRoutes); // เพิ่มเส้นทางนี้
app.use("/api/client_free_drop_period", clientFreeDropPeriodRoutes);
app.use("/api/container-returns", requestContainerReturnRoutes); // เพิ่มบรรทัดนี้
app.use("/api/line-groups", lineGroupCombinedRoutes); // เพิ่มบรรทัดนี้
app.use("/api/container-receives", requestContainerReceiveRoutes); // เพิ่มบรรทัดนี้
app.use("/api/tasks", eirTasksRoutes); // เพิ่มบรรทัดนี้
app.use("/api/firebase-upload-file", firebaseUploadFileRoutes); // เพิ่มบรรทัดนี้
app.use("/api/group-eir", groupEirRoutes); // เพิ่มบรรทัดนี้




const port = process.env.PORT || 3000;

// ตั้งค่า Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // ตรวจสอบว่าทางไฟล์ถูกต้อง
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
});
