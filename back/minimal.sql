-- MySQL dump 10.16  Distrib 10.1.48-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: dropapp_staging
-- ------------------------------------------------------
-- Server version	8.0.18-google

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `borrow_categories`
--

DROP TABLE IF EXISTS `borrow_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_categories`
--

LOCK TABLES `borrow_categories` WRITE;
/*!40000 ALTER TABLE `borrow_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrow_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrow_items`
--

DROP TABLE IF EXISTS `borrow_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `category_id` int(11) unsigned DEFAULT NULL,
  `visible` tinyint(4) NOT NULL DEFAULT '0',
  `comment` text NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `location_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `borrow_items_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `borrow_categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `borrow_items_ibfk_4` FOREIGN KEY (`location_id`) REFERENCES `borrow_locations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `borrow_items_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `borrow_items_ibfk_6` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_items`
--

LOCK TABLES `borrow_items` WRITE;
/*!40000 ALTER TABLE `borrow_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrow_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrow_locations`
--

DROP TABLE IF EXISTS `borrow_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow_locations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `camp_id` int(11) unsigned NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `borrow_locations_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_locations`
--

LOCK TABLES `borrow_locations` WRITE;
/*!40000 ALTER TABLE `borrow_locations` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrow_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrow_transactions`
--

DROP TABLE IF EXISTS `borrow_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `borrow_transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_date` datetime DEFAULT NULL,
  `bicycle_id` int(11) unsigned NOT NULL,
  `people_id` int(11) unsigned DEFAULT NULL,
  `status` varchar(5) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `lights` tinyint(4) NOT NULL DEFAULT '0',
  `helmet` tinyint(4) NOT NULL DEFAULT '0',
  `location_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `location_id` (`location_id`),
  KEY `bicycle_id` (`bicycle_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `people_id` (`people_id`),
  CONSTRAINT `borrow_transactions_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `borrow_locations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `borrow_transactions_ibfk_4` FOREIGN KEY (`bicycle_id`) REFERENCES `borrow_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `borrow_transactions_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `borrow_transactions_ibfk_7` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `borrow_transactions_ibfk_8` FOREIGN KEY (`people_id`) REFERENCES `people` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_transactions`
--

LOCK TABLES `borrow_transactions` WRITE;
/*!40000 ALTER TABLE `borrow_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `borrow_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `box_state`
--

DROP TABLE IF EXISTS `box_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `box_state` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `box_state`
--

LOCK TABLES `box_state` WRITE;
/*!40000 ALTER TABLE `box_state` DISABLE KEYS */;
INSERT INTO `box_state` VALUES
  (5,'Donated'),
  (1,'Instock'),
  (2,'Lost'),
  (3,'MarkedForShipment'),
  (4,'Receiving'),
  (6,'Scrap'),
  (7,'InTransit'),
  (8,'NotDelivered');
/*!40000 ALTER TABLE `box_state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `camps`
--

DROP TABLE IF EXISTS `camps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camps` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `idcard` tinyint(4) NOT NULL DEFAULT '0',
  `laundry` tinyint(4) NOT NULL DEFAULT '0',
  `laundry_cyclestart` date DEFAULT '2019-01-01',
  `market` tinyint(4) NOT NULL DEFAULT '1',
  `maxfooddrops_adult` int(11) DEFAULT '25',
  `maxfooddrops_child` int(11) DEFAULT '25',
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `organisation_id` int(11) unsigned NOT NULL,
  `schedulebreak` varchar(255) NOT NULL DEFAULT '1',
  `schedulebreakduration` varchar(255) NOT NULL DEFAULT '1',
  `schedulebreakstart` varchar(255) NOT NULL DEFAULT '13:00',
  `schedulestart` varchar(255) NOT NULL DEFAULT '11:00',
  `schedulestop` varchar(255) NOT NULL DEFAULT '17:00',
  `scheduletimeslot` varchar(255) NOT NULL DEFAULT '0.5',
  `seq` int(11) NOT NULL,
  `workshop` tinyint(4) NOT NULL DEFAULT '0',
  `adult_age` int(11) NOT NULL DEFAULT '15',
  `bicycle` tinyint(4) NOT NULL DEFAULT '0',
  `bicycle_closingtime` varchar(255) DEFAULT '17:30',
  `bicycle_closingtime_saturday` varchar(255) DEFAULT '16:30',
  `bicyclerenttime` int(11) NOT NULL DEFAULT '120',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `currencyname` varchar(255) NOT NULL DEFAULT 'Tokens',
  `cyclestart` datetime DEFAULT '2019-01-01 00:00:00',
  `daystokeepdeletedpersons` int(11) DEFAULT '9999',
  `delete_inactive_users` int(11) NOT NULL DEFAULT '30',
  `deleted` datetime DEFAULT NULL,
  `dropcapadult` int(11) NOT NULL DEFAULT '99999',
  `dropcapchild` int(11) NOT NULL DEFAULT '99999',
  `dropsperadult` varchar(255) NOT NULL DEFAULT '100',
  `dropsperchild` varchar(255) NOT NULL DEFAULT '100',
  `extraportion` tinyint(4) DEFAULT '0',
  `familyidentifier` varchar(255) NOT NULL DEFAULT 'Container',
  `food` tinyint(4) NOT NULL DEFAULT '0',
  `resettokens` tinyint(1) DEFAULT '0',
  `beneficiaryisregistered` tinyint(1) NOT NULL DEFAULT '1',
  `beneficiaryisvolunteer` tinyint(1) NOT NULL DEFAULT '1',
  `separateshopandwhproducts` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `organisation_id` (`organisation_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `camps_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `camps_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `camps_ibfk_3` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000002 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `camps`
--

LOCK TABLES `camps` WRITE;
/*!40000 ALTER TABLE `camps` DISABLE KEYS */;
INSERT INTO `camps` VALUES
  (1,0,0,'2019-01-01',1,25,25,NULL,NULL,'Lesvos',1,'0','1','2019-08-27 13:00:00','2019-08-27 11:00:00','2019-08-27 17:00:00','0.5',1,0,15,0,'17:30','16:30',120,NULL,NULL,'Tokens','2019-01-01 00:00:00',9999,9999,NULL,99999,99999,'100','100',0,'Refugee / Case ID',0,0,1,1,0),
  (2,0,0,'2019-01-01',0,25,25,NULL,NULL,'Thessaloniki',2,'0','1','13:00','9:00','15:00','0.25',2,0,15,0,'17:30','16:30',120,NULL,NULL,'points','2019-11-05 09:13:11',9999,9999,NULL,99999,99999,'100','50',0,'Family ID',0,1,1,1,0),
  (3,0,0,'2019-01-01',1,25,25,NULL,NULL,'Samos',2,'0','1.5','2019-10-14 13:30:00','2019-10-14 10:30:00','2019-10-14 17:00:00','0.5',4,0,0,0,'17:30','16:30',120,NULL,NULL,'Tokens','2019-01-06 22:18:10',60,9999,NULL,500,300,'150','130',1,'Household',0,0,1,1,0),
  (4,0,0,'2019-01-01',0,25,25,NULL,NULL,'Athens',2,'0','1','13:00','9:00','15:00','0.25',5,0,15,0,'17:30','16:30',120,NULL,NULL,'points','2019-11-05 09:13:11',9999,9999,NULL,99999,99999,'100','50',0,'Family ID',0,1,1,1,0),
  (100000000,1,0,'2019-01-01',1,25,25,'2019-09-05 13:48:34',1,'TestBase',100000000,'1','1','2019-09-05 13:00:00','2019-09-05 11:00:00','2019-09-05 17:00:00','0.5',3,0,15,0,'2019-09-05 17:30:00','2019-09-05 16:30:00',120,'2019-07-10 08:06:22',1,'Tokens','2019-01-01 00:00:00',9999,99999,NULL,99999,99999,'100','100',0,'Refugee ID',0,0,1,1,0),
  (100000001,1,0,'2019-01-01',1,25,25,'2019-09-05 13:48:34',1,'DummyTestBaseWithBoxes',100000001,'1','1','2019-09-05 13:00:00','2019-09-05 11:00:00','2019-09-05 17:00:00','0.5',3,0,15,0,'2019-09-05 17:30:00','2019-09-05 16:30:00',120,'2019-07-10 08:06:22',1,'Tokens','2019-01-01 00:00:00',9999,30,NULL,99999,99999,'100','100',0,'Refugee ID',0,0,1,1,0);
/*!40000 ALTER TABLE `camps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_functions`
--

DROP TABLE IF EXISTS `cms_functions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_functions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `title_en` varchar(255) NOT NULL DEFAULT '',
  `include` varchar(255) NOT NULL DEFAULT '',
  `seq` int(11) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `alert` int(11) NOT NULL DEFAULT '0',
  `adminonly` tinyint(4) NOT NULL DEFAULT '0',
  `visible` tinyint(4) NOT NULL,
  `allusers` tinyint(4) NOT NULL DEFAULT '0',
  `allcamps` tinyint(4) NOT NULL DEFAULT '0',
  `action_permissions` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `cms_functions_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `cms_functions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_functions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_functions_ibfk_5` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=163 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_functions`
--

LOCK TABLES `cms_functions` WRITE;
/*!40000 ALTER TABLE `cms_functions` DISABLE KEYS */;
INSERT INTO `cms_functions` VALUES (35,NULL,'Free Shop','',3,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (42,NULL,'Admin','',8,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (43,42,'Manage Users','cms_users',20,NULL,NULL,NULL,NULL,0,0,1,0,1,'manage_volunteers,manage_coordinators,manage_admins'),
  (44,155,'Settings','cms_settings',25,NULL,NULL,NULL,NULL,0,1,1,0,1,'be_god'),
  (45,155,'Texts','cms_translate',26,NULL,NULL,NULL,NULL,0,1,1,0,1,'be_god'),
  (50,155,'Manage Menu Functions','cms_functions',24,NULL,NULL,NULL,NULL,0,1,1,0,1,'be_god'),
  (67,42,'Manage Products','products',18,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_products'),
  (87,35,'Checkout','check_out',7,NULL,NULL,NULL,NULL,0,0,1,0,0,'checkout_beneficiaries'),
  (90,99,'Classic Manage Boxes','stock',3,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (92,35,'Give Tokens <span>To</span> All','give2all',10,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_tokens'),
  (96,128,'Sales Reports','sales_list',16,NULL,NULL,NULL,NULL,0,0,1,0,0,'list_sales'),
  (99,NULL,'Inventory','',1,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (102,128,'Fancy Graphs (<span>beta</span>)','fancygraphs',17,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_beneficiary_graph'),
  (110,35,'Stockroom','container-stock',8,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_stockroom'),
  (111,35,'Generate Market Schedule','market_schedule',9,NULL,NULL,NULL,NULL,0,0,0,0,0,'generate_market_schedule'),
  (112,99,'Print Box Labels','qr',1,NULL,NULL,NULL,NULL,0,0,1,0,0,'create_label'),
  (113,NULL,'Actions','',7,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (115,42,'Edit Warehouses','locations',19,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_warehouses'),
  (116,110,'Containers List','printed_list_containers',2,NULL,NULL,NULL,NULL,0,0,1,1,0,'view_stockroom'),
  (118,161,'Manage Beneficiaries','people',5,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_beneficiaries'),
  (121,NULL,'Hidden Menu Items','',10,NULL,NULL,NULL,NULL,0,0,0,1,0,NULL),
  (123,121,'Start Page','start',27,NULL,NULL,NULL,NULL,0,0,0,1,0,'view_start_page'),
  (124,92,'Give Tokens <span>to</span> selected families','give',3,NULL,NULL,NULL,NULL,0,0,1,1,0,'be_god'),
  (125,121,'User Profile','cms_profile',28,NULL,NULL,NULL,NULL,0,0,0,1,0,'be_user'),
  (126,121,'Exit Login As','exitloginas',29,NULL,NULL,NULL,NULL,0,0,0,1,0,NULL),
  (127,96,'Sales List Download','sales_list_download',9,NULL,NULL,NULL,NULL,0,0,1,1,0,'list_sales'),
  (128,NULL,'Insight','',6,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (130,35,'Lists','food_lists',11,NULL,NULL,NULL,NULL,0,0,0,0,0,NULL),
  (131,NULL,'Services','',4,NULL,NULL,NULL,NULL,0,0,0,0,0,NULL),
  (132,131,'Bicycles / Sport','borrow',13,NULL,NULL,NULL,NULL,0,0,0,0,0,NULL),
  (140,132,'Borrow Edit','borrowedititem',6,NULL,NULL,NULL,NULL,0,0,1,1,0,NULL),
  (144,132,'Borrow History ','borrowhistory',7,NULL,NULL,NULL,NULL,0,0,1,1,0,NULL),
  (145,148,'Library Titles (<span>beta</span>)','library_inventory',14,NULL,NULL,NULL,NULL,0,0,0,0,0,'manage_books'),
  (146,148,'Lent Out (<span>beta</span>)','library',15,NULL,NULL,NULL,NULL,0,0,0,0,0,'lend_books'),
  (147,146,'Library History','libraryhistory',8,NULL,NULL,NULL,NULL,0,0,0,1,0,'lend_books'),
  (148,NULL,'Library','',5,NULL,NULL,NULL,NULL,0,0,0,0,0,NULL),
  (149,131,'Laundry','laundry',12,NULL,NULL,NULL,NULL,0,0,0,0,0,NULL),
  (150,118,'All Residents Export','people_export',1,NULL,NULL,NULL,NULL,0,0,1,1,0,'manage_beneficiaries'),
  (151,149,'Laundry No Show','laundry_noshow',4,NULL,NULL,NULL,NULL,0,0,1,1,0,NULL),
  (152,149,'Laundry Start New Cycle','laundry_startcycle',5,NULL,NULL,NULL,NULL,0,0,1,1,0,NULL),
  (154,155,'Organisations','organisations',23,NULL,NULL,NULL,NULL,0,1,1,0,1,'manage_organizations,be_god'),
  (155,NULL,'Boxtribute Gods','',9,NULL,NULL,NULL,NULL,0,1,1,0,0,NULL),
  (156,42,'User Groups','cms_usergroups',21,NULL,NULL,NULL,NULL,0,0,1,0,1,'be_god'),
  (157,155,'Bases','camps',22,NULL,NULL,NULL,NULL,0,1,1,0,1,'manage_base,be_god'),
  (158,161,'Add Beneficiary','people_add',4,NULL,NULL,NULL,NULL,0,0,1,0,0,'create_beneficiaries'),
  (160,99,'Stock Overview','stock_overview',4,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_inventory'),
  (161,NULL,'Beneficiaries','',2,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (162,42,'Manage Tags','tags',6,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_tags'),
  (163,NULL,'Transfers','',4,NULL,NULL,NULL,NULL,0,0,1,0,0,NULL),
  (164,163,'Manage Shipments','shipments',0,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_shipments'),
  (165,163,'Manage Agreements','transfer_agreements',1,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_transfer_agreements'),
  (166,99,'Manage Boxes v2 (<span>beta</span>)','new_manage_boxes',2,NULL,NULL,NULL,NULL,0,0,1,0,0,'manage_inventory'),
  (167,128,'Dashboard v2 (<span>beta</span>)','statviz_dashboard',18,NULL,NULL,NULL,NULL,0,0,1,0,0,'view_beneficiary_graph');
/*!40000 ALTER TABLE `cms_functions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_functions_camps`
--

DROP TABLE IF EXISTS `cms_functions_camps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_functions_camps` (
  `cms_functions_id` int(11) unsigned NOT NULL,
  `camps_id` int(11) unsigned NOT NULL,
  UNIQUE KEY `functions_camps_unique` (`cms_functions_id`,`camps_id`),
  KEY `cms_functions_id` (`cms_functions_id`),
  KEY `camps_id` (`camps_id`),
  CONSTRAINT `cms_functions_camps_ibfk_2` FOREIGN KEY (`camps_id`) REFERENCES `camps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cms_functions_camps_ibfk_3` FOREIGN KEY (`cms_functions_id`) REFERENCES `cms_functions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_functions_camps`
--

LOCK TABLES `cms_functions_camps` WRITE;
/*!40000 ALTER TABLE `cms_functions_camps` DISABLE KEYS */;
INSERT INTO `cms_functions_camps` VALUES (43,1),
  (43,2),
  (43,3),
  (43,4),
  (43,100000000),
  (43,100000001),
  (67,1),
  (67,2),
  (67,3),
  (67,4),
  (67,100000000),
  (67,100000001),
  (87,1),
  (87,2),
  (87,3),
  (87,4),
  (87,100000000),
  (87,100000001),
  (90,1),
  (90,2),
  (90,3),
  (90,4),
  (90,100000000),
  (90,100000001),
  (92,1),
  (92,2),
  (92,3),
  (92,4),
  (92,100000000),
  (92,100000001),
  (96,1),
  (96,2),
  (96,3),
  (96,4),
  (96,100000000),
  (96,100000001),
  (102,1),
  (102,2),
  (102,3),
  (102,4),
  (102,100000000),
  (102,100000001),
  (110,1),
  (110,2),
  (110,3),
  (110,4),
  (110,100000000),
  (110,100000001),
  (111,1),
  (111,3),
  (111,100000000),
  (112,1),
  (112,2),
  (112,3),
  (112,4),
  (112,100000000),
  (112,100000001),
  (115,1),
  (115,2),
  (115,3),
  (115,4),
  (115,100000000),
  (115,100000001),
  (118,1),
  (118,2),
  (118,3),
  (118,4),
  (118,100000000),
  (118,100000001),
  (123,1),
  (123,2),
  (123,3),
  (123,4),
  (123,100000000),
  (123,100000001),
  (125,1),
  (125,2),
  (125,3),
  (125,4),
  (125,100000000),
  (125,100000001),
  (130,1),
  (130,3),
  (145,1),
  (146,1),
  (158,1),
  (158,2),
  (158,3),
  (158,4),
  (158,100000000),
  (158,100000001),
  (160,1),
  (160,2),
  (160,3),
  (160,4),
  (160,100000000),
  (160,100000001),
  (162,1),
  (162,2),
  (162,3),
  (162,4),
  (162,100000000),
  (162,100000001),
  (164,1),
  (164,2),
  (164,3),
  (164,4),
  (165,1),
  (165,2),
  (165,3),
  (165,4),
  (166,1),
  (166,2),
  (166,3),
  (166,4),
  (167,1),
  (167,2),
  (167,3),
  (167,4);
/*!40000 ALTER TABLE `cms_functions_camps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_settings`
--

DROP TABLE IF EXISTS `cms_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `type` varchar(20) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `options` varchar(255) DEFAULT NULL,
  `value` text,
  `hidden` tinyint(4) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `cms_settings_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_settings_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_settings`
--

LOCK TABLES `cms_settings` WRITE;
/*!40000 ALTER TABLE `cms_settings` DISABLE KEYS */;
INSERT INTO `cms_settings` VALUES (83,1,'select','cms_language','Language used for CMS interface','en=English','en',1,NULL,NULL,NULL,NULL),(86,1,'text','mail_sender','Sender address for e-mails sent by Boxtribute','','hello@boxtribute.org',1,NULL,NULL,NULL,NULL),(87,1,'text','mail_sender_name','Sender name for e-mails sent by Boxtribute','','Boxtribute',1,NULL,NULL,NULL,NULL),(92,1,'text','apple-mobile-web-app-title','Title for Apple Mobile Web App','','Boxtribute',1,NULL,NULL,NULL,NULL),(137,1,'text','dailyroutine','Last date the daily routine did run','','2019-06-26',1,NULL,NULL,NULL,NULL),(138,1,'text','installed','Date and time of installation and first run','','2016-23-11 9:00:00',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cms_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_usergroups`
--

DROP TABLE IF EXISTS `cms_usergroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_usergroups` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `organisation_id` int(11) unsigned NOT NULL,
  `userlevel` int(11) unsigned NOT NULL,
  `allow_laundry_startcycle` tinyint(4) NOT NULL DEFAULT '0',
  `allow_laundry_block` tinyint(4) NOT NULL DEFAULT '0',
  `allow_borrow_adddelete` tinyint(4) NOT NULL,
  `deleted` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organisation_id` (`organisation_id`),
  KEY `userlevel` (`userlevel`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `cms_usergroups_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_ibfk_2` FOREIGN KEY (`userlevel`) REFERENCES `cms_usergroups_levels` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_ibfk_4` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100004258 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_usergroups`
--

LOCK TABLES `cms_usergroups` WRITE;
/*!40000 ALTER TABLE `cms_usergroups` DISABLE KEYS */;
INSERT INTO `cms_usergroups` VALUES (1,'Head of Operations',NULL,NULL,NULL,NULL,1,1,0,0,0,NULL),
  (2,'Base Lesvos - Coordinator',NULL,NULL,NULL,NULL,1,2,0,0,0,NULL),
  (3,'Base Lesvos - Volunteer (Warehouse)',NULL,NULL,NULL,NULL,1,3,0,0,0,NULL),
  (4,'Base Lesvos - Volunteer (Free Shop)',NULL,NULL,NULL,NULL,1,3,0,0,0,NULL),
  (5,'Base Lesvos - Volunteer (Library)',NULL,NULL,NULL,NULL,1,3,0,0,0,NULL),
  (6,'Base Lesvos - Volunteer',NULL,NULL,NULL,NULL,1,3,0,0,0,NULL),
  (10,'Head of Operations',NULL,NULL,NULL,NULL,2,1,0,0,0,NULL),
  (11,'Base Thessaloniki - Coordinator',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (12,'Base Samos - Coordinator',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (13,'Base Thessaloniki - Volunteer',NULL,NULL,NULL,NULL,2,3,0,0,0,NULL),
  (14,'Base Samos - Volunteer',NULL,NULL,NULL,NULL,2,3,0,0,0,NULL),
  (15,'Coordinator',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (16,'Volunteer',NULL,NULL,NULL,NULL,2,3,0,0,0,NULL),
  (17,'Base Athens - Coordinator',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (18,'Base Athens - Volunteer',NULL,NULL,NULL,NULL,2,3,0,0,0,NULL),
  (19,'Base Athens - Volunteer (Warehouse)',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (20,'Base Athens - Volunteer (Free Shop)',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (21,'Base Athens - Label Creation',NULL,NULL,NULL,NULL,2,2,0,0,0,NULL),
  (99,'Boxtribute God',NULL,NULL,NULL,NULL,1,1,0,0,0,NULL),
  (100000000,'Base TestBase - Volunteer','2019-07-10 08:06:53',1,NULL,NULL,100000000,3,0,0,0,NULL),
  (100000001,'Base TestBase - Coordinator','2019-07-10 08:07:15',1,NULL,NULL,100000000,2,0,0,0,NULL),
  (100000002,'Head of Operations','2019-07-10 08:07:44',1,NULL,NULL,100000000,1,0,0,0,NULL),
  (100000003,'TestUserGroup_NoPermissions','2019-07-10 08:06:53',1,NULL,NULL,100000000,3,0,0,0,NULL),
  (100000196,'Base Lesvos - Label Creation','2023-02-09 14:54:50',1,NULL,NULL,1,3,0,0,0,NULL),
  (100000197,'Base Samos - Volunteer (Warehouse)','2023-02-09 14:55:28',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000198,'Base Samos - Volunteer (Free Shop)','2023-02-09 14:55:28',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000199,'Base Samos - Label Creation','2023-02-09 14:55:28',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000200,'Base Thessaloniki - Volunteer (Warehouse)','2023-02-09 14:55:48',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000201,'Base Thessaloniki - Volunteer (Free Shop)','2023-02-09 14:55:48',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000202,'Base Thessaloniki - Label Creation','2023-02-09 14:55:48',1,NULL,NULL,2,3,0,0,0,NULL),
  (100000203,'Base TestBase - Volunteer (Warehouse)','2023-02-09 14:56:07',1,NULL,NULL,100000000,3,0,0,0,NULL),
  (100000204,'Base TestBase - Volunteer (Free Shop)','2023-02-09 14:56:07',1,NULL,NULL,100000000,3,0,0,0,NULL),
  (100000205,'Base TestBase - Label Creation','2023-02-09 14:56:07',1,NULL,NULL,100000000,3,0,0,0,NULL),
  (100000206,'Head of Operations','2023-02-09 14:56:25',1,NULL,NULL,100000001,1,0,0,0,NULL),
  (100000207,'Base DummyTestBaseWithBoxes - Coordinator','2023-02-09 14:56:25',1,NULL,NULL,100000001,2,0,0,0,NULL),
  (100000208,'Base DummyTestBaseWithBoxes - Volunteer','2023-02-09 14:56:25',1,NULL,NULL,100000001,3,0,0,0,NULL),
  (100000209,'Base DummyTestBaseWithBoxes - Volunteer (Warehouse)','2023-02-09 14:56:25',1,NULL,NULL,100000001,3,0,0,0,NULL),
  (100000210,'Base DummyTestBaseWithBoxes - Volunteer (Free Shop)','2023-02-09 14:56:25',1,NULL,NULL,100000001,3,0,0,0,NULL),
  (100000211,'Base DummyTestBaseWithBoxes - Label Creation','2023-02-09 14:56:25',1,NULL,NULL,100000001,3,0,0,0,NULL),
  (100004258,'Base Lesvos - External Free Shop Checkout','2024-09-13 00:45:02',NULL,NULL,NULL,1,3,0,0,0,NULL),
  (100004259,'Base Athens - External Free Shop Checkout','2024-09-13 00:45:23',NULL,NULL,NULL,2,3,0,0,0,NULL),
  (100004260,'Base Samos - External Free Shop Checkout','2024-09-13 00:45:43',NULL,NULL,NULL,2,3,0,0,0,NULL),
  (100004261,'Base Thessaloniki - External Free Shop Checkout','2024-09-13 00:46:04',NULL,NULL,NULL,2,3,0,0,0,NULL),
  (100004262,'Base TestBase - External Free Shop Checkout','2024-09-13 00:46:31',NULL,NULL,NULL,100000000,3,0,0,0,NULL),
  (100004263,'Base DummyTestBaseWithBoxes - External Free Shop Checkout','2024-09-13 00:46:59',NULL,NULL,NULL,100000001,3,0,0,0,NULL);
/*!40000 ALTER TABLE `cms_usergroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_usergroups_camps`
--

DROP TABLE IF EXISTS `cms_usergroups_camps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_usergroups_camps` (
  `camp_id` int(11) unsigned NOT NULL,
  `cms_usergroups_id` int(11) unsigned NOT NULL,
  UNIQUE KEY `usergroups_camps_unique` (`camp_id`,`cms_usergroups_id`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `cms_usergroups_camps_ibfk_1` FOREIGN KEY (`cms_usergroups_id`) REFERENCES `cms_usergroups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_camps_ibfk_2` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_usergroups_camps`
--

LOCK TABLES `cms_usergroups_camps` WRITE;
/*!40000 ALTER TABLE `cms_usergroups_camps` DISABLE KEYS */;
INSERT INTO `cms_usergroups_camps` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(2,10),(3,10),(4,10),(2,11),(3,12),(2,13),(3,14),(2,15),(3,15),(2,16),(3,16),(4,17),(4,18),(4,19),(4,20),(4,21),(100000000,100000000),(100000000,100000001),(100000000,100000002),(100000000,100000003),(1,100000196),(3,100000197),(3,100000198),(3,100000199),(2,100000200),(2,100000201),(2,100000202),(100000000,100000203),(100000000,100000204),(100000000,100000205),(100000001,100000206),(100000001,100000207),(100000001,100000208),(100000001,100000209),(100000001,100000210),(100000001,100000211),(1,100004258),(4,100004259),(3,100004260),(2,100004261),(100000000,100004262),(100000001,100004263);
/*!40000 ALTER TABLE `cms_usergroups_camps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_usergroups_functions`
--

DROP TABLE IF EXISTS `cms_usergroups_functions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_usergroups_functions` (
  `cms_functions_id` int(11) unsigned NOT NULL,
  `cms_usergroups_id` int(11) unsigned NOT NULL,
  UNIQUE KEY `usergroups_functions_unique` (`cms_functions_id`,`cms_usergroups_id`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  KEY `cms_functions_id` (`cms_functions_id`),
  CONSTRAINT `cms_usergroups_functions_ibfk_1` FOREIGN KEY (`cms_usergroups_id`) REFERENCES `cms_usergroups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_functions_ibfk_2` FOREIGN KEY (`cms_functions_id`) REFERENCES `cms_functions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_usergroups_functions`
--

LOCK TABLES `cms_usergroups_functions` WRITE;
/*!40000 ALTER TABLE `cms_usergroups_functions` DISABLE KEYS */;
INSERT INTO `cms_usergroups_functions` VALUES (43,1),
  (67,1),
  (87,1),
  (90,1),
  (92,1),
  (96,1),
  (102,1),
  (110,1),
  (111,1),
  (112,1),
  (115,1),
  (118,1),
  (123,1),
  (125,1),
  (130,1),
  (145,1),
  (146,1),
  (156,1),
  (158,1),
  (160,1),
  (162,1),
  (164,1),
  (165,1),
  (166,1),
  (167,1),
  (43,2),
  (67,2),
  (87,2),
  (90,2),
  (92,2),
  (96,2),
  (102,2),
  (110,2),
  (111,2),
  (112,2),
  (115,2),
  (118,2),
  (123,2),
  (125,2),
  (130,2),
  (145,2),
  (146,2),
  (158,2),
  (160,2),
  (162,2),
  (164,2),
  (165,2),
  (166,2),
  (167,2),
  (90,3),
  (110,3),
  (112,3),
  (123,3),
  (125,3),
  (160,3),
  (164,3),
  (166,3),
  (167,3),
  (87,4),
  (96,4),
  (102,4),
  (110,4),
  (118,4),
  (123,4),
  (125,4),
  (130,4),
  (158,4),
  (102,5),
  (118,5),
  (145,5),
  (146,5),
  (87,6),
  (90,6),
  (96,6),
  (102,6),
  (110,6),
  (112,6),
  (118,6),
  (123,6),
  (125,6),
  (130,6),
  (145,6),
  (146,6),
  (158,6),
  (160,6),
  (164,6),
  (166,6),
  (167,6),
  (43,10),
  (67,10),
  (87,10),
  (90,10),
  (92,10),
  (96,10),
  (102,10),
  (110,10),
  (111,10),
  (112,10),
  (115,10),
  (118,10),
  (123,10),
  (125,10),
  (130,10),
  (156,10),
  (158,10),
  (160,10),
  (162,10),
  (164,10),
  (165,10),
  (166,10),
  (167,10),
  (43,11),
  (67,11),
  (87,11),
  (90,11),
  (92,11),
  (96,11),
  (102,11),
  (110,11),
  (112,11),
  (115,11),
  (118,11),
  (123,11),
  (125,11),
  (158,11),
  (160,11),
  (162,11),
  (164,11),
  (166,11),
  (167,11),
  (43,12),
  (67,12),
  (87,12),
  (90,12),
  (92,12),
  (96,12),
  (102,12),
  (110,12),
  (111,12),
  (112,12),
  (115,12),
  (118,12),
  (123,12),
  (125,12),
  (130,12),
  (158,12),
  (160,12),
  (162,12),
  (164,12),
  (165,12),
  (166,12),
  (167,12),
  (87,13),
  (90,13),
  (96,13),
  (102,13),
  (110,13),
  (112,13),
  (118,13),
  (123,13),
  (125,13),
  (158,13),
  (160,13),
  (164,13),
  (166,13),
  (167,13),
  (87,14),
  (90,14),
  (96,14),
  (102,14),
  (110,14),
  (112,14),
  (118,14),
  (123,14),
  (125,14),
  (130,14),
  (158,14),
  (160,14),
  (43,15),
  (67,15),
  (87,15),
  (90,15),
  (92,15),
  (96,15),
  (102,15),
  (110,15),
  (111,15),
  (112,15),
  (115,15),
  (118,15),
  (130,15),
  (158,15),
  (160,15),
  (162,15),
  (164,15),
  (165,15),
  (166,15),
  (167,15),
  (87,16),
  (90,16),
  (96,16),
  (102,16),
  (110,16),
  (112,16),
  (118,16),
  (130,16),
  (158,16),
  (160,16),
  (164,16),
  (166,16),
  (167,16),
  (43,17),
  (67,17),
  (87,17),
  (90,17),
  (92,17),
  (96,17),
  (102,17),
  (110,17),
  (112,17),
  (115,17),
  (118,17),
  (123,17),
  (125,17),
  (158,17),
  (160,17),
  (162,17),
  (164,17),
  (165,17),
  (166,17),
  (167,17),
  (87,18),
  (90,18),
  (96,18),
  (102,18),
  (110,18),
  (112,18),
  (118,18),
  (123,18),
  (125,18),
  (158,18),
  (160,18),
  (164,18),
  (166,18),
  (167,18),
  (90,19),
  (110,19),
  (112,19),
  (123,19),
  (125,19),
  (160,19),
  (164,19),
  (166,19),
  (167,19),
  (87,20),
  (96,20),
  (102,20),
  (110,20),
  (118,20),
  (123,20),
  (125,20),
  (158,20),
  (112,21),
  (125,21),
  (87,100000000),
  (90,100000000),
  (96,100000000),
  (102,100000000),
  (110,100000000),
  (112,100000000),
  (118,100000000),
  (123,100000000),
  (125,100000000),
  (158,100000000),
  (160,100000000),
  (43,100000001),
  (67,100000001),
  (87,100000001),
  (90,100000001),
  (92,100000001),
  (96,100000001),
  (102,100000001),
  (110,100000001),
  (111,100000001),
  (112,100000001),
  (115,100000001),
  (118,100000001),
  (123,100000001),
  (125,100000001),
  (156,100000001),
  (158,100000001),
  (160,100000001),
  (162,100000001),
  (43,100000002),
  (67,100000002),
  (87,100000002),
  (90,100000002),
  (92,100000002),
  (96,100000002),
  (102,100000002),
  (110,100000002),
  (111,100000002),
  (112,100000002),
  (115,100000002),
  (118,100000002),
  (123,100000002),
  (125,100000002),
  (156,100000002),
  (158,100000002),
  (160,100000002),
  (162,100000002),
  (112,100000196),
  (125,100000196),
  (90,100000197),
  (110,100000197),
  (112,100000197),
  (123,100000197),
  (125,100000197),
  (160,100000197),
  (87,100000198),
  (96,100000198),
  (102,100000198),
  (110,100000198),
  (118,100000198),
  (123,100000198),
  (125,100000198),
  (158,100000198),
  (112,100000199),
  (125,100000199),
  (90,100000200),
  (110,100000200),
  (112,100000200),
  (123,100000200),
  (125,100000200),
  (160,100000200),
  (87,100000201),
  (96,100000201),
  (102,100000201),
  (110,100000201),
  (118,100000201),
  (123,100000201),
  (125,100000201),
  (158,100000201),
  (112,100000202),
  (125,100000202),
  (90,100000203),
  (110,100000203),
  (112,100000203),
  (123,100000203),
  (125,100000203),
  (160,100000203),
  (87,100000204),
  (96,100000204),
  (102,100000204),
  (110,100000204),
  (118,100000204),
  (123,100000204),
  (125,100000204),
  (158,100000204),
  (112,100000205),
  (125,100000205),
  (43,100000206),
  (67,100000206),
  (87,100000206),
  (90,100000206),
  (92,100000206),
  (96,100000206),
  (102,100000206),
  (110,100000206),
  (112,100000206),
  (115,100000206),
  (118,100000206),
  (123,100000206),
  (125,100000206),
  (158,100000206),
  (160,100000206),
  (162,100000206),
  (43,100000207),
  (67,100000207),
  (87,100000207),
  (90,100000207),
  (92,100000207),
  (96,100000207),
  (102,100000207),
  (110,100000207),
  (112,100000207),
  (115,100000207),
  (118,100000207),
  (123,100000207),
  (125,100000207),
  (158,100000207),
  (160,100000207),
  (162,100000207),
  (87,100000208),
  (90,100000208),
  (96,100000208),
  (102,100000208),
  (110,100000208),
  (112,100000208),
  (118,100000208),
  (123,100000208),
  (125,100000208),
  (158,100000208),
  (160,100000208),
  (90,100000209),
  (110,100000209),
  (112,100000209),
  (123,100000209),
  (125,100000209),
  (160,100000209),
  (87,100000210),
  (96,100000210),
  (102,100000210),
  (110,100000210),
  (118,100000210),
  (123,100000210),
  (125,100000210),
  (158,100000210),
  (112,100000211),
  (125,100000211),
  (87,100004258),
  (125,100004258),
  (87,100004259),
  (125,100004259),
  (87,100004260),
  (125,100004260),
  (87,100004261),
  (125,100004261),
  (87,100004262),
  (125,100004262),
  (87,100004263),
  (125,100004263);
/*!40000 ALTER TABLE `cms_usergroups_functions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_usergroups_levels`
--

DROP TABLE IF EXISTS `cms_usergroups_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_usergroups_levels` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `level` int(11) DEFAULT NULL,
  `label` varchar(255) NOT NULL,
  `shortlabel` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_usergroups_levels`
--

LOCK TABLES `cms_usergroups_levels` WRITE;
/*!40000 ALTER TABLE `cms_usergroups_levels` DISABLE KEYS */;
INSERT INTO `cms_usergroups_levels` VALUES (1,100,'Admin user - in charge of an organisation','Admin'),(2,10,'Coordinator - in charge of a base','Coordinator'),(3,5,'User - regular volunteer/employee','User');
/*!40000 ALTER TABLE `cms_usergroups_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_usergroups_roles`
--

DROP TABLE IF EXISTS `cms_usergroups_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_usergroups_roles` (
  `cms_usergroups_id` int(11) unsigned NOT NULL,
  `auth0_role_id` varchar(255) NOT NULL,
  `auth0_role_name` varchar(255) NOT NULL,
  UNIQUE KEY `cms_usergroups_id_2` (`cms_usergroups_id`,`auth0_role_id`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  CONSTRAINT `cms_usergroups_roles_ibfk_1` FOREIGN KEY (`cms_usergroups_id`) REFERENCES `cms_usergroups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_usergroups_roles`
--

LOCK TABLES `cms_usergroups_roles` WRITE;
/*!40000 ALTER TABLE `cms_usergroups_roles` DISABLE KEYS */;
INSERT INTO `cms_usergroups_roles` VALUES (1,'rol_tP8t9gMxhO1Odtdw','administrator'),
  (2,'rol_ikoAfB3X8XsYE53Q','base_1_coordinator'),
  (3,'rol_6UTsIPfIXEKc1Crb','base_1_warehouse_volunteer'),
  (4,'rol_dsLXI5Y57Pn12sZK','base_1_free_shop_volunteer'),
  (5,'rol_KTuNwBRta6rPxuMG','base_1_library_volunteer'),
  (6,'rol_6UTsIPfIXEKc1Crb','base_1_warehouse_volunteer'),
  (6,'rol_dsLXI5Y57Pn12sZK','base_1_free_shop_volunteer'),
  (10,'rol_tP8t9gMxhO1Odtdw','administrator'),
  (11,'rol_Os7B4cF6iYL4uP21','base_2_coordinator'),
  (12,'rol_mp6kerNE9m3Y3Vv9','base_3_coordinator'),
  (13,'rol_eP67iKpEytUwVHe1','base_2_warehouse_volunteer'),
  (13,'rol_saz3LuVVzQW4pqDN','base_2_free_shop_volunteer'),
  (14,'rol_cxbdyyvarrBKQ5YY','base_3_free_shop_volunteer'),
  (14,'rol_GdH9cMxlemLAqa9q','base_3_warehouse_volunteer'),
  (15,'rol_mp6kerNE9m3Y3Vv9','base_3_coordinator'),
  (15,'rol_Os7B4cF6iYL4uP21','base_2_coordinator'),
  (16,'rol_cxbdyyvarrBKQ5YY','base_3_free_shop_volunteer'),
  (16,'rol_eP67iKpEytUwVHe1','base_2_warehouse_volunteer'),
  (16,'rol_GdH9cMxlemLAqa9q','base_3_warehouse_volunteer'),
  (16,'rol_saz3LuVVzQW4pqDN','base_2_free_shop_volunteer'),
  (17,'rol_3P3f4fcQScpVdoJV','base_4_coordinator'),
  (18,'rol_w72KK37egDY1uUNT','base_4_warehouse_volunteer'),
  (18,'rol_XTIQFQ3b26s3DjZV','base_4_free_shop_volunteer'),
  (19,'rol_w72KK37egDY1uUNT','base_4_warehouse_volunteer'),
  (20,'rol_XTIQFQ3b26s3DjZV','base_4_free_shop_volunteer'),
  (21,'rol_AHcJDFIYs00BHWEc','base_4_label_creation'),
  (99,'rol_3QTWeGl0OS53bjsE','boxtribute_god'),
  (100000000,'rol_fhYTMz4oiXK9ki2N','base_100000000_free_shop_volunteer'),
  (100000000,'rol_yQmOjE9C3KzvBABo','base_100000000_warehouse_volunteer'),
  (100000001,'rol_sutkrMkV7cyeOyOa','base_100000000_coordinator'),
  (100000002,'rol_tP8t9gMxhO1Odtdw','administrator'),
  (100000196,'rol_dHNaTI3f4asED721','base_1_label_creation'),
  (100000197,'rol_GdH9cMxlemLAqa9q','base_3_warehouse_volunteer'),
  (100000198,'rol_cxbdyyvarrBKQ5YY','base_3_free_shop_volunteer'),
  (100000199,'rol_Gr4AyKgB3HgkfWvV','base_3_label_creation'),
  (100000200,'rol_eP67iKpEytUwVHe1','base_2_warehouse_volunteer'),
  (100000201,'rol_saz3LuVVzQW4pqDN','base_2_free_shop_volunteer'),
  (100000202,'rol_0yLzH9v6gvBdT5uD','base_2_label_creation'),
  (100000203,'rol_yQmOjE9C3KzvBABo','base_100000000_warehouse_volunteer'),
  (100000204,'rol_fhYTMz4oiXK9ki2N','base_100000000_free_shop_volunteer'),
  (100000205,'rol_sa3ecDrvvbSS2L6s','base_100000000_label_creation'),
  (100000206,'rol_tP8t9gMxhO1Odtdw','administrator'),
  (100000207,'rol_frAcTDH8CeCb7P0I','base_100000001_coordinator'),
  (100000208,'rol_4bw3b4Y0BJLnXh2x','base_100000001_warehouse_volunteer'),
  (100000208,'rol_FQpwSEpzBol859GG','base_100000001_free_shop_volunteer'),
  (100000209,'rol_4bw3b4Y0BJLnXh2x','base_100000001_warehouse_volunteer'),
  (100000210,'rol_FQpwSEpzBol859GG','base_100000001_free_shop_volunteer'),
  (100000211,'rol_YRUA56fYsnv3FocH','base_100000001_label_creation'),
  (100004258,'rol_I22RHLj4kd11YHlW','base_1_external_free_shop_checkout'),
  (100004259,'rol_sQZBQHBCPnOrT45i','base_4_external_free_shop_checkout'),
  (100004260,'rol_kO9tO1Ohh32xj1lI','base_3_external_free_shop_checkout'),
  (100004261,'rol_DIdLw2yaUFw31j8n','base_2_external_free_shop_checkout'),
  (100004262,'rol_RGzSiCSwYXE5vi3s','base_100000000_external_free_shop_checkout'),
  (100004263,'rol_yWWIUeoxGS2SsmAy','base_100000001_external_free_shop_checkout');
/*!40000 ALTER TABLE `cms_usergroups_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_users`
--

DROP TABLE IF EXISTS `cms_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cms_users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `pass` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `naam` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `is_admin` tinyint(4) NOT NULL DEFAULT '0',
  `lastlogin` datetime NOT NULL,
  `lastaction` datetime NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `resetpassword` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin DEFAULT NULL,
  `language` int(11) unsigned DEFAULT NULL,
  `deleted` datetime NOT NULL,
  `cms_usergroups_id` int(11) unsigned DEFAULT NULL,
  `valid_firstday` date DEFAULT NULL,
  `valid_lastday` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  KEY `language` (`language`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `cms_users_ibfk_2` FOREIGN KEY (`cms_usergroups_id`) REFERENCES `cms_usergroups` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cms_users_ibfk_3` FOREIGN KEY (`language`) REFERENCES `languages` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cms_users_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_users_ibfk_5` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000364 DEFAULT CHARSET=utf8 COLLATE=utf8_bin ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_users`
--

LOCK TABLES `cms_users` WRITE;
/*!40000 ALTER TABLE `cms_users` DISABLE KEYS */;
INSERT INTO `cms_users` VALUES (1,'bf13b44feae208fc808b1d6b2266edb7','some admin','some.admin@boxtribute.org',1,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,'',2,'0000-00-00 00:00:00',99,NULL,NULL),
  (2,'bf13b44feae208fc808b1d6b2266edb7','Jane Doe','jane.doe@boxaid.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',1,'0000-00-00','0000-00-00'),
  (3,'bf13b44feae208fc808b1d6b2266edb7','Joe Doe','joe.doe@boxaid.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',2,'0000-00-00','0000-00-00'),
  (4,'bf13b44feae208fc808b1d6b2266edb7','Volunteer','stagingenv_volunteer@boxtribute.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',3,'0000-00-00','0000-00-00'),
  (5,'bf13b44feae208fc808b1d6b2266edb7','Coordinator','stagingenv_coordinator@boxtribute.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',2,'0000-00-00','0000-00-00'),
  (6,'bf13b44feae208fc808b1d6b2266edb7','Head of Operations','stagingenv_headofops@boxtribute.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',1,'0000-00-00','0000-00-00'),
  (7,'bf13b44feae208fc808b1d6b2266edb7','Dev Volunteer','dev_volunteer@boxaid.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',3,'0000-00-00','0000-00-00'),
  (8,'bf13b44feae208fc808b1d6b2266edb7','Dev Coordinator','dev_coordinator@boxaid.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',2,'0000-00-00','0000-00-00'),
  (9,'bf13b44feae208fc808b1d6b2266edb7','Dev Head of Operations','dev_headofops@boxaid.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',1,'0000-00-00','0000-00-00'),
  (10,'bf13b44feae208fc808b1d6b2266edb7','Jane Doe','jane.doe@boxcare.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',10,'0000-00-00','0000-00-00'),
  (11,'bf13b44feae208fc808b1d6b2266edb7','Joe Doe','joe.doe@boxcare.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',11,'0000-00-00','0000-00-00'),
  (12,'bf13b44feae208fc808b1d6b2266edb7','Sam Sample','sam.sample@boxcare.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',12,'0000-00-00','0000-00-00'),
  (15,'bf13b44feae208fc808b1d6b2266edb7','Joe Bloggs','joe.bloggs@boxcare.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',15,'0000-00-00','0000-00-00'),
  (16,'bf13b44feae208fc808b1d6b2266edb7','Dev Volunteer','dev_volunteer@boxcare.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',16,'0000-00-00','0000-00-00'),
  (17,'bf13b44feae208fc808b1d6b2266edb7','Dev Coordinator','dev_coordinator@boxcare.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',15,'0000-00-00','0000-00-00'),
  (18,'bf13b44feae208fc808b1d6b2266edb7','Dev Head of Operations','dev_headofops@boxcare.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',10,'0000-00-00','0000-00-00'),
  (19,'bf13b44feae208fc808b1d6b2266edb7','Another Dev Volunteer','another_dev_volunteer@boxcare.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',18,'0000-00-00','0000-00-00'),
  (20,'bf13b44feae208fc808b1d6b2266edb7','Another Dev Coordinator','another_dev_coordinatorr@boxcare.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',17,'0000-00-00','0000-00-00'),
  (23,'bf13b44feae208fc808b1d6b2266edb7','Lesvos Warehouse Volunteer','warehouse.volunteer@lesvos.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',3,'0000-00-00','0000-00-00'),
  (24,'bf13b44feae208fc808b1d6b2266edb7','Lesvos Free Shop Volunteer','freeshop.volunteer@lesvos.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',4,'0000-00-00','0000-00-00'),
  (25,'bf13b44feae208fc808b1d6b2266edb7','Lesvos Library Volunteer','library.volunteer@lesvos.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',5,'0000-00-00','0000-00-00'),
  (31,'bf13b44feae208fc808b1d6b2266edb7','Thessaloniki Coordinator','coordinator@thessaloniki.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',11,'0000-00-00','0000-00-00'),
  (32,'bf13b44feae208fc808b1d6b2266edb7','Samos Coordinator','coordinator@samos.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',12,'0000-00-00','0000-00-00'),
  (33,'bf13b44feae208fc808b1d6b2266edb7','Thessaloniki Volunteer','volunteer@thessaloniki.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',13,'0000-00-00','0000-00-00'),
  (34,'bf13b44feae208fc808b1d6b2266edb7','Samos Volunteer','volunteer@samos.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',14,'0000-00-00','0000-00-00'),
  (37,'bf13b44feae208fc808b1d6b2266edb7','Athens Coordinator','coordinator@athens.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',17,'0000-00-00','0000-00-00'),
  (38,'bf13b44feae208fc808b1d6b2266edb7','Athens Volunteer','volunteer@athens.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',18,'0000-00-00','0000-00-00'),
  (39,'bf13b44feae208fc808b1d6b2266edb7','Athens Warehouse Volunteer','warehouse.volunteer@athens.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',19,'0000-00-00','0000-00-00'),
  (40,'bf13b44feae208fc808b1d6b2266edb7','Athens Free Shop Volunteer','freeshop.volunteer@athens.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',20,'0000-00-00','0000-00-00'),
  (41,'bf13b44feae208fc808b1d6b2266edb7','Athens Label','label@athens.org',0,'0000-00-00 00:00:00','0000-00-00 00:00:00',NULL,NULL,NULL,NULL,NULL,2,'0000-00-00 00:00:00',21,'0000-00-00','0000-00-00'),
  (100000000,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_Admin','admin@admin.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:10:40',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000002,'0000-00-00','0000-00-00'),
  (100000001,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_Coordinator','coordinator@coordinator.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:11:08',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000001,'0000-00-00','0000-00-00'),
  (100000002,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_User','user@user.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:11:31',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000000,'0000-00-00','0000-00-00'),
  (100000003,'bf13b44feae208fc808b1d6b2266edb7','NotActived','notactivated@notactivated.com',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:14:35',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000000,'2119-07-20','2119-07-31'),
  (100000004,'bf13b44feae208fc808b1d6b2266edb7','Expired User','expired@expired.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:14:58',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000000,'2019-07-01','2019-07-09'),
  (100000005,'bf13b44feae208fc808b1d6b2266edb7','Deleted User','deleted@deleted.co.deleted.100000005',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:15:42',1,'2019-07-10 08:15:50',1,NULL,2,'2019-07-10 08:15:50',100000000,'0000-00-00','0000-00-00'),
  (100000006,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_NoPermissions','nopermissions@nopermissions.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:11:31',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000003,'0000-00-00','0000-00-00'),
  (100000007,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_DeactivateTest','deactivatetest@deactivatetest.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:11:31',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000000,'0000-00-00','0000-00-00'),
  (100000008,'bf13b44feae208fc808b1d6b2266edb7','BrowserTestUser_Pending','pending@pending.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:11:31',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000000,'2026-12-20','2027-12-20'),
  (100000009,'bf13b44feae208fc808b1d6b2266edb7','Deleted Coordinator','deleted_coordinator@deleted.co.deleted.100000009',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:15:42',1,'2019-07-10 08:15:50',1,NULL,2,'2019-07-10 08:15:50',100000001,'2018-05-26','2019-05-26'),
  (100000010,'bf13b44feae208fc808b1d6b2266edb7','Deleted Admin','deleted_admin@deleted.co.deleted.100000010',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:15:42',1,'2019-07-10 08:15:50',1,NULL,2,'2019-07-10 08:15:50',100000002,'0000-00-00','0000-00-00'),
  (100000011,'bf13b44feae208fc808b1d6b2266edb7','Expired Coordinator','expired_coordinator@expired.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:14:58',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000001,'2017-04-11','2017-05-28'),
  (100000012,'bf13b44feae208fc808b1d6b2266edb7','Expired Admin','expired_admin@expired.co',0,'0000-00-00 00:00:00','0000-00-00 00:00:00','2019-07-10 08:14:58',1,NULL,NULL,NULL,2,'0000-00-00 00:00:00',100000002,'2017-04-11','2017-05-28');
/*!40000 ALTER TABLE `cms_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distro_events`
--

DROP TABLE IF EXISTS `distro_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distro_events` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `planned_start_date_time` datetime NOT NULL,
  `planned_end_date_time` datetime NOT NULL,
  `location_id` int(11) unsigned NOT NULL,
  `distro_event_tracking_group_id` int(11) unsigned DEFAULT NULL,
  `state` varchar(255) NOT NULL DEFAULT 'Planning',
  `created_on` datetime NOT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `deleted_on` datetime DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `distro_events_planned_start_date_time` (`planned_start_date_time`),
  KEY `distro_events_planned_end_date_time` (`planned_end_date_time`),
  KEY `distro_events_state` (`state`),
  KEY `distro_events_modified_on` (`modified_on`),
  KEY `distro_events_created_on` (`created_on`),
  KEY `distro_events_deleted_on` (`deleted_on`),
  KEY `location_id` (`location_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `distro_event_tracking_group_id` (`distro_event_tracking_group_id`),
  CONSTRAINT `distro_events_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `distro_events_ibfk_3` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `distro_events_ibfk_4` FOREIGN KEY (`distro_event_tracking_group_id`) REFERENCES `distro_events_tracking_groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distro_events`
--

LOCK TABLES `distro_events` WRITE;
/*!40000 ALTER TABLE `distro_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `distro_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distro_events_tracking_logs`
--

DROP TABLE IF EXISTS `distro_events_tracking_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distro_events_tracking_logs` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `number_of_items` int(11) NOT NULL,
  `size_id` int(11) unsigned NOT NULL,
  `location_id` int(11) unsigned DEFAULT NULL,
  `flow_direction` varchar(255) DEFAULT NULL,
  `distro_event_tracking_group_id` int(11) unsigned DEFAULT NULL,
  `date` datetime NOT NULL,
  `details` text,
  PRIMARY KEY (`id`),
  KEY `distro_events_tracking_logs_date` (`date`),
  KEY `product_id` (`product_id`),
  KEY `size_id` (`size_id`),
  KEY `distro_events_tracking_logs_flow_direction` (`flow_direction`),
  KEY `location_id` (`location_id`),
  KEY `distro_event_tracking_group_id` (`distro_event_tracking_group_id`),
  CONSTRAINT `distro_events_tracking_logs_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_tracking_logs_ibfk_3` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_tracking_logs_ibfk_4` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_tracking_logs_ibfk_5` FOREIGN KEY (`distro_event_tracking_group_id`) REFERENCES `distro_events_tracking_groups` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distro_events_tracking_logs`
--

LOCK TABLES `distro_events_tracking_logs` WRITE;
/*!40000 ALTER TABLE `distro_events_tracking_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `distro_events_tracking_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distro_events_packing_list_entries`
--

DROP TABLE IF EXISTS `distro_events_packing_list_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distro_events_packing_list_entries` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `number_of_items` int(11) NOT NULL,
  `size_id` int(11) unsigned NOT NULL,
  `distro_event_id` int(11) unsigned NOT NULL,
  `state` varchar(255) NOT NULL,
  `created_on` datetime NOT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `distro_events_packing_list_entries_state` (`state`),
  KEY `distro_events_packing_list_entries_created_on` (`created_on`),
  KEY `distro_events_packing_list_entries_modified_on` (`modified_on`),
  KEY `distro_event_id` (`distro_event_id`),
  KEY `product_id` (`product_id`),
  KEY `size_id` (`size_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `distro_events_packing_list_entries_ibfk_1` FOREIGN KEY (`distro_event_id`) REFERENCES `distro_events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_packing_list_entries_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_packing_list_entries_ibfk_3` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_packing_list_entries_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `distro_events_packing_list_entries_ibfk_5` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distro_events_packing_list_entries`
--

LOCK TABLES `distro_events_packing_list_entries` WRITE;
/*!40000 ALTER TABLE `distro_events_packing_list_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `distro_events_packing_list_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `distro_events_unboxed_item_collections`
--

DROP TABLE IF EXISTS `distro_events_unboxed_item_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distro_events_unboxed_item_collections` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned NOT NULL,
  `number_of_items` int(11) NOT NULL,
  `size_id` int(11) unsigned NOT NULL,
  `distro_event_id` int(11) unsigned NOT NULL,
  `location_id` int(11) unsigned NOT NULL,
  `box_state_id` int(11) unsigned NOT NULL DEFAULT '1',
  `comments` varchar(255) DEFAULT NULL,
  `created_on` datetime NOT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `distro_events_unboxed_item_collections_created_on` (`created_on`),
  KEY `distro_events_unboxed_item_collections_modified_on` (`modified_on`),
  KEY `distro_event_id` (`distro_event_id`),
  KEY `product_id` (`product_id`),
  KEY `box_state_id` (`box_state_id`),
  KEY `size_id` (`size_id`),
  KEY `location_id` (`location_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_1` FOREIGN KEY (`distro_event_id`) REFERENCES `distro_events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_3` FOREIGN KEY (`box_state_id`) REFERENCES `box_state` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_4` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_5` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `distro_events_unboxed_item_collections_ibfk_7` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distro_events_unboxed_item_collections`
--

LOCK TABLES `distro_events_unboxed_item_collections` WRITE;
/*!40000 ALTER TABLE `distro_events_unboxed_item_collections` DISABLE KEYS */;
/*!40000 ALTER TABLE `distro_events_unboxed_item_collections` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

--
-- Table structure for table `distro_events_tracking_groups`
--

DROP TABLE IF EXISTS `distro_events_tracking_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distro_events_tracking_groups` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) DEFAULT NULL,
  `base_id` int(11) unsigned NOT NULL,
  `state` varchar(255) NOT NULL DEFAULT 'In Progress',
  `created_on` datetime NOT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified_on` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `distro_events_tracking_groups_state` (`state`),
  KEY `distro_events_tracking_groups_created_on` (`created_on`),
  KEY `distro_events_tracking_groups_modified_on` (`modified_on`),
  KEY `base_id` (`base_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `distro_events_tracking_groups_ibfk_1` FOREIGN KEY (`base_id`) REFERENCES `camps` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `distro_events_tracking_groups_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `distro_events_tracking_groups_ibfk_3` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `distro_events_tracking_groups`
--

LOCK TABLES `distro_events_tracking_groups` WRITE;
/*!40000 ALTER TABLE `distro_events_tracking_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `distro_events_tracking_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genders`
--

DROP TABLE IF EXISTS `genders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  `shortlabel` varchar(255) DEFAULT NULL,
  `seq` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `male` tinyint(1) NOT NULL DEFAULT '0',
  `female` tinyint(1) NOT NULL DEFAULT '0',
  `adult` tinyint(1) NOT NULL DEFAULT '0',
  `child` tinyint(1) NOT NULL DEFAULT '0',
  `baby` tinyint(1) NOT NULL DEFAULT '0',
  `color` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `genders_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `genders_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genders`
--

LOCK TABLES `genders` WRITE;
/*!40000 ALTER TABLE `genders` DISABLE KEYS */;
INSERT INTO `genders` VALUES
  (1,'Female','Female',1,NULL,NULL,NULL,NULL,0,1,1,0,0,'0'),
  (2,'Male','Male',2,NULL,NULL,NULL,NULL,1,0,1,0,0,'0'),
  (3,'Unisex Adult','Unisex',3,NULL,NULL,NULL,NULL,1,1,1,0,0,'0'),
  (4,'Girl','Girl',4,NULL,NULL,NULL,NULL,0,1,0,1,0,'0'),
  (5,'Boy','Boy',5,NULL,NULL,NULL,NULL,1,0,0,1,0,'0'),
  (6,'Unisex Kid','Kid',7,NULL,NULL,NULL,NULL,1,1,0,1,0,'0'),
  (9,'Unisex Baby','Baby',8,NULL,NULL,NULL,NULL,1,1,0,0,0,'1'),
  (10,'-',NULL,0,NULL,NULL,NULL,NULL,1,1,1,1,1,'1'),
  (12,'Teen Girl','Girl',4,NULL,NULL,NULL,NULL,0,1,1,0,0,'0'),
  (13,'Teen Boy','Boy',5,NULL,NULL,NULL,NULL,1,0,1,0,0,'0');
/*!40000 ALTER TABLE `genders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `tablename` varchar(255) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `changes` text,
  `user_id` int(11) unsigned DEFAULT NULL,
  `ip` varchar(20) DEFAULT NULL,
  `changedate` datetime DEFAULT NULL,
  `from_int` int(11) DEFAULT NULL,
  `to_int` int(11) DEFAULT NULL,
  `from_float` float DEFAULT NULL,
  `to_float` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `recordid_changedate_composite_index` (`record_id`,`changedate`),
  KEY `tablename_recordid_changedate_composite_index` (`tablename`,`record_id`,`changedate`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30918 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itemsout`
--

DROP TABLE IF EXISTS `itemsout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `itemsout` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int(11) unsigned DEFAULT NULL,
  `size_id` int(11) unsigned DEFAULT NULL,
  `count` int(11) DEFAULT NULL,
  `movedate` datetime DEFAULT NULL,
  `from_location` int(11) unsigned DEFAULT NULL,
  `to_location` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_location` (`from_location`),
  KEY `to_location` (`to_location`),
  KEY `product_id` (`product_id`),
  KEY `size_id` (`size_id`),
  CONSTRAINT `itemsout_ibfk_5` FOREIGN KEY (`from_location`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `itemsout_ibfk_6` FOREIGN KEY (`to_location`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `itemsout_ibfk_7` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `itemsout_ibfk_8` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itemsout`
--

LOCK TABLES `itemsout` WRITE;
/*!40000 ALTER TABLE `itemsout` DISABLE KEYS */;
/*!40000 ALTER TABLE `itemsout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `languages` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `visible` tinyint(4) NOT NULL DEFAULT '1',
  `code` varchar(255) DEFAULT NULL,
  `locale` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `strftime_dateformat` varchar(255) DEFAULT NULL,
  `smarty_dateformat` varchar(255) DEFAULT NULL,
  `seq` int(11) DEFAULT NULL,
  `rtl` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES
  (1,0,'nl','nl_NL','Dutch','%A %e %B %Y','%A %e %B %Y',1,0),
  (2,1,'en','en_GB','English','%A %B %e %Y','%A %B %e %Y',2,0),
  (3,1,'fr','fr_FR','French','%A %B %e %Y','%A %B %e %Y',4,0),
  (4,0,'de','de_DE','German','%A %e. %B %Y','%A %e. %B %Y',3,0),
  (5,1,'ar','ar_AE','Arabic','%A %e. %B %Y','%A %e. %B %Y',5,1),
  (6,1,'ckb','ckb_TR','Sorani / Central Kurdish','%A %e. %B %Y','%A %e. %B %Y',6,1),
  (8,1,NULL,NULL,'Urdu','%A %B %e %Y','%A %B %e %Y',7,1),
  (9,1,NULL,NULL,'Kurmanji / Northern Kurdish',NULL,NULL,9,0),
  (10,1,NULL,NULL,'Farsi',NULL,NULL,10,1),
  (11,1,NULL,NULL,'Pashto',NULL,NULL,11,1),
  (12,1,NULL,NULL,'Tigrinya',NULL,NULL,12,0),
  (13,1,NULL,NULL,'Amharic',NULL,NULL,13,0),
  (14,1,NULL,NULL,'Lingala',NULL,NULL,15,0),
  (15,1,NULL,NULL,'Somali',NULL,NULL,15,0),
  (16,1,NULL,NULL,'Dari',NULL,NULL,16,0);
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laundry_appointments`
--

DROP TABLE IF EXISTS `laundry_appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laundry_appointments` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `cyclestart` date DEFAULT NULL,
  `timeslot` int(11) unsigned NOT NULL,
  `people_id` int(11) unsigned DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `noshow` tinyint(4) NOT NULL DEFAULT '0',
  `dropoff` tinyint(4) NOT NULL DEFAULT '0',
  `collected` tinyint(4) NOT NULL DEFAULT '0',
  `comment` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timeslot` (`timeslot`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `people_id` (`people_id`),
  CONSTRAINT `laundry_appointments_ibfk_3` FOREIGN KEY (`timeslot`) REFERENCES `laundry_slots` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `laundry_appointments_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `laundry_appointments_ibfk_6` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `laundry_appointments_ibfk_7` FOREIGN KEY (`people_id`) REFERENCES `people` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laundry_appointments`
--

LOCK TABLES `laundry_appointments` WRITE;
/*!40000 ALTER TABLE `laundry_appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `laundry_appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laundry_machines`
--

DROP TABLE IF EXISTS `laundry_machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laundry_machines` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  `station` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `station` (`station`),
  CONSTRAINT `laundry_machines_ibfk_1` FOREIGN KEY (`station`) REFERENCES `laundry_stations` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laundry_machines`
--

LOCK TABLES `laundry_machines` WRITE;
/*!40000 ALTER TABLE `laundry_machines` DISABLE KEYS */;
/*!40000 ALTER TABLE `laundry_machines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laundry_slots`
--

DROP TABLE IF EXISTS `laundry_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laundry_slots` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `day` tinyint(4) DEFAULT NULL,
  `time` int(11) unsigned NOT NULL,
  `machine` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `machine` (`machine`),
  KEY `time` (`time`),
  CONSTRAINT `laundry_slots_ibfk_1` FOREIGN KEY (`machine`) REFERENCES `laundry_machines` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `laundry_slots_ibfk_2` FOREIGN KEY (`time`) REFERENCES `laundry_times` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laundry_slots`
--

LOCK TABLES `laundry_slots` WRITE;
/*!40000 ALTER TABLE `laundry_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `laundry_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laundry_stations`
--

DROP TABLE IF EXISTS `laundry_stations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laundry_stations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(50) DEFAULT NULL,
  `access` varchar(255) NOT NULL DEFAULT 'TRUE',
  `camp_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `laundry_stations_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laundry_stations`
--

LOCK TABLES `laundry_stations` WRITE;
/*!40000 ALTER TABLE `laundry_stations` DISABLE KEYS */;
/*!40000 ALTER TABLE `laundry_stations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `laundry_times`
--

DROP TABLE IF EXISTS `laundry_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `laundry_times` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `laundry_times`
--

LOCK TABLES `laundry_times` WRITE;
/*!40000 ALTER TABLE `laundry_times` DISABLE KEYS */;
/*!40000 ALTER TABLE `laundry_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library`
--

DROP TABLE IF EXISTS `library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `booktitle_en` varchar(255) DEFAULT NULL,
  `booktitle_ar` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `type_id` int(11) unsigned DEFAULT NULL,
  `deleted` tinyint(4) NOT NULL DEFAULT '0',
  `visible` tinyint(4) NOT NULL DEFAULT '0',
  `comment` text NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `camp_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  KEY `type_id` (`type_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `library_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `library_ibfk_4` FOREIGN KEY (`type_id`) REFERENCES `library_type` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `library_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `library_ibfk_6` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library`
--

LOCK TABLES `library` WRITE;
/*!40000 ALTER TABLE `library` DISABLE KEYS */;
INSERT INTO `library` VALUES (1,'82016562','Versatile user-facing intranet',NULL,'Marks, Lang and Johnson',1,0,1,'',NULL,NULL,NULL,NULL,1),(2,'15442666','Diverse disintermediate framework',NULL,'Predovic Group',1,0,0,'',NULL,NULL,NULL,NULL,1),(3,'62113380','Digitized homogeneous neural-net',NULL,'Kunze, Langosh and McGlynn',1,0,0,'',NULL,NULL,NULL,NULL,1),(4,'78533516','Re-engineered bifurcated hub',NULL,'Jakubowski-Cormier',2,0,0,'',NULL,NULL,NULL,NULL,1),(5,'02609621','Object-based neutral application',NULL,'Marvin, Torphy and Boyer',1,0,0,'',NULL,NULL,NULL,NULL,1),(6,'49428971','Persistent global conglomeration',NULL,'Breitenberg PLC',1,0,1,'',NULL,NULL,NULL,NULL,1),(7,'34982624','Stand-alone interactive middleware',NULL,'Lesch Group',1,0,0,'',NULL,NULL,NULL,NULL,1),(8,'79308977','Networked multi-state methodology',NULL,'Schimmel-Zboncak',1,0,0,'',NULL,NULL,NULL,NULL,1),(9,'84026415','Switchable neutral solution',NULL,'Kuhic, Kuphal and Schaden',1,0,1,'',NULL,NULL,NULL,NULL,1),(10,'66363651','Public-key local policy',NULL,'Dickinson-Kerluke',2,0,1,'',NULL,NULL,NULL,NULL,1),(11,'46784247','Multi-lateral didactic time-frame',NULL,'Koch, Schultz and Bode',2,0,1,'',NULL,NULL,NULL,NULL,1),(12,'82288464','Decentralized incremental leverage',NULL,'Balistreri, Gaylord and Rosenbaum',1,0,0,'',NULL,NULL,NULL,NULL,1),(13,'88830377','Adaptive 6thgeneration toolset',NULL,'Dietrich-Prosacco',2,0,0,'',NULL,NULL,NULL,NULL,1),(14,'23931138','Multi-tiered stable time-frame',NULL,'Mayer LLC',1,0,0,'',NULL,NULL,NULL,NULL,1),(15,'24063418','Automated actuating website',NULL,'Luettgen, Larkin and Kuvalis',2,0,0,'',NULL,NULL,NULL,NULL,1),(16,'55363389','Re-engineered full-range function',NULL,'Cummerata-Walter',1,0,0,'',NULL,NULL,NULL,NULL,1),(17,'37921057','Re-contextualized 24/7 forecast',NULL,'Sauer, Gleichner and Nader',1,0,0,'',NULL,NULL,NULL,NULL,1),(18,'96919897','Horizontal multi-state infrastructure',NULL,'Farrell-Kunze',2,0,0,'',NULL,NULL,NULL,NULL,1),(19,'17619615','Profound fresh-thinking hierarchy',NULL,'Wiza-Olson',2,0,0,'',NULL,NULL,NULL,NULL,1),(20,'31325851','Versatile web-enabled model',NULL,'Bayer, Hauck and Schneider',1,0,0,'',NULL,NULL,NULL,NULL,1),(21,'57873060','Synergized even-keeled groupware',NULL,'Schaden-Sipes',2,0,0,'',NULL,NULL,NULL,NULL,1),(22,'03695760','Robust logistical blockchain',NULL,'Stroman-McCullough',2,0,0,'',NULL,NULL,NULL,NULL,1),(23,'19885193','Configurable interactive frame',NULL,'Schaefer Ltd',2,0,1,'',NULL,NULL,NULL,NULL,1),(24,'79822053','Profit-focused leadingedge policy',NULL,'Bosco, Ward and McDermott',2,0,1,'',NULL,NULL,NULL,NULL,1),(25,'07996313','Integrated web-enabled challenge',NULL,'Hodkiewicz, Tremblay and Dare',2,0,1,'',NULL,NULL,NULL,NULL,1),(26,'46781819','Multi-tiered eco-centric hierarchy',NULL,'Gutkowski-Reilly',2,0,1,'',NULL,NULL,NULL,NULL,1),(27,'81764419','Operative background solution',NULL,'Schaden Ltd',2,0,1,'',NULL,NULL,NULL,NULL,1),(28,'09289628','Focused secondary circuit',NULL,'Turcotte-Thompson',1,0,0,'',NULL,NULL,NULL,NULL,1),(29,'78739369','Open-source non-volatile paradigm',NULL,'Wisozk-Lockman',1,0,1,'',NULL,NULL,NULL,NULL,1),(30,'27543788','Visionary systematic throughput',NULL,'Rutherford-Hartmann',2,0,0,'',NULL,NULL,NULL,NULL,1),(31,'16146655','Robust bandwidth-monitored service-desk',NULL,'Reichel and Sons',2,0,0,'',NULL,NULL,NULL,NULL,1),(32,'62327237','Secured non-volatile algorithm',NULL,'Farrell LLC',1,0,0,'',NULL,NULL,NULL,NULL,1),(33,'91011947','Advanced 4thgeneration approach',NULL,'Howell-McKenzie',1,0,1,'',NULL,NULL,NULL,NULL,1),(34,'81946532','Upgradable uniform alliance',NULL,'Mohr-Auer',1,0,1,'',NULL,NULL,NULL,NULL,1),(35,'79745567','Assimilated bandwidth-monitored parallelism',NULL,'Zemlak-Hintz',2,0,1,'',NULL,NULL,NULL,NULL,1),(36,'40928494','Innovative zerotolerance time-frame',NULL,'Little-Hessel',1,0,1,'',NULL,NULL,NULL,NULL,1),(37,'42536727','Multi-tiered grid-enabled customerloyalty',NULL,'Romaguera-Ledner',1,0,0,'',NULL,NULL,NULL,NULL,1),(38,'26037738','De-engineered client-server knowledgeuser',NULL,'Quigley Inc',2,0,0,'',NULL,NULL,NULL,NULL,1),(39,'22033413','Visionary human-resource capability',NULL,'Romaguera, O\'Reilly and Hahn',1,0,0,'',NULL,NULL,NULL,NULL,1),(40,'74837397','Cross-group bifurcated capability',NULL,'West-Stanton',2,0,1,'',NULL,NULL,NULL,NULL,1),(41,'73660057','Realigned homogeneous website',NULL,'Bailey and Sons',2,0,1,'',NULL,NULL,NULL,NULL,1),(42,'89334652','Grass-roots multi-state capability',NULL,'Bartoletti and Sons',2,0,1,'',NULL,NULL,NULL,NULL,1),(43,'36827954','Centralized motivating knowledgebase',NULL,'Block Group',2,0,0,'',NULL,NULL,NULL,NULL,1),(44,'49548839','Innovative hybrid algorithm',NULL,'Sauer, Zulauf and Mayer',1,0,1,'',NULL,NULL,NULL,NULL,1),(45,'43235018','Operative bandwidth-monitored knowledgebase',NULL,'Eichmann Inc',2,0,0,'',NULL,NULL,NULL,NULL,1),(46,'31189835','User-centric encompassing protocol',NULL,'Cole-Johnson',2,0,0,'',NULL,NULL,NULL,NULL,1),(47,'79674539','Compatible bandwidth-monitored conglomeration',NULL,'Collins, O\'Kon and Gottlieb',2,0,1,'',NULL,NULL,NULL,NULL,1),(48,'18962024','Centralized client-driven neural-net',NULL,'Franecki PLC',2,0,0,'',NULL,NULL,NULL,NULL,1),(49,'75650025','Automated optimal array',NULL,'Kemmer, Wiza and Erdman',1,0,0,'',NULL,NULL,NULL,NULL,1),(50,'04732877','Extended secondary orchestration',NULL,'Fay Inc',2,0,1,'',NULL,NULL,NULL,NULL,1),(51,'76589737','Intuitive modular budgetarymanagement',NULL,'Daniel-Bergstrom',2,0,0,'',NULL,NULL,NULL,NULL,1),(52,'01323702','Polarised 24hour blockchain',NULL,'Hoeger, Marquardt and Shanahan',1,0,1,'',NULL,NULL,NULL,NULL,1),(53,'81377237','Multi-layered dedicated database',NULL,'Pouros-O\'Conner',1,0,0,'',NULL,NULL,NULL,NULL,1),(54,'24625357','Robust regional core',NULL,'Lindgren Inc',2,0,0,'',NULL,NULL,NULL,NULL,1),(55,'74950355','Operative object-oriented benchmark',NULL,'Lesch-Monahan',2,0,1,'',NULL,NULL,NULL,NULL,1),(56,'17572415','Virtual uniform pricingstructure',NULL,'Schiller, Mayer and Jones',2,0,0,'',NULL,NULL,NULL,NULL,1),(57,'08737915','Synchronised non-volatile moderator',NULL,'Nikolaus, Schuster and Harvey',1,0,1,'',NULL,NULL,NULL,NULL,1),(58,'11021858','User-centric zerodefect benchmark',NULL,'Larson-Larson',2,0,1,'',NULL,NULL,NULL,NULL,1),(59,'84093387','Monitored object-oriented protocol',NULL,'Kuhlman, Skiles and Huels',1,0,1,'',NULL,NULL,NULL,NULL,1),(60,'63708639','Function-based maximized access',NULL,'Ziemann-Hickle',1,0,0,'',NULL,NULL,NULL,NULL,1),(61,'69415258','Operative didactic matrices',NULL,'Wilkinson, Bechtelar and Reilly',2,0,0,'',NULL,NULL,NULL,NULL,1),(62,'64093864','Advanced upward-trending project',NULL,'Wunsch-Nolan',1,0,0,'',NULL,NULL,NULL,NULL,1),(63,'43213313','Configurable discrete challenge',NULL,'Leffler PLC',2,0,1,'',NULL,NULL,NULL,NULL,1),(64,'48930123','Distributed demand-driven encryption',NULL,'Friesen-Kerluke',1,0,0,'',NULL,NULL,NULL,NULL,1),(65,'87128314','Total value-added algorithm',NULL,'Nader, Parisian and Boyer',2,0,1,'',NULL,NULL,NULL,NULL,1),(66,'42811589','User-centric logistical frame',NULL,'Gislason and Sons',1,0,0,'',NULL,NULL,NULL,NULL,1),(67,'74517787','Decentralized bandwidth-monitored groupware',NULL,'Wiza and Sons',2,0,0,'',NULL,NULL,NULL,NULL,1),(68,'74582976','Business-focused transitional infrastructure',NULL,'Brekke-Douglas',1,0,0,'',NULL,NULL,NULL,NULL,1),(69,'28578208','Synergistic grid-enabled database',NULL,'Littel, Kertzmann and Eichmann',1,0,1,'',NULL,NULL,NULL,NULL,1),(70,'18969771','Ameliorated cohesive GraphicalUserInterface',NULL,'Collins Inc',2,0,0,'',NULL,NULL,NULL,NULL,1),(71,'90280016','Networked real-time neural-net',NULL,'Brown, Hermiston and Grady',2,0,0,'',NULL,NULL,NULL,NULL,1),(72,'54502512','Decentralized hybrid portal',NULL,'Johns, Jast and Weber',2,0,0,'',NULL,NULL,NULL,NULL,1),(73,'65695760','Realigned needs-based localareanetwork',NULL,'Prosacco-Heathcote',2,0,1,'',NULL,NULL,NULL,NULL,1),(74,'03660591','Polarised radical groupware',NULL,'Keeling Group',2,0,0,'',NULL,NULL,NULL,NULL,1),(75,'97385752','Automated holistic matrix',NULL,'Moore-Ryan',1,0,0,'',NULL,NULL,NULL,NULL,1),(76,'99441890','Universal national focusgroup',NULL,'Hettinger, Boyer and Leannon',2,0,1,'',NULL,NULL,NULL,NULL,1),(77,'55932738','Cross-group dedicated artificialintelligence',NULL,'Schneider PLC',2,0,1,'',NULL,NULL,NULL,NULL,1),(78,'53439253','Multi-layered modular initiative',NULL,'Veum and Sons',1,0,0,'',NULL,NULL,NULL,NULL,1),(79,'95681863','Triple-buffered impactful concept',NULL,'Greenholt-Barton',2,0,0,'',NULL,NULL,NULL,NULL,1),(80,'06849443','Pre-emptive 24/7 collaboration',NULL,'Cormier-Ruecker',1,0,1,'',NULL,NULL,NULL,NULL,1),(81,'07569470','Expanded systematic functionalities',NULL,'Donnelly-Denesik',2,0,0,'',NULL,NULL,NULL,NULL,1),(82,'08842312','Operative secondary approach',NULL,'Padberg, Bailey and Langosh',2,0,1,'',NULL,NULL,NULL,NULL,1),(83,'48945349','Versatile incremental methodology',NULL,'Crooks Inc',2,0,0,'',NULL,NULL,NULL,NULL,1),(84,'59900573','Quality-focused demand-driven internetsolution',NULL,'Schaden LLC',1,0,1,'',NULL,NULL,NULL,NULL,1),(85,'25583830','Universal dynamic utilisation',NULL,'Zemlak Group',1,0,0,'',NULL,NULL,NULL,NULL,1),(86,'11978824','Innovative contextually-based extranet',NULL,'Effertz Ltd',1,0,0,'',NULL,NULL,NULL,NULL,1),(87,'10195055','Stand-alone didactic internetsolution',NULL,'Farrell LLC',1,0,1,'',NULL,NULL,NULL,NULL,1),(88,'22048516','Triple-buffered regional time-frame',NULL,'Towne-Bechtelar',1,0,1,'',NULL,NULL,NULL,NULL,1),(89,'26356037','Quality-focused radical forecast',NULL,'Funk, Leuschke and Nienow',1,0,1,'',NULL,NULL,NULL,NULL,1),(90,'32314540','Function-based optimizing superstructure',NULL,'Vandervort-Weber',2,0,1,'',NULL,NULL,NULL,NULL,1),(91,'83624919','User-centric fault-tolerant hierarchy',NULL,'Beatty, Roob and Rutherford',1,0,0,'',NULL,NULL,NULL,NULL,1),(92,'16108356','Future-proofed 3rdgeneration model',NULL,'McDermott LLC',1,0,0,'',NULL,NULL,NULL,NULL,1),(93,'12586080','Quality-focused zerotolerance knowledgebase',NULL,'Gerlach-Moore',1,0,1,'',NULL,NULL,NULL,NULL,1),(94,'70692860','Secured motivating capacity',NULL,'Pacocha, Lubowitz and Reichel',2,0,1,'',NULL,NULL,NULL,NULL,1),(95,'05445585','Synchronised 5thgeneration challenge',NULL,'Nicolas Ltd',1,0,0,'',NULL,NULL,NULL,NULL,1),(96,'75725426','Progressive background hardware',NULL,'Bauch, McClure and Grant',1,0,0,'',NULL,NULL,NULL,NULL,1),(97,'60684585','Up-sized scalable leverage',NULL,'Greenholt-Thiel',2,0,0,'',NULL,NULL,NULL,NULL,1),(98,'56918526','Reverse-engineered context-sensitive access',NULL,'Dicki, Corkery and Konopelski',1,0,0,'',NULL,NULL,NULL,NULL,1),(99,'43509249','Sharable bifurcated processimprovement',NULL,'Mitchell, Lubowitz and O\'Kon',2,0,1,'',NULL,NULL,NULL,NULL,1),(100,'13562960','Automated bandwidth-monitored localareanetwork',NULL,'Senger and Sons',1,0,1,'',NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_transactions`
--

DROP TABLE IF EXISTS `library_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `transaction_date` datetime DEFAULT NULL,
  `book_id` int(11) DEFAULT NULL,
  `people_id` int(11) unsigned DEFAULT NULL,
  `status` varchar(5) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `comment` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `people_id` (`people_id`),
  CONSTRAINT `library_transactions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `library_transactions_ibfk_5` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `library_transactions_ibfk_6` FOREIGN KEY (`people_id`) REFERENCES `people` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_transactions`
--

LOCK TABLES `library_transactions` WRITE;
/*!40000 ALTER TABLE `library_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `library_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_type`
--

DROP TABLE IF EXISTS `library_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `library_type` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) DEFAULT NULL,
  `camp_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `library_type_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_type`
--

LOCK TABLES `library_type` WRITE;
/*!40000 ALTER TABLE `library_type` DISABLE KEYS */;
INSERT INTO `library_type` VALUES (1,'Books',1),(2,'Magazines',1);
/*!40000 ALTER TABLE `library_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `locations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  `camp_id` int(11) unsigned NOT NULL,
  `seq` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `visible` tinyint(4) NOT NULL DEFAULT '1',
  `container_stock` tinyint(4) NOT NULL DEFAULT '0',
  `is_market` tinyint(4) NOT NULL DEFAULT '0',
  `is_donated` tinyint(4) NOT NULL DEFAULT '0',
  `is_lost` tinyint(4) NOT NULL DEFAULT '0',
  `type` varchar(20) NOT NULL DEFAULT 'Warehouse',
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `deleted` datetime DEFAULT NULL,
  `is_scrap` tinyint(1) NOT NULL DEFAULT '0',
  `box_state_id` int(11) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  KEY `box_state_id` (`box_state_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `locations_type_index` (`type`),
  KEY `locations_latitude_index` (`latitude`),
  KEY `locations_longitude_index` (`longitude`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `locations_ibfk_4` FOREIGN KEY (`box_state_id`) REFERENCES `box_state` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `locations_ibfk_5` FOREIGN KEY (`box_state_id`) REFERENCES `box_state` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `locations_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `locations_ibfk_7` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000036 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES
  (100000000,'TestShop',100000000,NULL,NULL,NULL,NULL,NULL,0,0,1,0,0,'Warehouse',NULL,NULL,NULL,NULL,0,5),
  (100000001,'TestLOST',100000000,NULL,NULL,NULL,NULL,NULL,0,0,0,0,1,'Warehouse',NULL,NULL,NULL,'2022-12-21 18:00:00',0,2),
  (100000002,'TestDonated',100000000,NULL,NULL,NULL,NULL,NULL,0,0,0,1,0,'Warehouse',NULL,NULL,NULL,NULL,0,5),
  (100000003,'TestWarehouse',100000000,NULL,NULL,NULL,NULL,NULL,1,0,0,0,0,'Warehouse',NULL,NULL,NULL,NULL,0,1),
  (100000004,'TestStockroom',100000000,NULL,NULL,NULL,NULL,NULL,1,1,0,0,0,'Warehouse',NULL,NULL,NULL,NULL,0,1),
  (100000005,'TestDummyLocation',100000001,NULL,NULL,NULL,NULL,NULL,0,0,1,0,0,'Warehouse',NULL,NULL,NULL,NULL,0,5),
  (100000006,'TestSCRAP',100000000,NULL,NULL,NULL,NULL,NULL,0,0,0,0,0,'Warehouse',NULL,NULL,NULL,'2022-12-21 18:00:00',1,6);
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `logdate` datetime DEFAULT NULL,
  `content` text,
  `ip` varchar(255) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `numbers`
--

DROP TABLE IF EXISTS `numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `numbers` (
  `value` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  PRIMARY KEY (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `numbers`
--

LOCK TABLES `numbers` WRITE;
/*!40000 ALTER TABLE `numbers` DISABLE KEYS */;
INSERT INTO `numbers` VALUES (0,'none'),(1,'one'),(2,'two'),(3,'three'),(4,'four'),(5,'five'),(6,'six'),(7,'seven'),(8,'eight'),(9,'nine'),(10,'ten');
/*!40000 ALTER TABLE `numbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organisations`
--

DROP TABLE IF EXISTS `organisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organisations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `deleted` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `organisations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `organisations_ibfk_2` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000006 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organisations`
--

LOCK TABLES `organisations` WRITE;
/*!40000 ALTER TABLE `organisations` DISABLE KEYS */;
INSERT INTO `organisations` VALUES
  (1,'BoxAid',NULL,NULL,NULL,NULL,NULL),
  (2,'BoxCare',NULL,NULL,NULL,NULL,NULL),
  (100000000,'TestOrganisation','2019-07-10 08:05:56',1,NULL,NULL,NULL),
  (100000001,'DummyTestOrgWithBoxes','2019-09-29 08:05:56',1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `organisations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `people`
--

DROP TABLE IF EXISTS `people`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `people` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) unsigned DEFAULT NULL,
  `seq` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL DEFAULT '',
  `lastname` varchar(255) NOT NULL DEFAULT '',
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(255) NOT NULL DEFAULT '',
  `family_id` int(11) NOT NULL,
  `visible` int(11) NOT NULL DEFAULT '1',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `url` int(11) DEFAULT NULL,
  `container` varchar(255) NOT NULL DEFAULT '',
  `tent` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL DEFAULT '',
  `pass` varchar(255) NOT NULL DEFAULT '',
  `language` int(11) NOT NULL DEFAULT '5',
  `resetpassword` varchar(255) DEFAULT NULL,
  `comments` text,
  `workshoptraining` int(11) NOT NULL DEFAULT '0',
  `workshopsupervisor` int(11) NOT NULL DEFAULT '0',
  `phone` varchar(255) DEFAULT NULL,
  `bicycletraining` int(11) NOT NULL DEFAULT '0',
  `camp_id` int(11) unsigned NOT NULL,
  `deleted` datetime NOT NULL,
  `extraportion` int(11) NOT NULL DEFAULT '0',
  `notregistered` tinyint(4) NOT NULL DEFAULT '0',
  `workshopban` date DEFAULT NULL,
  `bicycleban` date DEFAULT NULL,
  `bicyclebancomment` text NOT NULL,
  `workshopbancomment` text NOT NULL,
  `volunteer` tinyint(4) NOT NULL DEFAULT '0',
  `laundryblock` tinyint(4) NOT NULL DEFAULT '0',
  `laundrycomment` varchar(255) DEFAULT NULL,
  `approvalsigned` tinyint(4) NOT NULL DEFAULT '0',
  `signaturefield` text,
  `date_of_signature` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `container` (`container`),
  KEY `camp_id` (`camp_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `people_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `people_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `people_ibfk_6` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `people_ibfk_7` FOREIGN KEY (`parent_id`) REFERENCES `people` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000484 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `people`
--

LOCK TABLES `people` WRITE;
/*!40000 ALTER TABLE `people` DISABLE KEYS */;
INSERT INTO `people` VALUES
  (100000001,NULL,0,'User','WithoutTokens','1980-07-10','',0,1,'2019-09-02 00:00:00',NULL,NULL,NULL,NULL,'001','','','',5,NULL,NULL,0,0,NULL,0,100000000,'0000-00-00 00:00:00',0,0,NULL,NULL,'','',0,0,NULL,1,NULL,'2019-09-02 00:00:00'),
  (100000002,NULL,0,'Conor','McGregor','1980-07-10','',0,1,'2019-09-02 00:00:00',NULL,NULL,NULL,NULL,'002','','','',5,NULL,NULL,0,0,NULL,0,100000000,'0000-00-00 00:00:00',0,0,NULL,NULL,'','',0,0,NULL,1,NULL,'2019-09-02 00:00:00'),
  (100000003,NULL,0,'Garry','Tonon','1985-07-10','',0,1,'2019-09-01 00:00:00',NULL,NULL,NULL,NULL,'003','','','',5,NULL,NULL,0,0,NULL,0,100000000,'0000-00-00 00:00:00',0,0,NULL,NULL,'','',0,0,NULL,1,NULL,'2019-09-02 00:00:00'),
  (100000004,NULL,0,'Kron','Gracie','1978-07-10','',0,1,'2019-09-02 00:00:00',NULL,NULL,NULL,NULL,'004','','','',5,NULL,NULL,0,0,NULL,0,100000000,'0000-00-00 00:00:00',0,0,NULL,NULL,'','',0,0,NULL,1,NULL,'2019-09-02 00:00:00'),
  (100000005,NULL,0,'User','WithoutApproval','1978-07-10','',0,1,'2019-09-02 00:00:00',NULL,NULL,NULL,NULL,'004','','','',5,NULL,NULL,0,0,NULL,0,100000000,'0000-00-00 00:00:00',0,0,NULL,NULL,'','',0,0,NULL,0,NULL,'0000-00-00 00:00:00'),
  (100000006,NULL,0,'DeactivatedBeneficiary','DeactivatedBeneficiary','1978-07-10','',0,1,'2019-09-02 00:00:00',NULL,NULL,NULL,NULL,'004','','','',5,NULL,NULL,0,0,NULL,0,100000000,'2019-10-25 11:01:30',0,0,NULL,NULL,'','',0,0,NULL,1,NULL,'2019-09-02 00:00:00'),
  (100000483,NULL,1,'some','one',NULL,'',0,1,NULL,NULL,NULL,NULL,NULL,'','','','',5,NULL,NULL,0,0,NULL,0,1,'2022-11-10 09:29:10',0,0,NULL,NULL,'','',0,0,NULL,0,NULL,'0000-00-00 00:00:00'),
  (100000484,NULL,1,'some','one',NULL,'',0,1,NULL,NULL,NULL,NULL,NULL,'','','','',5,NULL,NULL,0,0,NULL,0,3,'2022-11-10 09:29:10',0,0,NULL,NULL,'','',0,0,NULL,0,NULL,'0000-00-00 00:00:00'),
  (100000485,NULL,1,'some','one',NULL,'',0,1,NULL,NULL,NULL,NULL,NULL,'','','','',5,NULL,NULL,0,0,NULL,0,4,'2022-11-10 09:29:34',0,0,NULL,NULL,'','',0,0,NULL,0,NULL,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `people` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phinxlog`
--

DROP TABLE IF EXISTS `phinxlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phinxlog` (
  `version` bigint(20) NOT NULL,
  `migration_name` varchar(100) DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `breakpoint` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phinxlog`
--

LOCK TABLES `phinxlog` WRITE;
/*!40000 ALTER TABLE `phinxlog` DISABLE KEYS */;
INSERT INTO `phinxlog` VALUES (20190610113824,'InitialSchema','2021-06-18 15:51:32','2021-06-18 15:51:38',0),(20190612100627,'AddStationToLaundry','2021-06-18 15:51:38','2021-06-18 15:51:38',0),(20190613211018,'NewUserMgmt','2021-06-18 15:51:38','2021-06-18 15:51:40',0),(20190613224510,'UsergroupsLevels','2021-06-18 15:51:40','2021-06-18 15:51:41',0),(20190614143640,'AddOrganisationColumn','2021-06-18 15:51:41','2021-06-18 15:51:41',0),(20190616152410,'AfterRotterdamSprint','2021-06-18 15:51:41','2021-06-18 15:51:42',0),(20190621183422,'AddCurrencyName','2021-06-18 15:51:42','2021-06-18 15:51:42',0),(20190622184117,'AddOrganizationIdsToCmsUsersTable','2021-06-18 15:51:42','2021-06-18 15:51:43',0),(20190623073649,'MakeOrganisationInCmsUsersForeignKey','2021-06-18 15:51:43','2021-06-18 15:51:44',0),(20190623100406,'AddDeletedColumnToUsergroups','2021-06-18 15:51:44','2021-06-18 15:51:44',0),(20190623123844,'AddForeignKeysInUserMgmt','2021-06-18 15:51:44','2021-06-18 15:51:46',0),(20190623140300,'AddDeletedColumnToOrganisations','2021-06-18 15:51:46','2021-06-18 15:51:48',0),(20190701120113,'FixUsergroupsForeignKey','2021-06-18 15:51:48','2021-06-18 15:51:49',0),(20190703082355,'AddProductForeignKeys','2021-06-18 15:51:49','2021-06-18 15:51:49',0),(20190703090715,'AddParentIdInProductCategories','2021-06-18 15:51:49','2021-06-18 15:51:50',0),(20190703145717,'CleanUpProductsTable','2021-06-18 15:51:50','2021-06-18 15:51:50',0),(20190703153854,'AllowNullForProductDeletedTable','2021-06-18 15:51:50','2021-06-18 15:51:51',0),(20190721142832,'AddSignatureDateInPeople','2021-06-18 15:51:51','2021-06-18 15:51:51',0),(20190725174628,'AddResettokensColumnToBases','2021-06-18 15:51:51','2021-06-18 15:51:51',0),(20190912133947,'ForeignKeyCamps','2021-06-18 15:51:51','2021-06-18 15:51:53',0),(20190923101044,'ForeignKeysUsers','2021-06-18 15:51:53','2021-06-18 15:51:54',0),(20190923105735,'ForeignKeysLanguage','2021-06-18 15:51:54','2021-06-18 15:51:55',0),(20190923140058,'ForeignKeyLocations','2021-06-18 15:51:55','2021-06-18 15:51:55',0),(20190924152152,'UsersCreatedModified','2021-06-18 15:51:56','2021-06-18 15:51:58',0),(20190925105800,'ForeignKeyLaundryTables','2021-06-18 15:51:58','2021-06-18 15:51:59',0),(20190925135319,'ForeignKeysLibraryTables','2021-06-18 15:51:59','2021-06-18 15:52:00',0),(20190927155724,'ForeignKeyBorrowTables','2021-06-18 15:52:00','2021-06-18 15:52:01',0),(20190930225021,'ForeignKeyQr','2021-06-18 15:52:01','2021-06-18 15:52:02',0),(20191001093637,'ForeignKeyPeopleId','2021-06-18 15:52:02','2021-06-18 15:52:03',0),(20191001141152,'ForeignKeySizes','2021-06-18 15:52:03','2021-06-18 15:52:04',0),(20191001145902,'ForeignKeyProduct','2021-06-18 15:52:04','2021-06-18 15:52:05',0),(20191005183100,'ForeignKeyRemainder','2021-06-18 15:52:05','2021-06-18 15:52:06',0),(20191005183200,'ForeignKeyCmsFunctions','2021-06-18 15:52:06','2021-06-18 15:52:06',0),(20191013180000,'ItemsOutNullable','2021-06-18 15:52:06','2021-06-18 15:52:07',0),(20191019131459,'ChangeCrossReferenceDeleteRuleToCascade','2021-06-18 15:52:07','2021-06-18 15:52:07',0),(20191019134931,'ChangeFkInProductsToCamps','2021-06-18 15:52:07','2021-06-18 15:52:08',0),(20191019135153,'ChangeFkInSizesToSizegroup','2021-06-18 15:52:08','2021-06-18 15:52:08',0),(20191021155925,'AddFkForLocationInStockTable','2021-06-18 15:52:08','2021-06-18 15:52:09',0),(20191023152307,'ChangeCollationAndEncodingToUtf8','2021-06-18 15:52:09','2021-06-18 15:52:11',0),(20191024152307,'AddMissingFKs','2021-06-18 15:52:11','2021-06-18 15:52:13',0),(20191027225630,'AddDeletedColumnToLocations','2021-06-18 15:52:13','2021-06-18 15:52:13',0),(20191028074813,'AddLegacyColumnToQrTable','2021-06-18 15:52:13','2021-06-18 15:52:13',0),(20191105181657,'AddUniqueConstraintStockBoxid','2021-06-18 15:52:13','2021-06-18 15:52:14',0),(20191105181704,'AddUniqueConstraintQrCodeLegacy','2021-06-18 15:52:14','2021-06-18 15:52:14',0),(20191202131340,'AdultAgeInCampsTableNotNull','2021-06-18 15:52:14','2021-06-18 15:52:14',0),(20191202135024,'UserIdInTransactionsNullable','2021-06-18 15:52:14','2021-06-18 15:52:15',0),(20191211131857,'MakePeopleIdInTransactionTableNullable','2021-06-18 15:52:15','2021-06-18 15:52:15',0),(20200202170149,'SetVisibleDefaultToOneInLocationsTable','2021-06-18 15:52:15','2021-06-18 15:52:15',0),(20200203194629,'MakeUserIdNullableInHistoryTable','2021-06-18 15:52:16','2021-06-18 15:52:16',0),(20200206100256,'AddIsScrapFlagToLocationsTable','2021-06-18 15:52:16','2021-06-18 15:52:16',0),(20200313200406,'RemoveNeededItems','2021-06-18 15:52:16','2021-06-18 15:52:17',0),(20200608185725,'AddBoxState','2021-06-18 15:52:17','2021-06-18 15:52:19',0),(20200706220401,'DropOrganisationIdFromCmsUsers','2021-06-18 15:52:19','2021-06-18 15:52:19',0),(20200706225754,'AddCompositeUniqueIndexForCrossReferenceTables','2021-06-18 15:52:19','2021-06-18 15:52:20',0),(20200824171337,'AddTagTable','2021-06-18 15:52:20','2021-06-18 15:52:20',0),(20200824185532,'CreatePeopleTagCrossReference','2021-06-18 15:52:21','2021-06-18 15:52:21',0),(20200923172713,'AddTagDescription','2021-06-18 15:52:21','2021-06-18 15:52:21',0),(20201213100955,'UpdateDeleteConstraintForTags','2021-06-18 15:52:21','2021-06-18 15:52:22',0),(20210130175622,'AddSettingsForBases','2021-06-18 15:52:22','2021-06-18 15:52:22',0),(20210314130614,'UniqueConstraintQrIdInStockTable','2021-06-18 15:52:22','2021-06-18 15:52:23',0),(20210822075141,'MakeBoxStateIdUnsigned','2021-08-23 07:33:09','2021-08-23 07:33:11',0),(20210823063551,'MakeCmsFunctionsIdUnsigned','2021-08-23 07:33:11','2021-08-23 07:33:14',0),(20210823064211,'MakeCmsUsersIdUnsigned','2021-08-23 07:33:14','2021-08-23 07:33:33',0),(20210823064828,'MakeGenderIdUnsigned','2021-08-23 07:33:33','2021-08-23 07:33:34',0),(20210823065128,'MakeLocationIdUnsigned','2021-08-23 07:33:34','2021-08-23 07:33:36',0),(20210823065359,'MakePeopleIdUnsigned','2021-08-23 07:33:36','2021-08-23 07:33:42',0),(20210823065917,'MakeProductIdUnsigned','2021-08-23 07:33:42','2021-08-23 07:33:45',0),(20210823070205,'MakeSizeIdUnsigned','2021-08-23 07:33:45','2021-08-23 07:33:47',0),(20210823070448,'MakeTagIdUnsigned','2021-08-23 07:33:47','2021-08-23 07:33:48',0),(20210823070632,'MakeTransactionIdUnsigned','2021-08-23 07:33:48','2021-08-23 07:33:49',0),(20220205073523,'AddActionPermissionsToCmsFunctions','2022-04-23 14:10:32','2022-04-23 14:10:33',0),(20220205084503,'AddCmsUserGroupsRoles','2022-04-23 14:10:33','2022-04-23 14:10:33',0),(20220513080431,'AddTypeToTags','2022-06-09 13:30:56','2022-06-09 13:30:57',0),(20220513124241,'AlterPeopleTagsToTagsRelations','2022-06-09 13:30:57','2022-06-09 13:30:58',0),(20220515130043,'RenamePeopleIdtoObjectIdinTagsRelations','2022-06-09 13:30:58','2022-06-09 13:30:58',0),(20220515130202,'AddObjectTypeInTagsRelations','2022-06-09 13:30:58','2022-06-09 13:30:59',0),(20220602091709,'AddSeqToTags','2022-06-09 13:30:59','2022-06-09 13:30:59',0),(20220604164558,'MakeCommentFieldsNullable','2022-06-09 14:29:13','2022-06-09 14:29:14',0),(20220604165328,'RemoveUnderscoreColumns','2022-06-09 14:29:14','2022-06-09 14:29:15',0),(20220604182719,'MakeItemsInStockNullable','2022-06-09 14:29:15','2022-06-09 14:29:15',0),(20220604184037,'MakeLabelFieldsNotNullable','2022-06-09 14:29:15','2022-06-09 14:29:17',0),(20220604185546,'RemovePortionColumnInSizes','2022-06-09 14:29:17','2022-06-09 14:29:17',0),(20220605061343,'DropProductCategoryIdForeignKey','2022-06-17 10:30:50','2022-06-17 10:30:51',0),(20220605064416,'MakeProductCategoryIdNotNullable','2022-06-17 10:30:51','2022-06-17 10:30:52',0),(20220605064603,'AddProductCategoryIdForeignKey','2022-06-17 10:30:52','2022-06-17 10:30:52',0),(20220605074604,'DropProductSizegroupIdForeignKey','2022-06-17 10:30:53','2022-06-17 10:30:53',0),(20220605074623,'MakeProductSizegroupIdNotNullable','2022-06-17 10:30:53','2022-06-17 10:30:54',0),(20220605074638,'AddProductSizegroupIdForeignKey','2022-06-17 10:30:54','2022-06-17 10:30:54',0),(20220605075347,'DropProductCampIdForeignKey','2022-06-17 10:30:55','2022-06-17 10:30:55',0),(20220605075402,'MakeProductCampIdNotNullable','2022-06-17 10:30:55','2022-06-17 10:30:56',0),(20220605075413,'AddProductCampIdForeignKey','2022-06-17 10:30:56','2022-06-17 10:30:56',0),(20220605081726,'DropProductAmountneededColumn','2022-06-17 10:30:56','2022-06-17 10:30:57',0),(20220605084444,'CreateComposteIndexOnHistoryTable','2022-06-09 14:00:12','2022-06-09 14:00:12',0),(20220701094045,'AddTransferAgreementTable','2022-07-05 10:38:40','2022-07-05 10:38:41',0),(20220701094049,'AddTransferAgreementDetailTable','2022-07-05 10:38:41','2022-07-05 10:38:41',0),(20220701094148,'AddShipmentTable','2022-07-05 10:38:41','2022-07-05 10:38:42',0),(20220701094153,'AddShipmentDetailTable','2022-07-05 10:38:42','2022-07-05 10:38:43',0),(20220722085453,'DirstroEventsTable','2022-07-24 11:37:51','2022-07-24 11:37:52',0),(20220723052618,'DirstroEventsPackingListEntries','2022-07-24 11:37:52','2022-07-24 11:37:52',0),(20220723060012,'DirstroEventsUnboxedItemCollections','2022-07-24 11:37:53','2022-07-24 11:37:53',0),(20220723061731,'DirstroEventsOutflowLogs','2022-07-24 11:37:53','2022-07-24 11:37:54',0),(20220723063203,'AddDistroEventsColumnsToLocations','2022-07-24 11:37:54','2022-07-24 11:37:55',0),(20220723064611,'AddDistroEventsToStock','2022-07-24 11:37:55','2022-07-24 11:37:56',0),(20220822172951,'DistroEventsTrackingGroups','2022-08-23 17:12:57','2022-08-23 17:12:58',0),(20220822175013,'AddDistroEventTrackingGroupIdColumn','2022-08-23 17:12:58','2022-08-23 17:12:59',0),(20220822182632,'DropDistroEventIdForeignKey','2022-08-23 17:12:59','2022-08-23 17:13:00',0),(20220822183629,'AddFlowDirection','2022-08-23 17:13:00','2022-08-23 17:13:01',0),(20220822191744,'RenameDistroEventsOutflowLogs','2022-08-23 17:13:01','2022-08-23 17:13:02',0),(20220822191943,'AddDistroEventTrackingGroupIdForeignKey','2022-08-23 17:13:02','2022-08-23 17:13:02',0),
(20221221201716,'UpdateBoxStateOfLocations','2022-12-21 21:11:34','2022-12-21 21:11:34',0),
(20221221210240,'UpdateBoxStateOfStock','2022-12-21 21:11:34','2022-12-21 21:11:35',0),
(20230221185417,'AddReceivedOnAsShipmentState','2023-02-27 13:55:05','2023-02-27 13:55:06',0),
(20230323160748,'RemoveWarehouseOrdering','2023-03-23 17:28:53','2023-03-23 17:28:55',0),
(20230323164349,'RenameOrderedBoxStates','2023-03-23 17:28:55','2023-03-23 17:28:55',0),
(20230413110314,'AddRemovedLostReceivedShipmentDetailFields','2023-04-16 16:34:58','2023-04-16 16:34:59',0),
(20230415130947,'RenameReceivingBoxState','2023-04-16 16:34:59','2023-04-16 16:35:00',0),
(20230416102309,'FixPrimaryKeyOfTagsRelations','2023-04-16 16:38:04','2023-04-16 16:38:04',0),
(20230416144646,'AddSizeToShipmentDetail','2023-04-16 16:42:11','2023-04-16 16:42:12',0),
(20230416160636,'RenameDeletedOnInShipmentDetails','2023-04-16 16:42:12','2023-04-16 16:42:12',0),
(20230416162125,'RemoveDefaultFromSourceSizeIdOnShipmentDetails','2023-04-16 16:42:12','2023-04-16 16:42:12',0),
(20230602123900,'AddInTransitBoxState','2023-06-17 10:39:25','2023-06-17 10:39:25',0),
(20230620124521,'AddQuantityToShipmentDetail','2023-06-23 06:51:34','2023-06-23 06:51:35',0),
(20230622123713,'AddNotDeliveredBoxState','2023-06-29 19:51:53','2023-06-29 19:51:54',0),
(20240207152627,'ResetChangedBoxLabelIdentifiers','2024-02-21 19:51:24','2024-02-21 19:51:24',0),
(20240422160431,'AddStandardProductTable','2024-05-27 12:39:04','2024-05-27 12:39:05',0),
(20240422163115,'AddStandardProductFk','2024-05-27 12:39:05','2024-05-27 12:39:06',0),
  (20240523182223,'PopulateStandardProductsTable','2024-05-27 13:01:16','2024-05-27 13:01:16',0),
  (20240624155306,'DeleteDuplicateBoxDeletions','2024-07-13 22:49:45','2024-07-13 22:49:45',0),
  (20240701112808,'UpdateSmlSizegroup','2024-07-01 10:22:44','2024-07-01 10:22:44',0),
  (20240814154516,'AddTemporalColumnsToTagsRelations','2024-09-12 07:48:21','2024-09-12 07:48:22',0),
  (20240827120508,'CleanHistoryTransactions','2024-09-09 07:48:21','2024-09-09 07:48:22',0),
  (20240913171707,'AddMassVolumeSizegroups','2024-09-30 12:34:56','2024-09-30 12:34:57',0),
  (20240913172526,'UpdateUnitsTable','2024-09-30 12:35:56','2024-09-30 12:35:57',0),
  (20240913175631,'AddUnitValueToStock','2024-09-30 12:36:56','2024-09-30 12:36:57',0);
/*!40000 ALTER TABLE `phinxlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `seq` int(11) NOT NULL DEFAULT '0',
  `parent_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES
  (1,'Underwear / Nightwear',11,12),
  (2,'Bottoms',12,12),
  (3,'Tops',13,12),
  (4,'Accessories',14,12),
  (5,'Shoes',15,12),
  (6,'Jackets / Outerwear',16,12),
  (7,'Skirts/Dresses',17,12),
  (8,'Baby',18,12),
  (9,'Other',6,NULL),
  (10,'Hygiene',2,NULL),
  (11,'Food & Kitchen',3,NULL),
  (12,'Clothing',1,NULL),
  (13,'Equipment',4,NULL),
  (14,'Toys & Games',41,13),
  (15,'Medication',5,9),
  (18,'Books & Stationery',42,13),
  (19,'Water',43,NULL),
  (20,'Shelter',44,NULL);
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category_id` int(11) unsigned NOT NULL,
  `gender_id` int(11) unsigned NOT NULL,
  `sizegroup_id` int(11) unsigned NOT NULL,
  `camp_id` int(11) unsigned NOT NULL,
  `value` int(11) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `maxperadult` int(11) DEFAULT NULL,
  `maxperchild` int(11) DEFAULT NULL,
  `stockincontainer` tinyint(4) NOT NULL DEFAULT '0',
  `comments` varchar(255) DEFAULT NULL,
  `deleted` datetime DEFAULT NULL,
  `standard_product_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `sizegroup_id` (`sizegroup_id`),
  KEY `camp_id` (`camp_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `gender_id` (`gender_id`),
  CONSTRAINT `products_ibfk_10` FOREIGN KEY (`gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_11` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_12` FOREIGN KEY (`sizegroup_id`) REFERENCES `sizegroup` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_13` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_14` FOREIGN KEY (`standard_product_id`) REFERENCES `standard_product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_8` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `products_ibfk_9` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1166 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES
  (1158,'Jeans',2,1,5,100000000,50,'2019-09-05 13:54:40',1,NULL,NULL,0,0,1,'',NULL,NULL),
  (1159,'T-Shirts',3,2,1,100000000,30,'2019-09-05 13:55:10',1,NULL,NULL,0,0,1,'',NULL,NULL),
  (1160,'Trainers',5,6,9,100000000,100,'2019-09-05 13:55:49',1,NULL,NULL,0,0,1,'',NULL,NULL),
  (1161,'Sleeping Bag',9,3,7,100000000,100,'2019-09-05 13:56:23',1,NULL,NULL,0,0,0,'',NULL,NULL),
  (1162,'Diapers',8,9,12,100000000,0,'2019-09-05 13:56:46',1,NULL,NULL,0,0,0,'',NULL,NULL),
  (1163,'Shampoo (100ml)',10,10,7,100000000,20,'2019-09-05 13:57:31',1,NULL,NULL,0,0,1,'',NULL,NULL),
  (1164,'Rice (1kg)',11,10,7,100000000,25,'2019-09-05 13:57:59',1,NULL,NULL,0,0,1,'',NULL,NULL),
  (1165,'DummyProduct',2,1,5,100000001,50,'2019-09-05 13:54:40',1,NULL,NULL,0,0,1,'',NULL,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qr`
--

DROP TABLE IF EXISTS `qr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qr` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `legacy` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_legacy_unique` (`code`,`legacy`)
) ENGINE=InnoDB AUTO_INCREMENT=100005943 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qr`
--

LOCK TABLES `qr` WRITE;
/*!40000 ALTER TABLE `qr` DISABLE KEYS */;
INSERT INTO `qr` VALUES
  (100000000,'093f65e080a295f8076b1c5722a46aa2',NULL,0),
  (100000001,'44f683a84163b3523afe57c2e008bc8c',NULL,0),
  (100000002,'5a5ea04157ce4d020f65c3dd950f4fa3',NULL,0),
  (100000003,'5c829d1bf278615670dceeb9b3919ed2',NULL,0),
  (100000004,'4b382363fa161c111fa9ad2b335ceacd',NULL,0),
  (100000005,'b1cf83ae73adfce0d14dbe81b53cb96b',NULL,0);
/*!40000 ALTER TABLE `qr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment`
--

DROP TABLE IF EXISTS `shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shipment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_base_id` int(11) unsigned NOT NULL,
  `target_base_id` int(11) unsigned NOT NULL,
  `transfer_agreement_id` int(11) unsigned NOT NULL,
  `state` varchar(255) NOT NULL DEFAULT 'Preparing',
  `started_on` datetime NOT NULL,
  `started_by_id` int(11) unsigned NOT NULL,
  `canceled_on` datetime DEFAULT NULL,
  `canceled_by_id` int(11) unsigned DEFAULT NULL,
  `sent_on` datetime DEFAULT NULL,
  `sent_by_id` int(11) unsigned DEFAULT NULL,
  `receiving_started_on` datetime DEFAULT NULL,
  `receiving_started_by_id` int unsigned DEFAULT NULL,
  `completed_on` datetime DEFAULT NULL,
  `completed_by_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shipment_source_base_id` (`source_base_id`),
  KEY `shipment_target_base_id` (`target_base_id`),
  KEY `shipment_transfer_agreement_id` (`transfer_agreement_id`),
  KEY `shipment_started_by_id` (`started_by_id`),
  KEY `shipment_canceled_by_id` (`canceled_by_id`),
  KEY `shipment_sent_by_id` (`sent_by_id`),
  KEY `shipment_completed_by_id` (`completed_by_id`),
  KEY `shipment_receiving_started_by_id` (`receiving_started_by_id`),
  CONSTRAINT `shipment_ibfk_1` FOREIGN KEY (`source_base_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_2` FOREIGN KEY (`target_base_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_3` FOREIGN KEY (`transfer_agreement_id`) REFERENCES `transfer_agreement` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_4` FOREIGN KEY (`started_by_id`) REFERENCES `cms_users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_5` FOREIGN KEY (`canceled_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_6` FOREIGN KEY (`sent_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_7` FOREIGN KEY (`completed_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipment_ibfk_8` FOREIGN KEY (`receiving_started_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment`
--

LOCK TABLES `shipment` WRITE;
/*!40000 ALTER TABLE `shipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipment_detail`
--

DROP TABLE IF EXISTS `shipment_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shipment_detail` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `shipment_id` int(11) unsigned NOT NULL,
  `box_id` int(11) unsigned NOT NULL,
  `source_product_id` int(11) unsigned NOT NULL,
  `target_product_id` int(11) unsigned DEFAULT NULL,
  `source_quantity` int(11),
  `target_quantity` int(11) DEFAULT NULL,
  `source_size_id` int(11) unsigned DEFAULT NULL,
  `target_size_id` int(11) unsigned DEFAULT NULL,
  `source_location_id` int(11) unsigned NOT NULL,
  `target_location_id` int(11) unsigned DEFAULT NULL,
  `created_on` datetime NOT NULL,
  `created_by_id` int(11) unsigned NOT NULL,
  `lost_on` datetime DEFAULT NULL,
  `lost_by_id` int(11) unsigned DEFAULT NULL,
  `received_on` datetime DEFAULT NULL,
  `received_by_id` int(11) unsigned DEFAULT NULL,
  `removed_on` datetime DEFAULT NULL,
  `removed_by_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `shipment_detail_shipment_id` (`shipment_id`),
  KEY `shipment_detail_box_id` (`box_id`),
  KEY `shipment_detail_source_product_id` (`source_product_id`),
  KEY `shipment_detail_target_product_id` (`target_product_id`),
  KEY `shipment_detail_source_location_id` (`source_location_id`),
  KEY `shipment_detail_target_location_id` (`target_location_id`),
  KEY `shipment_detail_created_by_id` (`created_by_id`),
  KEY `shipment_detail_deleted_by_id` (`removed_by_id`),
  KEY `lost_by_id` (`lost_by_id`),
  KEY `received_by_id` (`received_by_id`),
  KEY `source_size_id` (`source_size_id`),
  KEY `target_size_id` (`target_size_id`),
  CONSTRAINT `shipment_detail_ibfk_1` FOREIGN KEY (`shipment_id`) REFERENCES `shipment` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_10` FOREIGN KEY (`received_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_11` FOREIGN KEY (`source_size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_12` FOREIGN KEY (`target_size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_2` FOREIGN KEY (`box_id`) REFERENCES `stock` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_3` FOREIGN KEY (`source_product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_4` FOREIGN KEY (`target_product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_5` FOREIGN KEY (`source_location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_6` FOREIGN KEY (`target_location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_7` FOREIGN KEY (`created_by_id`) REFERENCES `cms_users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_8` FOREIGN KEY (`removed_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `shipment_detail_ibfk_9` FOREIGN KEY (`lost_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipment_detail`
--

LOCK TABLES `shipment_detail` WRITE;
/*!40000 ALTER TABLE `shipment_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipment_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizegroup`
--

DROP TABLE IF EXISTS `sizegroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizegroup` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `seq` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizegroup`
--

LOCK TABLES `sizegroup` WRITE;
/*!40000 ALTER TABLE `sizegroup` DISABLE KEYS */;
INSERT INTO `sizegroup` VALUES
(1,'XS, S, M, L, XL, XXL',1),
(2,'Baby by month (0-6, 7-12, 13-18, 19-24)',18),
(3,'Shoe sizes Female',40),
(4,'Children by year (2-3, 4-5, 6-8, 9-12, 13-15)',9),
(5,'S, M, L',2),
(6,'Mixed sizes',31),
(7,'One size',30),
(8,'Shoe sizes Male',50),
(9,'Shoe sizes children',60),
(12,'Diaper sizes',70),
(13,'Bra sizes',75),
(16,'Pack of 5-20, Pack of 21+, Bulk (100+)',80),
(17,'Children by year (2-5, 6-10, 11-15)',10),
(18,'Children by year (6-10, 11-15)',101),
(19,'Singlepack, Multipack',81),
(20,'Children by month (2-5)',100),
(21,'Baby by month (0-2, 3-6, 7-12, 13-18, 19-24)',19),
(22,'Baby by month (0-6, 7-24)',20),
(23,'Children by year (2-3, 4-5, 6-7, 8-9, 10-11, 12-13, 14-15)',11),(24,'Children by year (individual years)',12),
(25,'Children by year (0-2, 2-4, 5-7, 8-10, 11-13, 14-17)', 13),
(26,'All shoe sizes (<23-48)',61),
(27,'Sock sizes',62),
(28,'Mass',3),
(29,'Volume',4);
/*!40000 ALTER TABLE `sizegroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sizes`
--

DROP TABLE IF EXISTS `sizes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sizes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL,
  `sizegroup_id` int(11) unsigned DEFAULT NULL,
  `seq` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sizegroup_id` (`sizegroup_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `sizes_ibfk_4` FOREIGN KEY (`sizegroup_id`) REFERENCES `sizegroup` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `sizes_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sizes_ibfk_6` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=164 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sizes`
--

LOCK TABLES `sizes` WRITE;
/*!40000 ALTER TABLE `sizes` DISABLE KEYS */;
INSERT INTO `sizes` VALUES
(1,'S',1,1,NULL,NULL,NULL,NULL),
(2,'M',1,2,NULL,NULL,NULL,NULL),
(3,'L',1,3,NULL,NULL,NULL,NULL),
(4,'XL',1,4,NULL,NULL,NULL,NULL),
(5,'XS',1,5,NULL,NULL,NULL,NULL),
(10,'2-3 years',4,200,NULL,NULL,NULL,NULL),
(11,'4-5 years',4,201,NULL,NULL,NULL,NULL),
(12,'6-8 years',4,202,NULL,NULL,NULL,NULL),
(13,'9-12 years',4,203,NULL,NULL,NULL,NULL),
(14,'20',9,103,NULL,NULL,NULL,NULL),
(15,'21',9,104,NULL,NULL,NULL,NULL),
(16,'22',9,105,NULL,NULL,NULL,NULL),
(17,'23',9,106,NULL,NULL,NULL,NULL),
(18,'24',9,107,NULL,NULL,NULL,NULL),
(19,'25',9,108,NULL,NULL,NULL,NULL),
(20,'26',9,109,NULL,NULL,NULL,NULL),
(21,'27',9,110,NULL,NULL,NULL,NULL),
(22,'28',9,111,NULL,NULL,NULL,NULL),
(23,'29',9,112,NULL,NULL,NULL,NULL),
(24,'30',9,113,NULL,NULL,NULL,NULL),
(25,'31',9,114,NULL,NULL,NULL,NULL),
(26,'32',9,115,NULL,NULL,NULL,NULL),
(27,'33',9,116,NULL,NULL,NULL,NULL),
(28,'34',3,60,NULL,NULL,NULL,NULL),
(29,'35',3,61,NULL,NULL,NULL,NULL),
(30,'36',3,62,NULL,NULL,NULL,NULL),
(31,'37',3,63,NULL,NULL,NULL,NULL),
(32,'38',3,64,NULL,NULL,NULL,NULL),
(33,'39',3,65,NULL,NULL,NULL,NULL),
(34,'40',3,66,NULL,NULL,NULL,NULL),
(35,'41',3,67,NULL,NULL,NULL,NULL),
(36,'42 and bigger',3,68,NULL,NULL,NULL,NULL),
(43,'13-15 years',4,204,NULL,NULL,NULL,NULL),
(44,'19-24 months',21,214,NULL,NULL,NULL,NULL),
(45,'3-6 months',21,211,NULL,NULL,NULL,NULL),
(47,'7-12 months',21,212,NULL,NULL,NULL,NULL),
(48,'13-18 months',21,213,NULL,NULL,NULL,NULL),
(51,'19',9,102,NULL,NULL,NULL,NULL),
(52,'Mixed',6,200,NULL,NULL,NULL,NULL),
(53,'S',5,50,NULL,NULL,NULL,NULL),
(54,'M',5,51,NULL,NULL,NULL,NULL),
(55,'L',5,52,NULL,NULL,NULL,NULL),
(56,'38 and smaller',8,80,NULL,NULL,NULL,NULL),
(57,'39',8,81,NULL,NULL,NULL,NULL),
(58,'40',8,82,NULL,NULL,NULL,NULL),
(59,'41',8,83,NULL,NULL,NULL,NULL),
(60,'42',8,84,NULL,NULL,NULL,NULL),
(61,'43',8,85,NULL,NULL,NULL,NULL),
(62,'44',8,86,NULL,NULL,NULL,NULL),
(63,'45',8,87,NULL,NULL,NULL,NULL),
(64,'46 and bigger',8,88,NULL,NULL,NULL,NULL),
(65,'35',9,118,NULL,NULL,NULL,NULL),
(66,'36 and bigger',9,119,NULL,NULL,NULL,NULL),
(67,'34',9,117,NULL,NULL,NULL,NULL),
(68,'One size',7,300,NULL,NULL,NULL,NULL),
(69,'0-2 months',21,210,NULL,NULL,NULL,NULL),
(70,'Mixed',5,53,NULL,NULL,NULL,NULL),
(71,'Mixed',1,6,NULL,NULL,NULL,NULL),
(97,'All ages',21,216,NULL,NULL,NULL,NULL),
(103,'All ages',4,205,NULL,NULL,NULL,NULL),
(104,'Pack of 5-20',16,150,NULL,NULL,NULL,NULL),
(105,'Pack of 21+',16,151,NULL,NULL,NULL,NULL),
(106,'Bulk (100+)',16,152,NULL,NULL,NULL,NULL),
(108,'Newborn (< 4 kg)',12,130,NULL,NULL,NULL,NULL),
(109,'Size 1 (3-6 kg)',12,131,NULL,NULL,NULL,NULL),
(110,'Size 2 (5-8 kg)',12,132,NULL,NULL,NULL,NULL),
(111,'Size 3 (7-13 kg)',12,133,NULL,NULL,NULL,NULL),
(112,'Size 4 (9-17 kg)',12,134,NULL,NULL,NULL,NULL),
(113,'Size 5 (>12 kg)',12,135,NULL,NULL,NULL,NULL),
(114,'Size 6 (>16 kg)',12,136,NULL,NULL,NULL,NULL),
(115,'Kids (>19 kg)',12,137,NULL,NULL,NULL,NULL),
(116,'2-5 years',17,10,NULL,NULL,NULL,NULL),
(117,'6-10 years',17,11,NULL,NULL,NULL,NULL),
(118,'11-15 years',17,12,NULL,NULL,NULL,NULL),
(119,'0-6 months',2,40,NULL,NULL,NULL,NULL),
(120,'7-12 months',2,41,NULL,NULL,NULL,NULL),
(121,'13-18 months',2,42,NULL,NULL,NULL,NULL),
(122,'19-24 months',2,43,NULL,NULL,NULL,NULL),
(123,'All ages',2,44,NULL,NULL,NULL,NULL),
(124,'6-10 years',18,20,NULL,NULL,NULL,NULL),
(125,'11-15 years',18,21,NULL,NULL,NULL,NULL),
(126,'Singlepack',19,160,NULL,NULL,NULL,NULL),
(127,'Multipack',19,161,NULL,NULL,NULL,NULL),
(128,'17',9,100,NULL,NULL,NULL,NULL),
(129,'18',9,101,NULL,NULL,NULL,NULL),
(130,'2-5 years',20,30,NULL,NULL,NULL,NULL),
(131,'75B',13,170,NULL,NULL,NULL,NULL),
(132,'80B',13,171,NULL,NULL,NULL,NULL),
(133,'85B',13,172,NULL,NULL,NULL,NULL),
(134,'90b',13,173,NULL,NULL,NULL,NULL),
(135,'95B',13,174,NULL,NULL,NULL,NULL),
(136,'100C',13,175,NULL,NULL,NULL,NULL),
(137,'D+ (big)',13,176,NULL,NULL,NULL,NULL),
(138,'0-6 months',22,180,NULL,NULL,NULL,NULL),
(139,'7-24 months',22,181,NULL,NULL,NULL,NULL),
(140,'All ages',4,182,NULL,NULL,NULL,NULL),
(141,'2-3 years',23,200,NULL,NULL,NULL,NULL),
(142,'4-5 years',23,201,NULL,NULL,NULL,NULL),
(143,'6-7 years',23,202,NULL,NULL,NULL,NULL),
(144,'8-9 years',23,203,NULL,NULL,NULL,NULL),
(145,'10-11 years',23,201,NULL,NULL,NULL,NULL),
(146,'12-13 years',23,202,NULL,NULL,NULL,NULL),
(147,'14-15 years',23,203,NULL,NULL,NULL,NULL),
(148,'All ages',23,204,NULL,NULL,NULL,NULL),
(149,'2 years',24,210,NULL,NULL,NULL,NULL),
(150,'3 years',24,211,NULL,NULL,NULL,NULL),
(151,'4 years',24,212,NULL,NULL,NULL,NULL),
(152,'5 years',24,213,NULL,NULL,NULL,NULL),
(153,'6 years',24,214,NULL,NULL,NULL,NULL),
(154,'7 years',24,215,NULL,NULL,NULL,NULL),
(155,'8 years',24,216,NULL,NULL,NULL,NULL),
(156,'9 years',24,217,NULL,NULL,NULL,NULL),
(157,'10 years',24,218,NULL,NULL,NULL,NULL),
(158,'11 years',24,219,NULL,NULL,NULL,NULL),
(159,'12 years',24,220,NULL,NULL,NULL,NULL),
(160,'13 years',24,221,NULL,NULL,NULL,NULL),
(161,'14 years',24,222,NULL,NULL,NULL,NULL),
(162,'15 years',24,223,NULL,NULL,NULL,NULL),
(163,'All ages',24,234,NULL,NULL,NULL,NULL),
(164,'0-2 years',25,240,NULL,NULL,NULL,NULL),
(165,'2-4 years',25,241,NULL,NULL,NULL,NULL),
(166,'5-7 years',25,242,NULL,NULL,NULL,NULL),
(167,'8-10 years',25,243,NULL,NULL,NULL,NULL),
(168,'11-13 years',25,244,NULL,NULL,NULL,NULL),
(169,'14-17 years',25,245,NULL,NULL,NULL,NULL),
(170,'<23',26,250,NULL,NULL,NULL,NULL),
(171,'24',26,251,NULL,NULL,NULL,NULL),
(172,'25',26,252,NULL,NULL,NULL,NULL),
(173,'26',26,253,NULL,NULL,NULL,NULL),
(174,'27',26,254,NULL,NULL,NULL,NULL),
(175,'28',26,255,NULL,NULL,NULL,NULL),
(176,'29',26,256,NULL,NULL,NULL,NULL),
(177,'30',26,257,NULL,NULL,NULL,NULL),
(178,'31',26,258,NULL,NULL,NULL,NULL),
(179,'32',26,259,NULL,NULL,NULL,NULL),
(180,'33',26,260,NULL,NULL,NULL,NULL),
(181,'34',26,261,NULL,NULL,NULL,NULL),
(182,'35',26,262,NULL,NULL,NULL,NULL),
(183,'36',26,263,NULL,NULL,NULL,NULL),
(184,'37',26,264,NULL,NULL,NULL,NULL),
(185,'38',26,265,NULL,NULL,NULL,NULL),
(186,'39',26,266,NULL,NULL,NULL,NULL),
(187,'40',26,267,NULL,NULL,NULL,NULL),
(188,'41',26,268,NULL,NULL,NULL,NULL),
(189,'42',26,269,NULL,NULL,NULL,NULL),
(190,'43',26,270,NULL,NULL,NULL,NULL),
(191,'44',26,271,NULL,NULL,NULL,NULL),
(192,'45',26,272,NULL,NULL,NULL,NULL),
(193,'46',26,273,NULL,NULL,NULL,NULL),
(194,'47',26,274,NULL,NULL,NULL,NULL),
(195,'48',26,275,NULL,NULL,NULL,NULL),
(196,'19-22',27,276,NULL,NULL,NULL,NULL),
(197,'23-26',27,277,NULL,NULL,NULL,NULL),
(198,'27-30',27,278,NULL,NULL,NULL,NULL),
(199,'31-34',27,279,NULL,NULL,NULL,NULL),
(200,'35-38',27,280,NULL,NULL,NULL,NULL),
(201,'39-42',27,281,NULL,NULL,NULL,NULL),
(202,'43-46',27,282,NULL,NULL,NULL,NULL),
(203,'XXL',1,7,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `sizes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standard_product`
--

DROP TABLE IF EXISTS `standard_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `standard_product` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category_id` int unsigned NOT NULL,
  `gender_id` int unsigned NOT NULL,
  `size_range_id` int unsigned NOT NULL,
  `version` int NOT NULL,
  `added_on` datetime NOT NULL,
  `added_by` int unsigned DEFAULT NULL,
  `deprecated_on` datetime DEFAULT NULL,
  `deprecated_by` int unsigned DEFAULT NULL,
  `preceded_by_product_id` int unsigned DEFAULT NULL,
  `superceded_by_product_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `standard_product_category_id` (`category_id`),
  KEY `standard_product_gender_id` (`gender_id`),
  KEY `standard_product_size_range_id` (`size_range_id`),
  KEY `standard_product_added_by` (`added_by`),
  KEY `standard_product_deprecated_by` (`deprecated_by`),
  KEY `standard_product_preceded_by_product_id` (`preceded_by_product_id`),
  KEY `standard_product_superceded_by_product_id` (`superceded_by_product_id`),
  CONSTRAINT `standard_product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_2` FOREIGN KEY (`gender_id`) REFERENCES `genders` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_3` FOREIGN KEY (`size_range_id`) REFERENCES `sizegroup` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_4` FOREIGN KEY (`added_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_5` FOREIGN KEY (`deprecated_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_6` FOREIGN KEY (`preceded_by_product_id`) REFERENCES `standard_product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `standard_product_ibfk_7` FOREIGN KEY (`superceded_by_product_id`) REFERENCES `standard_product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standard_product`
--

LOCK TABLES `standard_product` WRITE;
/*!40000 ALTER TABLE `standard_product` DISABLE KEYS */;
INSERT INTO `standard_product`
(id,gender_id,name,size_range_id,category_id,version,added_by,added_on)
VALUES
(1,9,"Baby Bibs",6,8,1,1,UTC_TIMESTAMP()),
(2,9,"Baby Blankets",6,8,1,1,UTC_TIMESTAMP()),
(3,5,"Joggers",18,2,1,1,UTC_TIMESTAMP()),
(4,5,"Leggings",18,1,1,1,UTC_TIMESTAMP()),
(5,5,"Shorts",18,2,1,1,UTC_TIMESTAMP()),
(6,5,"Trousers",18,2,1,1,UTC_TIMESTAMP()),
(7,1,"Joggers",1,2,1,1,UTC_TIMESTAMP()),
(8,1,"Shorts",1,2,1,1,UTC_TIMESTAMP()),
(9,1,"Trousers",1,2,1,1,UTC_TIMESTAMP()),
(10,4,"Joggers",18,2,1,1,UTC_TIMESTAMP()),
(11,4,"Leggings",18,1,1,1,UTC_TIMESTAMP()),
(12,4,"Shorts",18,2,1,1,UTC_TIMESTAMP()),
(13,2,"Joggers",1,2,1,1,UTC_TIMESTAMP()),
(14,2,"Shorts",1,2,1,1,UTC_TIMESTAMP()),
(15,2,"Trousers",1,2,1,1,UTC_TIMESTAMP()),
(16,9,"Baby Trousers",21,2,1,1,UTC_TIMESTAMP()),
(17,5,"Summer Hats",6,12,1,1,UTC_TIMESTAMP()),
(18,5,"Winter Hats",6,12,1,1,UTC_TIMESTAMP()),
(19,1,"Abayas",6,12,1,1,UTC_TIMESTAMP()),
(20,1,"Dresses / Skirts",1,12,1,1,UTC_TIMESTAMP()),
(21,1,"Gloves",6,12,1,1,UTC_TIMESTAMP()),
(22,1,"Hijabs ",6,12,1,1,UTC_TIMESTAMP()),
(23,1,"Scarves",6,12,1,1,UTC_TIMESTAMP()),
(24,1,"Summer Hats",6,12,1,1,UTC_TIMESTAMP()),
(25,1,"Thick Socks",6,12,1,1,UTC_TIMESTAMP()),
(26,1,"Thin Socks",6,12,1,1,UTC_TIMESTAMP()),
(27,1,"Winter Hats",6,12,1,1,UTC_TIMESTAMP()),
(28,4,"Trousers",18,2,1,1,UTC_TIMESTAMP()),
(29,4,"Dresses / Skirts",18,12,1,1,UTC_TIMESTAMP()),
(30,4,"Summer Hats",6,12,1,1,UTC_TIMESTAMP()),
(31,2,"Scarves",6,12,1,1,UTC_TIMESTAMP()),
(32,2,"Summer Hats",6,12,1,1,UTC_TIMESTAMP()),
(33,2,"Thick Socks",6,12,1,1,UTC_TIMESTAMP()),
(34,2,"Thin Socks",6,12,1,1,UTC_TIMESTAMP()),
(35,2,"Winter Hats",6,12,1,1,UTC_TIMESTAMP()),
(36,3,"Gloves",6,12,1,1,UTC_TIMESTAMP()),
(37,9,"Baby Gloves",6,12,1,1,UTC_TIMESTAMP()),
(38,9,"Baby Hats",6,12,1,1,UTC_TIMESTAMP()),
(39,9,"Baby Onesies",21,12,1,1,UTC_TIMESTAMP()),
(40,9,"Baby Rompers / Bodies",21,12,1,1,UTC_TIMESTAMP()),
(41,9,"Baby Socks",6,12,1,1,UTC_TIMESTAMP()),
(42,6,"Gloves",6,12,1,1,UTC_TIMESTAMP()),
(43,6,"Scarves",6,12,1,1,UTC_TIMESTAMP()),
(44,6,"Thick Socks",6,12,1,1,UTC_TIMESTAMP()),
(45,6,"Thin Socks",6,12,1,1,UTC_TIMESTAMP()),
(46,10,"Basins",6,11,1,1,UTC_TIMESTAMP()),
(47,10,"Bleach",6,10,1,1,UTC_TIMESTAMP()),
(48,10,"Bowls",6,11,1,1,UTC_TIMESTAMP()),
(49,10,"Canned / Jarred Food",6,11,1,1,UTC_TIMESTAMP()),
(50,10,"Dishes",6,11,1,1,UTC_TIMESTAMP()),
(51,10,"Dry Food",6,11,1,1,UTC_TIMESTAMP()),
(52,10,"Eating Utensils",6,11,1,1,UTC_TIMESTAMP()),
(53,10,"Pots & pans",6,11,1,1,UTC_TIMESTAMP()),
(54,10,"Sponges",6,11,1,1,UTC_TIMESTAMP()),
(55,10,"Washing up liquid",6,11,1,1,UTC_TIMESTAMP()),
(56,10,"Wooden cooking spoons",6,11,1,1,UTC_TIMESTAMP()),
(57,10,"ASTM 1 Masks",6,10,1,1,UTC_TIMESTAMP()),
(58,10,"ASTM 2 Masks ",6,10,1,1,UTC_TIMESTAMP()),
(59,10,"ASTM 3/FFP2/FFP3/N95 Masks",6,10,1,1,UTC_TIMESTAMP()),
(60,10,"Combs, Hair Ties, Brushes",6,10,1,1,UTC_TIMESTAMP()),
(61,10,"Condoms",7,10,1,1,UTC_TIMESTAMP()),
(62,10,"Deodorant",7,10,1,1,UTC_TIMESTAMP()),
(63,10,"Disposable Gloves",6,10,1,1,UTC_TIMESTAMP()),
(64,10,"Hand Sanitizer / Antibacterial Handgel",7,10,1,1,UTC_TIMESTAMP()),
(65,10,"Isopropryl Alcohol",6,10,1,1,UTC_TIMESTAMP()),
(66,10,"Lotion / Moisturizer",6,10,1,1,UTC_TIMESTAMP()),
(67,10,"Makeup",6,10,1,1,UTC_TIMESTAMP()),
(68,10,"Razors (Disposable)",7,10,1,1,UTC_TIMESTAMP()),
(69,10,"Reusable Masks",6,10,1,1,UTC_TIMESTAMP()),
(70,10,"Shampoo",6,10,1,1,UTC_TIMESTAMP()),
(71,10,"Shaving Foam",6,10,1,1,UTC_TIMESTAMP()),
(72,10,"Shower Gel",6,10,1,1,UTC_TIMESTAMP()),
(73,10,"Soap",6,10,1,1,UTC_TIMESTAMP()),
(74,10,"Sunscreen",6,10,1,1,UTC_TIMESTAMP()),
(75,10,"Toothbrushes",19,10,1,1,UTC_TIMESTAMP()),
(76,10,"Toothpaste",19,10,1,1,UTC_TIMESTAMP()),
(77,10,"Wet Wipes / Baby Wipes",7,10,1,1,UTC_TIMESTAMP()),
(78,1,"Sanitary Pads",6,10,1,1,UTC_TIMESTAMP()),
(79,3,"Incontinence Pads",6,10,1,1,UTC_TIMESTAMP()),
(80,9,"Diapers Size 0",12,10,1,1,UTC_TIMESTAMP()),
(81,9,"Diapers Size 1",12,10,1,1,UTC_TIMESTAMP()),
(82,9,"Diapers Size 2",12,10,1,1,UTC_TIMESTAMP()),
(83,9,"Diapers Size 3",12,10,1,1,UTC_TIMESTAMP()),
(84,9,"Diapers Size 4",12,10,1,1,UTC_TIMESTAMP()),
(85,9,"Diapers Size 5",12,10,1,1,UTC_TIMESTAMP()),
(86,9,"Diapers Size 6",12,10,1,1,UTC_TIMESTAMP()),
(87,9,"Diapers, Unsized",6,10,1,1,UTC_TIMESTAMP()),
(88,5,"Summer Jackets",18,6,1,1,UTC_TIMESTAMP()),
(89,5,"Winter Jackets",18,6,1,1,UTC_TIMESTAMP()),
(90,1,"Summer Jackets",1,6,1,1,UTC_TIMESTAMP()),
(91,1,"Winter Jackets",1,6,1,1,UTC_TIMESTAMP()),
(92,4,"Winter Hats",6,12,1,1,UTC_TIMESTAMP()),
(93,4,"Summer Jackets",18,6,1,1,UTC_TIMESTAMP()),
(94,2,"Summer Jackets",1,6,1,1,UTC_TIMESTAMP()),
(95,2,"Winter Jackets",1,6,1,1,UTC_TIMESTAMP()),
(96,3,"Misc. Outer Protective Gear",6,6,1,1,UTC_TIMESTAMP()),
(97,9,"Baby Jackets / Outerwear",21,6,1,1,UTC_TIMESTAMP()),
(98,6,"Misc. Outer Protective Gear",6,6,1,1,UTC_TIMESTAMP()),
(99,10,"Backpacks",6,9,1,1,UTC_TIMESTAMP()),
(100,10,"Suitcases and Bags",6,9,1,1,UTC_TIMESTAMP()),
(101,10,"Toys",6,14,1,1,UTC_TIMESTAMP()),
(102,10,"Umbrellas",6,20,1,1,UTC_TIMESTAMP()),
(103,10,"Bedsheets",6,20,1,1,UTC_TIMESTAMP()),
(104,10,"Blankets",6,20,1,1,UTC_TIMESTAMP()),
(105,10,"Duvet Covers",6,20,1,1,UTC_TIMESTAMP()),
(106,10,"Duvets",6,20,1,1,UTC_TIMESTAMP()),
(107,10,"Pillowcases",6,20,1,1,UTC_TIMESTAMP()),
(108,10,"Pillows",6,20,1,1,UTC_TIMESTAMP()),
(109,10,"Sleeping Bags",6,20,1,1,UTC_TIMESTAMP()),
(110,10,"Sleeping Mats",6,20,1,1,UTC_TIMESTAMP()),
(111,10,"Tarps",6,20,1,1,UTC_TIMESTAMP()),
(112,10,"Tents",6,20,1,1,UTC_TIMESTAMP()),
(113,10,"Towels",6,20,1,1,UTC_TIMESTAMP()),
(114,5,"Light Shoes",9,5,1,1,UTC_TIMESTAMP()),
(115,5,"Practical Shoes",9,5,1,1,UTC_TIMESTAMP()),
(116,5,"Sandals & Flip Flops",9,5,1,1,UTC_TIMESTAMP()),
(117,1,"Light Shoes",3,5,1,1,UTC_TIMESTAMP()),
(118,1,"Practical Shoes",3,5,1,1,UTC_TIMESTAMP()),
(119,1,"Sandals & Flip Flops",3,5,1,1,UTC_TIMESTAMP()),
(120,4,"Winter Jackets",18,6,1,1,UTC_TIMESTAMP()),
(121,4,"Light Shoes",9,5,1,1,UTC_TIMESTAMP()),
(122,4,"Practical Shoes",9,5,1,1,UTC_TIMESTAMP()),
(123,2,"Light Shoes",8,5,1,1,UTC_TIMESTAMP()),
(124,2,"Practical Shoes",8,5,1,1,UTC_TIMESTAMP()),
(125,2,"Sandals & Flip Flops",8,5,1,1,UTC_TIMESTAMP()),
(126,3,"Rubber Rain Boots",6,5,1,1,UTC_TIMESTAMP()),
(127,9,"Baby Shoes",21,5,1,1,UTC_TIMESTAMP()),
(128,6,"Rubber Rain Boots",6,5,1,1,UTC_TIMESTAMP()),
(129,5,"Jumpers",18,3,1,1,UTC_TIMESTAMP()),
(130,5,"Long Sleeve Tops",18,3,1,1,UTC_TIMESTAMP()),
(131,5,"T-Shirts / Short Sleeves",18,3,1,1,UTC_TIMESTAMP()),
(132,5,"Undershirts / Tank Tops",18,3,1,1,UTC_TIMESTAMP()),
(133,1,"Bodywarmers / Sleeveless Jumpers",1,3,1,1,UTC_TIMESTAMP()),
(134,1,"Jumpers",1,3,1,1,UTC_TIMESTAMP()),
(135,1,"Long Sleeve Tops",1,3,1,1,UTC_TIMESTAMP()),
(136,1,"T-Shirts / Short Sleeves",1,3,1,1,UTC_TIMESTAMP()),
(137,1,"Undershirts / Tank Tops",1,3,1,1,UTC_TIMESTAMP()),
(138,4,"Sandals & Flip Flops",9,5,1,1,UTC_TIMESTAMP()),
(139,4,"Jumpers",18,3,1,1,UTC_TIMESTAMP()),
(140,4,"Long Sleeve Tops",18,3,1,1,UTC_TIMESTAMP()),
(141,2,"Bodywarmers / Sleeveless Jumpers",18,3,1,1,UTC_TIMESTAMP()),
(142,2,"Jumpers",1,3,1,1,UTC_TIMESTAMP()),
(143,2,"Long Sleeve Tops",1,3,1,1,UTC_TIMESTAMP()),
(144,2,"T-Shirts / Short Sleeves",1,3,1,1,UTC_TIMESTAMP()),
(145,2,"Undershirts / Tank Tops",1,3,1,1,UTC_TIMESTAMP()),
(146,9,"Baby Jumpers",21,3,1,1,UTC_TIMESTAMP()),
(147,9,"Baby Tops",21,3,1,1,UTC_TIMESTAMP()),
(148,6,"Bodywarmers / Sleeveless Jumpers",18,3,1,1,UTC_TIMESTAMP()),
(149,5,"Underwear",18,1,1,1,UTC_TIMESTAMP()),
(150,1,"Bras",13,1,1,1,UTC_TIMESTAMP()),
(151,1,"Leggings",1,1,1,1,UTC_TIMESTAMP()),
(152,1,"Underwear",1,1,1,1,UTC_TIMESTAMP()),
(153,4,"T-Shirts / Short Sleeves",18,3,1,1,UTC_TIMESTAMP()),
(154,4,"Undershirts / Tank Tops",18,1,1,1,UTC_TIMESTAMP()),
(155,4,"Underwear",18,1,1,1,UTC_TIMESTAMP()),
(156,2,"Leggings",1,1,1,1,UTC_TIMESTAMP()),
(157,2,"Underwear",1,1,1,1,UTC_TIMESTAMP()),
(158,10,"Bottled water",19,19,1,1,UTC_TIMESTAMP()),
(159,10,"Drinking Vessels",6,19,1,1,UTC_TIMESTAMP()),
(160,10,"Water Storage Containers (>20L)",6,19,1,1,UTC_TIMESTAMP()),
(161,10,"Water Storage Containers (<10L)",6,19,1,1,UTC_TIMESTAMP()),
(162,10,"Water Storage Containers (10-20L)",6,19,1,1,UTC_TIMESTAMP());
/*!40000 ALTER TABLE `standard_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stock` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `box_id` varchar(11) NOT NULL DEFAULT '',
  `product_id` int(11) unsigned NOT NULL,
  `size_id` int(11) unsigned DEFAULT NULL,
  `display_unit_id` int(11) unsigned DEFAULT NULL,
  `measure_value` decimal(36,18) unsigned DEFAULT NULL,
  `items` int(11) DEFAULT NULL,
  `location_id` int(11) unsigned NOT NULL,
  `distro_event_id` int(11) unsigned DEFAULT NULL,
  `qr_id` int(11) unsigned DEFAULT NULL,
  `comments` text,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `deleted` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `box_state_id` int(11) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `box_id_unique` (`box_id`),
  UNIQUE KEY `qr_id_unique` (`qr_id`),
  KEY `box_id` (`box_id`),
  KEY `location_id` (`location_id`),
  KEY `product_id` (`product_id`),
  KEY `size_id` (`size_id`),
  KEY `box_state_id` (`box_state_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `distro_event_id` (`distro_event_id`),
  KEY `display_unit_id` (`display_unit_id`),
  CONSTRAINT `stock_ibfk_10` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_11` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_14` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_15` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_16` FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_17` FOREIGN KEY (`distro_event_id`) REFERENCES `distro_events` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_18` FOREIGN KEY (`display_unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_3` FOREIGN KEY (`qr_id`) REFERENCES `qr` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `stock_ibfk_9` FOREIGN KEY (`box_state_id`) REFERENCES `box_state` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100000247 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES
  (100000000,'328765',1163,68,NULL,NULL,50,100000002,NULL,100000000,'Cypress seed test box','2015-01-01 11:15:32',1,NULL,NULL,'0000-00-00 00:00:00',5),
  (100000001,'235563',1165,68,NULL,NULL,50,100000005,NULL,100000001,'50 dummy products','2019-09-29 18:15:32',1,NULL,NULL,'0000-00-00 00:00:00',5);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `color` varchar(255) NOT NULL,
  `camp_id` int(11) unsigned NOT NULL,
  `deleted` datetime DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `description` text NOT NULL,
  `type` varchar(255) DEFAULT 'People',
  `seq` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `camp_id` (`camp_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `tags_type_index` (`type`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`camp_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tags_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tags_ibfk_3` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags_relations`
--

DROP TABLE IF EXISTS `tags_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tags_relations` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `object_id` int(11) unsigned NOT NULL,
  `object_type` varchar(255) NOT NULL DEFAULT 'People',
  `tag_id` int(11) unsigned NOT NULL,
  `created_on` datetime DEFAULT NULL,
  `created_by_id` int(11) unsigned DEFAULT NULL,
  `deleted_on` datetime DEFAULT NULL,
  `deleted_by_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tag_id` (`tag_id`),
  KEY `created_by_id` (`created_by_id`),
  KEY `deleted_by_id` (`deleted_by_id`),
  CONSTRAINT `tags_relations_ibfk_4` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tags_relations_ibfk_5` FOREIGN KEY (`created_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `tags_relations_ibfk_6` FOREIGN KEY (`deleted_by_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags_relations`
--

LOCK TABLES `tags_relations` WRITE;
/*!40000 ALTER TABLE `tags_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `tags_relations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipofday`
--

DROP TABLE IF EXISTS `tipofday`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipofday` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipofday`
--

LOCK TABLES `tipofday` WRITE;
/*!40000 ALTER TABLE `tipofday` DISABLE KEYS */;
INSERT INTO `tipofday` VALUES (1,'Sorting lists','Most lists can be sorted anyway you like. Just click on the column title to sort the table on that column. Clicking another time on the same column will reverse the sort order.'),(2,'Undo a purchase','If a customer decides not to buy something after you made the purchase: check the item in the list of purchases and hit the red \'Delete\' button.'),(3,'Changing the amount of tokens','If you want to change the amount of tokens of a family/beneficiary, for example because you changed the amount of family members, you find the people in the \'Check-in\' section of the site, click the checkbox next to the family/beneficiary name and hit the \'Give tokens\' button. <br /><br /> You can enter an amount to be added to the family/beneficiary as a whole or an amount for each adult or child. And ofcourse, you can also enter a negative number.'),(4,'Mobile','Did you know that this Drop Shop system works perfectly on most smartphones? Just open \'https://market.drapenihavet.no\' in your browser.'),(5,'Quick purchase','If you want to quickly submit a form you can simply use the \'cmd + enter\' or \'ctrl + enter\' shortcut!'),(6,'Sorting','Did you know you that in a list you can sort multiple columns simultaneously by holding down the Shift key and clicking a second, third or even fourth column header!');
/*!40000 ALTER TABLE `tipofday` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `people_id` int(11) unsigned DEFAULT NULL,
  `product_id` int(11) unsigned DEFAULT NULL,
  `count` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `drops` int(11) NOT NULL DEFAULT '0',
  `transaction_date` datetime NOT NULL,
  `user_id` int(11) unsigned DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `people_id` (`people_id`),
  KEY `transaction_date` (`transaction_date`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `transactions_ibfk_10` FOREIGN KEY (`people_id`) REFERENCES `people` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_11` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_7` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_8` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=100001891 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES
  (100000000,100000002,1158,0,'',2147483647,'2019-09-02 00:00:00',1,NULL,NULL,NULL,NULL),
  (100000001,100000003,1161,0,'',2147483647,'2019-09-02 00:00:00',1,NULL,NULL,NULL,NULL),
  (100000002,100000004,1162,0,'',2147483647,'2019-09-02 00:00:00',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_agreement`
--

DROP TABLE IF EXISTS `transfer_agreement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transfer_agreement` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `source_organisation_id` int(11) unsigned NOT NULL,
  `target_organisation_id` int(11) unsigned NOT NULL,
  `state` varchar(255) NOT NULL DEFAULT 'UnderReview',
  `type` varchar(255) NOT NULL,
  `requested_on` datetime NOT NULL,
  `requested_by` int(11) unsigned NOT NULL,
  `accepted_on` datetime DEFAULT NULL,
  `accepted_by` int(11) unsigned DEFAULT NULL,
  `terminated_on` datetime DEFAULT NULL,
  `terminated_by` int(11) unsigned DEFAULT NULL,
  `valid_from` datetime NOT NULL,
  `valid_until` datetime DEFAULT NULL,
  `comment` text,
  PRIMARY KEY (`id`),
  KEY `transfer_agreement_source_organisation_id` (`source_organisation_id`),
  KEY `transfer_agreement_target_organisation_id` (`target_organisation_id`),
  KEY `transfer_agreement_requested_by` (`requested_by`),
  KEY `transfer_agreement_accepted_by` (`accepted_by`),
  KEY `transfer_agreement_terminated_by` (`terminated_by`),
  CONSTRAINT `transfer_agreement_ibfk_1` FOREIGN KEY (`source_organisation_id`) REFERENCES `organisations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_ibfk_2` FOREIGN KEY (`target_organisation_id`) REFERENCES `organisations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_ibfk_3` FOREIGN KEY (`requested_by`) REFERENCES `cms_users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_ibfk_4` FOREIGN KEY (`accepted_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_ibfk_5` FOREIGN KEY (`terminated_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_agreement`
--

LOCK TABLES `transfer_agreement` WRITE;
/*!40000 ALTER TABLE `transfer_agreement` DISABLE KEYS */;
INSERT INTO `transfer_agreement` VALUES
  (1,100000000,100000001,'Accepted','Bidirectional','2024-01-01 12:34:56',100000001,'2024-01-05 00:00:00',100000000,NULL,NULL,'2024-01-01 12:34:56',NULL,'test');
/*!40000 ALTER TABLE `transfer_agreement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_agreement_detail`
--

DROP TABLE IF EXISTS `transfer_agreement_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transfer_agreement_detail` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `transfer_agreement_id` int(11) unsigned NOT NULL,
  `source_base_id` int(11) unsigned DEFAULT NULL,
  `target_base_id` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `transfer_agreement_detail_transfer_agreement_id` (`transfer_agreement_id`),
  KEY `transfer_agreement_detail_source_base_id` (`source_base_id`),
  KEY `transfer_agreement_detail_target_base_id` (`target_base_id`),
  CONSTRAINT `transfer_agreement_detail_ibfk_1` FOREIGN KEY (`transfer_agreement_id`) REFERENCES `transfer_agreement` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_detail_ibfk_2` FOREIGN KEY (`source_base_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `transfer_agreement_detail_ibfk_3` FOREIGN KEY (`target_base_id`) REFERENCES `camps` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_agreement_detail`
--

LOCK TABLES `transfer_agreement_detail` WRITE;
/*!40000 ALTER TABLE `transfer_agreement_detail` DISABLE KEYS */;
INSERT INTO `transfer_agreement_detail` VALUES
  (1,1,100000000,100000001);
/*!40000 ALTER TABLE `transfer_agreement_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translate`
--

DROP TABLE IF EXISTS `translate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `translate` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `code` varchar(255) DEFAULT '',
  `description` varchar(255) DEFAULT NULL,
  `nl` text NOT NULL,
  `en` text NOT NULL,
  `fr` text NOT NULL,
  `hidden` tinyint(4) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `deleted` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `translate_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `translate_categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `translate_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `translate_ibfk_5` FOREIGN KEY (`modified_by`) REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=914 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translate`
--

LOCK TABLES `translate` WRITE;
/*!40000 ALTER TABLE `translate` DISABLE KEYS */;
INSERT INTO `translate` VALUES (485,13,'text','cms_login_email',NULL,'e-mailadres','E-mail address','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(486,13,'text','cms_login_password','','Wachtwoord','Password','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(487,13,'text','cms_login_submit',NULL,'Log in','Log in','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(488,13,'text','cms_login_autologin',NULL,'onthoud mij','Remember me','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(489,13,'text','cms_login_error_wrongpassword',NULL,'Wachtwoord is niet correct','Wrong password','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(490,13,'text','cms_login_error_usernotfound',NULL,'Een gebruiker met dit e-mailadres is niet gevonden.','A user with this e-mail address is not found','Utilisateur introuvable',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(491,13,'text','cms_login_pagetitle',NULL,'Inloggen','Login','connexion',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(492,13,'text','cms_menu_settings','','Instellingen','Settings','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(493,13,'text','cms_menu_logout','','Uitloggen','Logout','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(494,13,'text','cms_form_submit','','Opslaan en sluiten','Save and close','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(496,13,'text','cms_form_createdby','','Gemaakt door','Created by','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(497,13,'text','cms_form_ondate','','op','on','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(498,13,'text','cms_form_history_modified',NULL,'Gewijzigd door','Modified by','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(499,13,'text','cms_form_charactersleft',NULL,'tekens over van %n','characters left from %n','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(500,13,'text','cms_list_add',NULL,'Nieuw','New item','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(501,13,'text','cms_list_delete',NULL,'Verwijderen','Delete','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(502,13,'text','cms_list_hide',NULL,'Verbergen','Hide','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(503,13,'text','cms_list_show',NULL,'Tonen','Show','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(504,13,'text','cms_settings_category',NULL,'Categorie','Category','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(505,13,'text','cms_users_naam','','Naam','Name','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(506,13,'text','cms_users_email','','E-mail','E-mail','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(507,13,'text','cms_users_lastlogin',NULL,'Laatste login','Last login','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(508,13,'text','cms_users_new',NULL,'Nieuwe gebruiker','New user','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(509,13,'text','cms_users_password','','Wachtwoord','Password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(510,13,'text','cms_users_access',NULL,'Beschikbare functies','Available functions','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(511,13,'text','cms_settings_value',NULL,'Waarde','Value','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(512,13,'text','cms_settings_code',NULL,'Code','Code','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(513,0,'text','cms_settings','','Instellingen','Global Settings','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(514,13,'text','cms_settings_new',NULL,'Nieuwe instelling','New setting','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(515,13,'text','cms_settings_hidden',NULL,'Verborgen','Hidden','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(516,13,'text','cms_settings_type',NULL,'Type','Type','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(517,13,'text','cms_field_text',NULL,'Tekstregel','Line of text','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(518,13,'text','cms_field_textarea',NULL,'Tekstveld','Textarea','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(519,13,'text','cms_field_checkbox',NULL,'Checkbox','Checkbox','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(520,13,'text','cms_translates',NULL,'Teksten','Texts','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(521,13,'text','cms_translate_description',NULL,'Beschrijving','Description','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(522,13,'text','cms_translate_code',NULL,'Code','Code','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(523,13,'text','cms_translate_new',NULL,'Nieuwe tekst','New text','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(524,13,'text','cms_users','','Gebruikers','User Management','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(525,13,'text','cms_user','','Gebruiker','User','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(526,13,'text','cms_setting',NULL,'instelling','setting','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(527,13,'text','cms_translate',NULL,'tekst','text','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(528,13,'text','cms_form_new',NULL,'Nieuw','New','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(529,13,'text','cms_form_edit','','Wijzig','Edit','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(530,13,'text','cms_translate_type',NULL,'Type','Type','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(531,13,'text','cms_login_repeatpassword','','Herhaal wachtwoord','Repeat password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(532,13,'text','cms_login_forgotpassword',NULL,'Wachtwoord vergeten?','Forgot Password?','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(533,13,'text','cms_reset_pagetitle',NULL,'Reset wachtwoord','Reset Password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(534,13,'text','cms_reset_submit',NULL,'Reset','Reset','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(535,13,'text','cms_functions',NULL,'CMS Functies','CMS Functions','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(536,13,'text','cms_function',NULL,'CMS Functie','CMS Function','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(537,13,'text','cms_function_include',NULL,'Bestand','File','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(538,13,'text','cms_function_users',NULL,'Beschikbaar voor deze gebruikers','Available voor these users','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(539,13,'text','cms_form_cancel','','Annuleren','Cancel','',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(542,13,'text','cms_email_salutation',NULL,'Beste','Dear','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(543,13,'textarea','cms_email_boilerplate','','Deze e-mail is verstuurd vanuit','You\'ve received this email because you were created an account for Boxtribute through {orgname}. If you think you got this email by mistake, please contact us at [mailto:helpme@boxtribute.org]. ','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(544,13,'textarea','cms_reset_mail','','Je hebt aangegeven dat je een nieuw wachtwoord wilt instellen voor het CMS op {sitename}.<br /><br />\r\n<a href=\"{link}\">Klik hier om een nieuw wachtwoord in te stellen</a><br /><br />\r\nHeb je geen nieuw wachtwoord aangevraagd, dan hoef je geen actie te ondernemen.\r\n','You have requested a new password for {sitename}.<br /><br />\r\n<a href=\"{link}\">Click here to enter a new password</a><br /><br />\r\nIf you didn\'t requested this yourself, you don\'t have to do anything.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(545,13,'text','cms_reset2_pagetitle',NULL,'Kies een nieuw wachtwoord','Choose a new password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(546,13,'text','cms_reset2_description',NULL,'Kies een wachtwoord dat niet te gemakkelijk is te raden. Niet je postcode, geboortedatum, de naam van je partner of combinaties van dat soort gegevens. Een goed wachtwoord bevat minimaal acht willekeurige letters, cijfers en leestekens.','Choose a password that is not too easy to guess. Don\'t use your zipcode, date of birth, the name of your spouse or combinations of this kind of data. A good password contains of a minimum of eight characters, numbers or punctuations.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(547,13,'text','cms_reset2_submit',NULL,'Opslaan','Save','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(548,13,'text','cms_list_selectall',NULL,'Selecteer alle items','Select all items','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(549,13,'text','cms_settings_category',NULL,'Categorie','Category','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(551,13,'text','cms_reset_description',NULL,'Als je je wachtwoord niet meer weet, vul dan hier je e-mailadres in. Je krijgt dan direct een mail toegestuurd met daarin de mogelijkheid een nieuw wachtwoord aan te maken.','If you can\'t remember your password, please fill in your e-mail address. You will receive an email with a link to create a new password.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(556,13,'text','cms_form_selectplaceholder',NULL,'Maak een keuze','Please select','Faire un choix',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(557,13,'text','cms_field_wysiwyg',NULL,'TinyMCE','TinyMCE','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(558,13,'text','cms_settings_enabled',NULL,'Ingeschakeld','Enabled','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(559,13,'text','cms_field_select',NULL,'Menu','Menu','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(560,13,'text','cms_settings_options',NULL,'Keuzes','Options','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(562,13,'text','cms_reset_notmatching',NULL,'De wachtwoorden zijn niet gelijk','The passwords do not match','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(563,13,'text','cms_reset_tooshort',NULL,'Het wachtwoord is te kort','The password is not long enough','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(564,13,'text','cms_list_copy',NULL,'Kopiëren','Copy','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(566,13,'text','cms_list_confirm_title','','Weet je het zeker?','Are you sure?','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(567,13,'text','cms_list_confirm_ok',NULL,'OK','OK','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(568,13,'text','cms_list_confirm_cancel','','Annuleren','Cancel','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(572,13,'text','cms_list_copysuccess',NULL,'Er is een kopie gemaakt van de geselecteerde rij(en)','A copy of the row(s) has been made','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(578,13,'text','cms_list_deletesuccess',NULL,'Onderdeel verwijderd','Item deleted','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(579,13,'text','cms_list_deleteerror',NULL,'De geselecteerde onderdelen (of een deel ervan) konden niet worden verwijderd.','The selected items (or some of them) could not be deleted.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(584,13,'text','cms_users_settings','','Persoonlijke instellingen','Personal settings','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(586,13,'text','cms_error',NULL,'Sorry, er is iets foutgegaan','Sorry, something went wrong','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(595,13,'text','cms_error_pleasereport',NULL,'Laatste login','Last login','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(600,13,'text','cms_error404',NULL,'De pagina die je probeert te openen bestaat niet.','The page you have requested does not exist.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(622,13,'text','tooltip_menutitle',NULL,'Deze titel wordt gebruikt als er in een menu naar deze pagina wordt verwezen. Hoe korter hoe beter.','This title is used when refering to this item in a menu. The shorter the better.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(625,13,'text','tooltip_pagetitle',NULL,'Dit is de titel bovenaan de pagina. Deze titel is erg belangrijk voor zoekmachines, gebruik dus de meest relevante trefwoorden.','This is the title on top of the page. This title is very important for search engines, so use the most important keywords here.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(626,13,'text','tooltip_windowtitle',NULL,'Deze tekst komt terug in de titelbalk van de browser. Voor de beste indexering gebruik je hier weer andere keywords dan in de paginatitel. De lengte van deze tekst is idealiter niet langer dan 64 tekens, inclusief de naam van de website.','This title will be visible in the title bar of the browser. For the best search engine results, use other keywords than you did in the pagetitle. This title should be no more than 64 characters, including the name of the website.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(627,13,'text','tooltip_metadescription',NULL,'Geef voor Google een beschrijving van deze pagina in maximaal 155 tekens. Een volzin is beter dan een reeks trefwoorden.','Google desires a short description of the page, to show in the search results. Stay within 155 characters.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(628,13,'text','cms_settings_language','','Taal','Language','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(629,13,'text','cms_form_save',NULL,'Opslaan','Save','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(630,13,'text','cms_form_modifiedby_copy',NULL,'Laatst gewijzigd door','Last modified by','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(637,13,'text','cms_users_sendlogin',NULL,'Stuur inloggegevens','Send login data','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(638,13,'text','cms_form_selectroot',NULL,'Beginpunt','Root','Faire un choix',1,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(641,13,'text','cms_form_choosefile',NULL,'Kies bestand','Choose file','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(642,13,'text','cms_form_chooseimage',NULL,'Kies afbeelding','Choose image','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(643,13,'text','cms_form_viewfile',NULL,'Bekijk bestand','View file','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(649,13,'text','tooltip_url','','Als je de URL leeg laat, maakt het systeem automatisch een goeie url voor je pagina. Je kan de URL veranderen door dit veld te ontgrendelen. Realiseer je wel dat door het veranderen van een URL bestaande verwijzingen naar deze pagina kunnen verdwijnen.','If you leave this field empty, the system will fill it in for you. If you want to change a value, you can unlock this field and do so. But realise that this can result in broken links.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(654,13,'text','cms_list_showhidesuccess',NULL,'Tonen/verbergen succesvol','','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(655,13,'text','cms_reset_mailsubject',NULL,'Nieuw wachtwoord','New password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(656,13,'textarea','cms_sendlogin_mail','','Hierbij ontvang je een wachtwoord om in te loggen op het systeem van {sitename}.<br /><br /> Je nieuwe wachtwoord is <strong>{password}</strong><br /><br /> Let op: Het systeem maakt onderscheid tussen hoofd- en kleine letters.<br /><br /> Als je bent ingelogd kan je het wachtwoord zelf wijzigen, door op je naam te klikken in de rechterbovenhoek en dan voor \'Instellingen\' te kiezen. Kies dan wel voor een niet al te makkelijk te raden password van minimaal acht tekens.','{user} from <strong>{orgname}</strong> has set you up with a Boxtribute account! <br/><br/> Please use this email address and the password below to log in to Boxtribute ({sitename}) through your browser. <strong>If you are an iOS user, we recommend you use Safari.</strong> <br /><br /> Your password is <strong>{password}</strong><br /><br /> We encourage you to update your password to something secure and memorable by logging in, clicking on your name in the upper right corner and choosing \'Settings\'. <br /> <br /> <strong>Need help getting started?</strong> <br /><br /> - Check our manual (boxwise.freshdesk.com), or  <br /> - Message us through facebook (facebook.com/boxtribute), or  <br /> - Write us an email (helpme@boxtribute.org) <br /><br /> The Boxtribute Team ','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(657,13,'text','cms_sendlogin_mailsubject','','Nieuw wachtwoord','Welcome to Boxtribute!','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(658,13,'text','cms_sendlogin_confirm',NULL,'De logingegevens zijn verstuurd.','Within a few minutes you will receive an e-mail with further instructions to reset your password.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(660,13,'text','cms_email_signature','','Met veel liefde...','Much love...','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(661,13,'text','buytickets',NULL,'Koop kaarten voor deze voorstelling','','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(662,13,'text','cms_form_changefile',NULL,'Wijzig bestand','Change file','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(663,13,'text','cms_form_changeimage',NULL,'Wijzig afbeelding','Change image','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(664,13,'text','cms_form_delete',NULL,'Verwijderen','Delete','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(665,13,'text','cms_form_wipe','','Wissen','Wipe','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(666,13,'text','cms_form_file_deletesuccess',NULL,'bestand verwijderd','File removed','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(667,13,'text','cms_form_file_deletefailure',NULL,'Er is iets mis gegaan in het verwijderen van het bestand','An error occurred while trying to remove the file','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(675,13,'text','cms_form_deletefileconfirmation',NULL,'Het bestand wordt uit dit item verwijderd. Weet je het zeker? (Het originele bestand blijft beschikbaar in de filemanager)','The file will be deleted. Are you sure? (The original file remains in the file manager)','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(676,13,'text','cms_form_changefile_msg',NULL,'Het bestand wordt pas bewaard nadat je op &quot;opslaan&quot; geklikt hebt.','The file will be saved after clicking &quot;save&quot;.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(677,13,'text','cms_form_changeimage_msg',NULL,'De afbeelding wordt pas bewaard nadat je op &quot;opslaan&quot; geklikt hebt.','The image will be saved after clicking &quot;save&quot;.','',0,NULL,NULL,NULL,NULL,'2017-04-10 19:54:00'),(679,13,'text','cms_users_loginas',NULL,'Inloggen als deze gebruiker','Login as this user','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(680,13,'text','cms_menu_exitloginas',NULL,'Terug naar %user%','Back to %user%','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(681,13,'text','cms_list_copyfailure',NULL,'Kopie kon niet worden gemaakt','A copy could not been made','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(682,13,'text','cms_list_copy_suffix',NULL,'(kopie)','(copy)','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(683,13,'text','cms_reset_success',NULL,'Je wachtwoord is aangepast','Your password has been changed','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(684,13,'text','cms_users_email_tooltip',NULL,'Je emailadres is tevens je loginnaam','Your e-mail address is also your loginname','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(685,13,'text','cms_users_password_change',NULL,'Wachtwoord aanpassen','Change password','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(686,13,'text','cms_users_password_tooltip',NULL,'Vul hier tweemaal het nieuwe wachtwoord in. Het wachtwoord moet minimaal 8 tekens lang zijn en bestaat ideaal uit een combinatie van letters (groot en klein), cijfers en/of leestekens. Het wachtwoord mag niet te makkelijk te raden zijn.','Please fill in the new password twice. The password should consist of letters (small and capital), numbers and/or punctuation. The password should at least be 8 characters long. Please do not use a password that is easily gueassable.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(687,13,'text','cms_settings_description',NULL,'Beschrijving','Description','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(688,13,'text','cms_form_createdunknown','','onbekend','unknown','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(689,13,'text','tooltip_url_locked',NULL,'Voor deze pagina kan je de URL zelf niet aanpassen.','For this page, you are not allowed to change the URL.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(690,13,'text','cms_form_view_modified','','Bekijk bewerkgeschiedenis','View edit history','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(691,13,'text','cms_form_modifiedby','','Laatst gewijzigd door','Last modified by','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(692,13,'text','cms_form_history_nodata',NULL,'Geen wijzigingen gevonden','No changes found','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(693,13,'text','cms_login_error_adminonly',NULL,'Geen toegang - gebruik het CMS op de live-versie van de website!','No access - please use the CMS on the live website','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(695,13,'text','cms_list_showhidesuccess',NULL,'Tonen/verbergen succesvol','Succesfully hidden/shown','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(696,13,'text','cms_translate_categorychanged',NULL,'De items zijn verplaatst naar een nieuwe categorie','The items have been moved to a new category','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(697,13,'text','cms_list_notexistingdo',NULL,'Deze functie is niet beschikbaar','This function is not available','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(698,13,'text','cms_brokenlinks_url',NULL,'Broken link','Broken link','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(699,13,'text','cms_brokenlinks_location',NULL,'Gevonden op','Found at','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(700,13,'text','cms_brokenlinks_error',NULL,'Foutcode','Error','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(867,13,'text','site_name','','Drop App','Drop App','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(868,13,'text','adults','','Volwassenen','Adults','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(869,13,'text','children','','kinderen','children','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(870,13,'text','container','','Container','Container','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(871,13,'text','coins','','Tokens','Tokens','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(872,13,'text','purchases','','Aankopen','Purchases','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(873,13,'text','transactions','','Transacties','Transactions','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(874,13,'text','product','','Product','Product','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(875,13,'text','size','','Maat','Size','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(876,13,'text','note','','Opmerking','Note','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(877,13,'text','handled_by','','Afgehandeld door','Handled by','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(878,13,'text','date','','Datum','Date','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(879,13,'text','Monday','','Maandag','Monday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(880,13,'text','Tuesday','','Dinsdag','Tuesday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(881,13,'text','Wednesday','','Woensdag','Wednesday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(882,13,'text','Thursday','','Donderdag','Thursday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(883,13,'text','Friday','','Vrijdag','Friday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(884,13,'text','Saturday','','Zaterdag','Saturday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(885,13,'text','Sunday','','Zondag','Sunday','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(886,13,'text','January','month','januari','January','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(887,13,'text','February','month','februari','February','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(888,13,'text','March','month','maart','March','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(889,13,'text','April','month','april','April','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(890,13,'text','May','month','mei','May','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(891,13,'text','June','month','juni','June','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(892,13,'text','July','month','juli','July','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(893,13,'text','August','month','augustus','August','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(894,13,'text','September','month','september','September','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(895,13,'text','October','month','oktober','October','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(896,13,'text','November','month','november','November','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(897,13,'text','December','month','december','December','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(898,13,'text','amount','','Hoeveelheid','Amount','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(899,13,'text','firstname','','Voornaam','First name','First name',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(900,13,'text','lastname','','Achternaam','Last name','Last name',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(901,13,'text','cms_list_undelete',NULL,'Herstellen','Recover','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(902,13,'text','cms_list_undeleteerror',NULL,'De geselecteerde onderdelen (of een deel ervan) konden niet worden hersteld.','The selected items (or some of them) could not be recovered.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(903,13,'text','cms_list_undeletesuccess',NULL,'Onderdeel hersteld','Item recovered','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(904,13,'text','cms_list_extendsuccess',NULL,'Vervaldatum item verlengd','Item expiration extended','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(905,13,'text','cms_list_extenderror',NULL,'Geen van de geselecteerde items kon worden verlengd','None of the selected items could be extended','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(906,0,'text','bag_for_three','The color of a bag of vegetables for three persons','','Blue','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(907,0,'text','bag_for_one','The color of a bag of vegetables for one persons','','Yellow','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(908,0,'textarea','bicycle-rules','Rules for bicycle renting to be printed on the back of the Certificate','','Bikes are only available for beneficiaries of Nea Kavala. / You can only borrow a bike when you have succesfully finished the training and have signed the contract with us / To borrow a bike you hand over this certificate, you will get it back after returning the bike / You are responsible for your own safety and to bring back the bike in a clean and good state / You have to be 18 years old minimum to be able to borrow a bike. / At all times, bikes need to be back on the same day before 19:30. After 16:30 we will not start a new borrowing period. / The maximum borrowing period is three hours. / If you not follow these rules, we can ban you for two weeks and if you repeatedly not follow the rules we can ban you permanently.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(909,0,'text','listtitle_bread','Food list for bread','','Bread','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(910,0,'text','listtitle_dryfood','Food list for dry food','','Dry Food','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(911,0,'text','listtitle_vegetables','Food list for vegetables','','Vegetables','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(912,0,'textarea','workshop-rules','Rules for workshop access','','Workshop access is only available for beneficiaries of Nea Kavala. / You can access the workshop when you have succesfully finished the training and have signed the contract with us / To get access to the workshop and use tools you show us this card, you will get it back after returning the tools and leaving the workshop  / You are responsible for your own safety and to return all tools in a clean and good state / You have to be 16 years old minimum. / Always return all the tools before closing time of the workshop (17:00) / If you not follow these rules, we can ban you for two weeks and if you repeatedly not follow the rules we can ban you permanently.','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00'),(913,0,'text','site_name','','','Boxtribute','',0,NULL,NULL,NULL,NULL,'0000-00-00 00:00:00');
/*!40000 ALTER TABLE `translate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translate_categories`
--

DROP TABLE IF EXISTS `translate_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `translate_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translate_categories`
--

LOCK TABLES `translate_categories` WRITE;
/*!40000 ALTER TABLE `translate_categories` DISABLE KEYS */;
INSERT INTO `translate_categories` VALUES (0,'something else'),(13,'text');
/*!40000 ALTER TABLE `translate_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `conversion_factor` decimal(36,18) unsigned NOT NULL,
  `dimension_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dimension_id` (`dimension_id`),
  CONSTRAINT `units_ibfk_1` FOREIGN KEY (`dimension_id`) REFERENCES `sizegroup` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES
  (1,'kilogram','kg',1.0,28),
  (2,'liter','l',1.0,29),
  (3,'milliliter','ml',1000.0,29),
  (4,'gram','g',1000.0,28),
  (5,'milligram','mg',1000000.0,28),
  (6,'metric ton','t',0.001,28),
  (7,'pound','lb',2.2046,28),
  (8,'ounce','oz',35.274,28),
  (9,'gallon (US)','gal (US)',0.2642,29),
  (10,'pint (US)','pt (US)',2.1134,29),
  (11,'fluid ounce (US)','fl oz (US)',33.814,29)
;
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `x_people_languages`
--

DROP TABLE IF EXISTS `x_people_languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `x_people_languages` (
  `people_id` int(11) unsigned NOT NULL,
  `language_id` int(11) unsigned NOT NULL,
  UNIQUE KEY `people_language_unique` (`people_id`,`language_id`),
  KEY `language_id` (`language_id`),
  CONSTRAINT `x_people_languages_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `x_people_languages_ibfk_3` FOREIGN KEY (`people_id`) REFERENCES `people` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `x_people_languages`
--

LOCK TABLES `x_people_languages` WRITE;
/*!40000 ALTER TABLE `x_people_languages` DISABLE KEYS */;
/*!40000 ALTER TABLE `x_people_languages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-10  8:38:12
