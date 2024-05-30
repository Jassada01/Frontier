-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2024 at 05:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `giraffe_park`
--

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `agent_id` int(11) NOT NULL,
  `agent_code` varchar(50) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `other_details` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`agent_id`, `agent_code`, `company_name`, `contact_name`, `address`, `phone_number`, `email`, `other_details`, `active`) VALUES
(1, 'TWO', 'TWO', 'ZZZZ', 'AAAs', '', '', '', 1),
(2, 'ONE', 'ONEx', '', '', '', '', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `client_id` int(11) NOT NULL,
  `client_code` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `name_eng` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `branch_eng` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `billing_address_eng` varchar(255) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `attribute1` varchar(255) DEFAULT NULL,
  `attribute2` varchar(255) DEFAULT NULL,
  `attribute3` varchar(255) DEFAULT NULL,
  `attribute4` varchar(255) DEFAULT NULL,
  `attribute5` varchar(255) DEFAULT NULL,
  `line_token` varchar(255) NOT NULL,
  `default_language` varchar(2) DEFAULT 'TH',
  `default_payment_method` varchar(50) DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `remark` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`client_id`, `client_code`, `name`, `name_eng`, `branch`, `branch_eng`, `address`, `billing_address`, `billing_address_eng`, `tax_id`, `contact_person`, `phone`, `email`, `attribute1`, `attribute2`, `attribute3`, `attribute4`, `attribute5`, `line_token`, `default_language`, `default_payment_method`, `is_active`, `remark`, `created_at`, `updated_at`) VALUES
(1, 'CCC01', 'ลูกค้าทดสอบ', NULL, 'สำนักงานใหญ่', NULL, '67/30 M1Bangkrang', '67/30 M1Bangkrang', NULL, '1231234567890', 'โย', '0918721062', 'Jassada01@gmail.com', '30', '', '', '', '', 'AAA', 'TH', NULL, 1, 'AAAAAA', '2024-05-19 20:53:35', '2024-05-26 12:24:33'),
(2, 'TST002', 'ทดสอบลูกค้า 2', NULL, 'สำนักงานใหญ่', NULL, '', '', NULL, '', '', '', '', '', '', '', '', '', '', 'TH', NULL, 1, '', '2024-05-20 20:31:41', '2024-05-20 20:31:41'),
(3, 'CCC001', 'เจษฎาภรณ์', 'Jassadaporn', 'สำนักงานใหญ่', 'HQ', '1111', '1111', 'one one one one ', '123454421212', '2121', '1212', '', '30', '', '', '', '', '', 'TH', 'CASH', 1, '', '2024-05-28 20:49:17', '2024-05-28 20:49:17');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(11) NOT NULL,
  `driver_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `province` varchar(150) NOT NULL,
  `truck_company_id` int(11) NOT NULL,
  `truck_company_name` varchar(255) NOT NULL,
  `driver_image_path` varchar(255) DEFAULT NULL,
  `truck_image_path` varchar(255) DEFAULT NULL,
  `attr1` varchar(255) DEFAULT NULL,
  `attr2` varchar(255) DEFAULT NULL,
  `attr3` varchar(255) DEFAULT NULL,
  `attr4` varchar(255) DEFAULT NULL,
  `attr5` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `driver_name`, `phone_number`, `license_plate`, `province`, `truck_company_id`, `truck_company_name`, `driver_image_path`, `truck_image_path`, `attr1`, `attr2`, `attr3`, `attr4`, `attr5`, `is_active`) VALUES
(1, 'โย', '0918721062', 'ขน-1104', 'กรุงเทพมหานคร', 1, 'ABC Truck Company', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/driver_2nk.png', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/truck_z0e.png', NULL, NULL, NULL, NULL, NULL, 1),
(2, 'เดียว', '09178884444', '1140', 'ปทุมธานี', 1, 'ABC Truck Company', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/driver_2nk.png', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/truck_z0e.png', NULL, NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `provinces`
--

CREATE TABLE `provinces` (
  `id` int(11) NOT NULL,
  `code` int(11) NOT NULL,
  `name_in_thai` varchar(150) NOT NULL,
  `name_in_english` varchar(150) NOT NULL,
  `run_order` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `provinces`
--

INSERT INTO `provinces` (`id`, `code`, `name_in_thai`, `name_in_english`, `run_order`) VALUES
(1, 10, 'กรุงเทพมหานคร', 'Bangkok', 1),
(2, 11, 'สมุทรปราการ', 'Samut Prakarn', 60),
(3, 12, 'นนทบุรี', 'Nonthaburi', 24),
(4, 13, 'ปทุมธานี', 'Pathum Thani', 29),
(5, 14, 'พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya', 33),
(6, 15, 'อ่างทอง', 'Ang Thong', 72),
(7, 16, 'ลพบุรี', 'Lop Buri', 52),
(8, 17, 'สิงห์บุรี', 'Sing Buri', 65),
(9, 18, 'ชัยนาท', 'Chai Nat', 10),
(10, 19, 'สระบุรี', 'Saraburi', 64),
(11, 20, 'ชลบุรี', 'Chon Buri', 9),
(12, 21, 'ระยอง', 'Rayong', 50),
(13, 22, 'จันทบุรี', 'Chanthaburi', 7),
(14, 23, 'ตราด', 'Trat', 16),
(15, 24, 'ฉะเชิงเทรา', 'Chachoengsao', 8),
(16, 25, 'ปราจีนบุรี', 'Prachin Buri', 31),
(17, 26, 'นครนายก', 'Nakhon Nayok', 18),
(18, 27, 'สระแก้ว', 'Sa kaeo', 63),
(19, 30, 'นครราชสีมา', 'Nakhon Ratchasima', 21),
(20, 31, 'บุรีรัมย์', 'Buri Ram', 28),
(21, 32, 'สุรินทร์', 'Surin', 69),
(22, 33, 'ศรีสะเกษ', 'Si Sa Ket', 56),
(23, 34, 'อุบลราชธานี', 'Ubon Ratchathani', 76),
(24, 35, 'ยโสธร', 'Yasothon', 47),
(25, 36, 'ชัยภูมิ', 'Chaiyaphum', 11),
(26, 37, 'อำนาจเจริญ', 'Amnat Charoen', 77),
(27, 38, 'บึงกาฬ', 'Bueng Kan', 27),
(28, 39, 'หนองบัวลำภู', 'Nong Bua Lam Phu', 71),
(29, 40, 'ขอนแก่น', 'Khon Kaen', 6),
(30, 41, 'อุดรธานี', 'Udon Thani', 73),
(31, 42, 'เลย', 'Loei', 55),
(32, 43, 'หนองคาย', 'Nong Khai', 70),
(33, 44, 'มหาสารคาม', 'Maha Sarakham', 43),
(34, 45, 'ร้อยเอ็ด', 'Roi Et', 48),
(35, 46, 'กาฬสินธุ์', 'Kalasin', 4),
(36, 47, 'สกลนคร', 'Sakon Nakhon', 57),
(37, 48, 'นครพนม', 'Nakhon Phanom', 20),
(38, 49, 'มุกดาหาร', 'Mukdahan', 44),
(39, 50, 'เชียงใหม่', 'Chiang Mai', 14),
(40, 51, 'ลำพูน', 'Lamphun', 54),
(41, 52, 'ลำปาง', 'Lampang', 53),
(42, 53, 'อุตรดิตถ์', 'Uttaradit', 75),
(43, 54, 'แพร่', 'Phrae', 40),
(44, 55, 'น่าน', 'Nan', 26),
(45, 56, 'พะเยา', 'Phayao', 41),
(46, 57, 'เชียงราย', 'Chiang Rai', 13),
(47, 58, 'แม่ฮ่องสอน', 'Mae Hong Son', 45),
(48, 60, 'นครสวรรค์', 'Nakhon Sawan', 23),
(49, 61, 'อุทัยธานี', 'Uthai Thani', 74),
(50, 62, 'กำแพงเพชร', 'Kamphaeng Phet', 5),
(51, 63, 'ตาก', 'Tak', 17),
(52, 64, 'สุโขทัย', 'Sukhothai', 66),
(53, 65, 'พิษณุโลก', 'Phitsanulok', 37),
(54, 66, 'พิจิตร', 'Phichit', 36),
(55, 67, 'เพชรบูรณ์', 'Phetchabun', 39),
(56, 70, 'ราชบุรี', 'Ratchaburi', 51),
(57, 71, 'กาญจนบุรี', 'Kanchanaburi', 3),
(58, 72, 'สุพรรณบุรี', 'Suphan Buri', 67),
(59, 73, 'นครปฐม', 'Nakhon Pathom', 19),
(60, 74, 'สมุทรสาคร', 'Samut Sakhon', 62),
(61, 75, 'สมุทรสงคราม', 'Samut Songkhram', 61),
(62, 76, 'เพชรบุรี', 'Phetchaburi', 38),
(63, 77, 'ประจวบคีรีขันธ์', 'Prachuap Khiri Khan', 30),
(64, 80, 'นครศรีธรรมราช', 'Nakhon Si Thammarat', 22),
(65, 81, 'กระบี่', 'Krabi', 2),
(66, 82, 'พังงา', 'Phang-nga', 34),
(67, 83, 'ภูเก็ต', 'Phuket', 42),
(68, 84, 'สุราษฎร์ธานี', 'Surat Thani', 68),
(69, 85, 'ระนอง', 'Ranong', 49),
(70, 86, 'ชุมพร', 'Chumphon', 12),
(71, 90, 'สงขลา', 'Songkhla', 58),
(72, 91, 'สตูล', 'Satun', 59),
(73, 92, 'ตรัง', 'Trang', 15),
(74, 93, 'พัทลุง', 'Phatthalung', 35),
(75, 94, 'ปัตตานี', 'Pattani', 32),
(76, 95, 'ยะลา', 'Yala', 46),
(77, 96, 'นราธิวาส', 'Narathiwat', 25);

-- --------------------------------------------------------

--
-- Table structure for table `truck_companies`
--

CREATE TABLE `truck_companies` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `short_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `line_id` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `truck_companies`
--

INSERT INTO `truck_companies` (`id`, `company_name`, `short_name`, `address`, `tax_id`, `contact_person`, `phone_number`, `line_id`, `active`) VALUES
(1, 'ABC Truck Company', 'ABC', '67/30 M1Bangkrang ', '1234567890123', 'โย', '0918721062', '', 1),
(2, 'DEF Company', 'DEF', 'asasqw', '', '', '', '', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `password_expire` date DEFAULT NULL,
  `location_image_url` text DEFAULT NULL,
  `language` varchar(2) NOT NULL DEFAULT 'TH',
  `attr1` varchar(255) DEFAULT NULL,
  `attr2` varchar(255) DEFAULT NULL,
  `attr3` varchar(255) DEFAULT NULL,
  `attr4` varchar(255) DEFAULT NULL,
  `attr5` varchar(255) DEFAULT NULL,
  `active` int(11) NOT NULL DEFAULT 1,
  `create_user` varchar(255) DEFAULT NULL,
  `create_datetime` datetime DEFAULT NULL,
  `update_user` varchar(255) DEFAULT NULL,
  `update_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `display_name`, `password`, `position`, `password_expire`, `location_image_url`, `language`, `attr1`, `attr2`, `attr3`, `attr4`, `attr5`, `active`, `create_user`, `create_datetime`, `update_user`, `update_datetime`) VALUES
(1, 'john_doe', 'John', '$2a$08$F4jiYvfyUjdh73MpN2PrseERccph7H0.ODiRHoxaGrJKR.cfAR.XC', 'ผู้ดูแลระบบ', NULL, 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/default_avatar_usq.png', 'TH', NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL),
(3, 'admin', 'ผู้ดูแลระบบ', '$2a$08$/3wETu9/buPlJRXmu8LrzeWV2ITa7Sxco7FijbDTB2vwGxBzWy0g.', 'ผู้ดูแลระบบ', NULL, 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/logo_h55.png', 'TH', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `yards`
--

CREATE TABLE `yards` (
  `id` int(11) NOT NULL,
  `short_name` varchar(255) NOT NULL,
  `yard_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `google_map_link` text DEFAULT NULL,
  `remark` text DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `yards`
--

INSERT INTO `yards` (`id`, `short_name`, `yard_name`, `contact_person`, `phone_number`, `website`, `latitude`, `longitude`, `google_map_link`, `remark`, `active`) VALUES
(1, 'AAA', 'asasssgggggggg', 'das', 'das', 'dfasas', 13.840815403996672, 100.47127881339374, 'https://www.google.com/maps?q=13.840815403996672,100.47127881339374', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `zones`
--

CREATE TABLE `zones` (
  `id` int(11) NOT NULL,
  `yard_name` varchar(255) NOT NULL,
  `zone` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `path_map` varchar(255) DEFAULT NULL,
  `google_map_link` varchar(255) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `max_capacity` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `zones`
--

INSERT INTO `zones` (`id`, `yard_name`, `zone`, `details`, `contact`, `path_map`, `google_map_link`, `latitude`, `longitude`, `max_capacity`, `active`) VALUES
(1, 'Giraffe Container', 'A', 'สำหรับ ตู้ Drop', '', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/Untitled_a90.png', 'https://www.google.com/maps?q=13.31193178371333,100.9529754835968', 13.31193178371333, 100.9529754835968, 100, 1),
(2, 'Giraffe Container', 'B', '', '', 'https://storage.googleapis.com/giraffepark-bdb1d.appspot.com/1_9uh.jpg', 'https://www.google.com/maps?q=13.31223369062731,100.95222472427734', 13.31223369062731, 100.95222472427734, 99, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`agent_id`),
  ADD UNIQUE KEY `agent_code` (`agent_code`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`client_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `truck_company_id` (`truck_company_id`);

--
-- Indexes for table `provinces`
--
ALTER TABLE `provinces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_provinces_code` (`code`) USING BTREE;

--
-- Indexes for table `truck_companies`
--
ALTER TABLE `truck_companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tax_id` (`tax_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `yards`
--
ALTER TABLE `yards`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `zones`
--
ALTER TABLE `zones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `agent_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `provinces`
--
ALTER TABLE `provinces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT for table `truck_companies`
--
ALTER TABLE `truck_companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `yards`
--
ALTER TABLE `yards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `zones`
--
ALTER TABLE `zones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`truck_company_id`) REFERENCES `truck_companies` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
