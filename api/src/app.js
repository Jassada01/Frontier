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
const driverRoutes = require("./routes/driverRoutes"); // เพิ่มการนำเข้า driverRoutes
const yardsRoutes = require("./routes/yardsRoutes"); // เพิ่มการนำเข้า driverRoutes

const app = express();

// ใช้ CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // แทนที่ด้วย origin ของคุณ
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
app.use("/api/drivers", driverRoutes); // เพิ่มการใช้งาน driverRoutes
app.use("/api/yards", yardsRoutes); // เพิ่มการใช้งาน driverRoutes

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
