import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("suninet.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS isp_customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    full_name TEXT,
    status TEXT,
    package TEXT,
    bandwidth TEXT,
    expiry_date TEXT,
    area TEXT,
    address TEXT,
    mobile_number TEXT,
    custom_price INTEGER DEFAULT NULL,
    pending_balance INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    amount_paid INTEGER,
    payment_date TEXT,
    month INTEGER,
    year INTEGER,
    FOREIGN KEY(customer_id) REFERENCES isp_customers(id)
  );
`);

// Ensure new columns exist (Migration)
try {
  db.prepare("ALTER TABLE isp_customers ADD COLUMN address TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE isp_customers ADD COLUMN mobile_number TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE isp_customers ADD COLUMN pending_balance INTEGER DEFAULT 0").run();
} catch (e) {}

// Migration logic
try {
  const oldData = db.prepare("SELECT * FROM customers").all();
  if (oldData.length > 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO isp_customers (username, full_name, status, package, bandwidth, expiry_date, area)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const transaction = db.transaction((data) => {
      for (const item of data) {
        insert.run(item.username, item.full_name, item.status, item.package, item.bandwidth, item.expiry_date, item.area);
      }
    });
    transaction(oldData);
    db.exec("DROP TABLE customers");
    console.log("Migrated data to isp_customers");
  }
} catch (e) {
  // customers table might not exist, which is fine
}

const initialData = [
  { username: "enl212", full_name: "Mr Umair Dubai", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-20", area: "SECTOR-4-A" },
  { username: "earthnet1381", full_name: "Owais anda", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-21", area: "SECTOR-4-A" },
  { username: "earth81", full_name: "Mr Rehman", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "earth70", full_name: "Azar", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "earthnet453", full_name: "Israr", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "earthnet707", full_name: "Mr Azeem", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-18", area: "SECTOR-4-A" },
  { username: "earthnet134", full_name: "Ali khan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earthnet103", full_name: "Danish Atm", status: "Active", package: "ABB-Gold", bandwidth: "22", expiry_date: "2026-03-17", area: "SECTOR-4-A" },
  { username: "earthnet248", full_name: "Mr Aatir", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-17", area: "SECTOR-4-A" },
  { username: "earth60", full_name: "Mr Salman", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-19", area: "SECTOR-4-A" },
  { username: "earth21", full_name: "Shahid", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-18", area: "SECTOR-4-A" },
  { username: "earth104", full_name: "Mr waseem", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-17", area: "SECTOR-4-A" },
  { username: "earthnet925", full_name: "Mr Mohsin", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "earthnet1071", full_name: "Mr Muhammad Danish", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "earth006", full_name: "Jamal", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "enl603", full_name: "Amir", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "earth2", full_name: "Naveed Mohiudeen", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-15", area: "SECTOR-4-A" },
  { username: "earth12", full_name: "Mr Tahseen", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-20", area: "SECTOR-4-A" },
  { username: "j.net-1006", full_name: "Noman", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-15", area: "SECTOR-4-A" },
  { username: "j.net-59", full_name: "Daniyal", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-18", area: "SECTOR-4-A" },
  { username: "earthnet1151", full_name: "Mr Umair Relative", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "earthnet144", full_name: "Tariq Mama Relative", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "earthnet932", full_name: "Mr Waseem Haider", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "earthnet1591", full_name: "Mr Asad", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "j.net-1007", full_name: "Adnan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "earth27", full_name: "Abrar", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "earthnet297", full_name: "yaqoob bhai", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "j.net-2", full_name: "Mr Mohsin", status: "Active", package: "ABB-Gold", bandwidth: "22", expiry_date: "2026-03-14", area: "SECTOR-4-A" },
  { username: "earthnet1527", full_name: "Mr Aswaq", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-14", area: "SECTOR-4-A" },
  { username: "earthnet120", full_name: "S M Akram kazmi", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "test44", full_name: "Madina El", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "earthnet211", full_name: "Mr ishaq", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "earthnet196", full_name: "Naveed bhai", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "eal133", full_name: "Kubra Shop", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "earthnet147", full_name: "Mr Wajid Ali", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "j.net-104", full_name: "Adnan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "earthnet241", full_name: "Mohammad ahsan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "earthnet1391", full_name: "Aish atif", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-09", area: "SECTOR-4-A" },
  { username: "earthnet484", full_name: "Mr saad", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-09", area: "SECTOR-4-A" },
  { username: "earthnet272", full_name: "Mr Imran", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "j.net-92", full_name: "Salam nave", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "earth105", full_name: "Mr sameer", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-09", area: "SECTOR-4-A" },
  { username: "earthnet145", full_name: "Mr Faysal Siraiki", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "earthnet232", full_name: "Adeel milk", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "j.net-102", full_name: "Ruman", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-07", area: "SECTOR-4-A" },
  { username: "j.net-81", full_name: "Bilawal mobail", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "j.net-7", full_name: "Faraz makenik", status: "Inactive on Expiry", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "enl120", full_name: "Mr Irfan", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-07", area: "SECTOR-4-A" },
  { username: "earthnet436", full_name: "Mr Haffat Cow Boy", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "j.net-19", full_name: "Sharjeel", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-13", area: "SECTOR-4-A" },
  { username: "earthnet237", full_name: "Mr Atif Mumtaz", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "enl117", full_name: "Mirza Umair ", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "enl202", full_name: "Aftab", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "enl116", full_name: "Mr Imran", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "saim12", full_name: "Mr Adil Shah", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "earthnet943", full_name: "Sheikh Abdul Qadir", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "atif115", full_name: "Atif", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earth89", full_name: "Mr New Connection", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earthnet5011", full_name: "Mr Shab Bhai", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-14", area: "SECTOR-4-A" },
  { username: "earthnet153", full_name: "Mr Abrar", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earth121", full_name: "Mr Umair", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "j.net-9", full_name: "Zubair", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earthnet314", full_name: "Mr irfan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earthnet770", full_name: "Mr Nabeel", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earth102", full_name: "Sheikh", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "earthnet115", full_name: "Mr umais", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "earthnet454", full_name: "Mr Abdul Rehman", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "earthnet335", full_name: "Mr Tariq", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "earthnet106", full_name: "Mohommad Akram khan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "earthnet805", full_name: "Mr Sharukh", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnet152", full_name: "Mr Syed Hamza Ali", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-04", area: "SECTOR-4-A" },
  { username: "earthnet104", full_name: "Mosin Hasan Khan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "j.net-00", full_name: "mohammad imran", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-04", area: "SECTOR-4-A" },
  { username: "rehan-a14", full_name: "Rehan muzamil", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-24", area: "SECTOR-4-A" },
  { username: "earth106", full_name: "Mr Raheel", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-02", area: "SECTOR-4-A" },
  { username: "5d05", full_name: "Sunny Mother", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnet466", full_name: "Mr Mansoor", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "earthnet1091", full_name: "Mr Hameed sariki", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-01", area: "SECTOR-4-A" },
  { username: "earthnet930", full_name: "Imran shamsi", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earth113", full_name: "Mr khanis", status: "Active", package: "ABB-Diamond", bandwidth: "32", expiry_date: "2026-03-02", area: "SECTOR-4-A" },
  { username: "earth011", full_name: "Gulreez", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "earth72", full_name: "Al barka", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnet499", full_name: "Mr Misfar", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnet101", full_name: "Mr Sualeh", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "enl200", full_name: "Mr abdullah", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-01", area: "SECTOR-4-A" },
  { username: "earthnet289", full_name: "Danish", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "earthnet1551", full_name: "Mr Yasir", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "earth115", full_name: "faiz hussain", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnwt279", full_name: "Zuber", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "earthnet156", full_name: "Muhammad kamran", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "earthnet1031", full_name: "Mr mosin", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet905", full_name: "Mr Saif dog", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet114", full_name: "Muhammad Yusuf Jafrani", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet246", full_name: "Naeem Baig", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet6071", full_name: "Sirfraz Ahmed", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "enl124", full_name: "Mr ahtasham", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet108", full_name: "Mr Anjum", status: "Active", package: "ABB-Platinum", bandwidth: "27", expiry_date: "2026-02-26", area: "SECTOR-4-A" },
  { username: "earth123", full_name: "Mr faheem", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "mz20", full_name: "Tariq mama", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "earthnet107", full_name: "Mr Arsalan Tile", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-25", area: "SECTOR-4-A" },
  { username: "enl204", full_name: "Hassan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-25", area: "SECTOR-4-A" },
  { username: "earthnet117", full_name: "Mr Waqas", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-25", area: "SECTOR-4-A" },
  { username: "enl106", full_name: "Mr sajad", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-24", area: "SECTOR-4-A" },
  { username: "enl391", full_name: "Kamran", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "earthnet244", full_name: "Mr usman", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-24", area: "SECTOR-4-A" },
  { username: "rizwan312", full_name: "Mr B-2 Flat", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-24", area: "SECTOR-4-A" },
  { username: "r99", full_name: "Nargis", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-24", area: "SECTOR-4-A" },
  { username: "earthnet227", full_name: "Mr Danish Ali", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "enl672", full_name: "zaiya", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "earthnet001", full_name: "Umair hashmi", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-26", area: "SECTOR-4-A" },
  { username: "zaki786", full_name: "Zaki", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-23", area: "SECTOR-4-A" },
  { username: "raza1275", full_name: "Mr Faheem", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "earth84", full_name: "Mr azwar", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "earthnet764", full_name: "Mr Nomi Bhai Police", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-21", area: "SECTOR-4-A" },
  { username: "earthnet300", full_name: "Mr bilal", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "earth75", full_name: "Mr Amjad Rafi", status: "Active", package: "ABB-Titanium", bandwidth: "52", expiry_date: "2026-03-02", area: "SECTOR-4-A" },
  { username: "earthnet223", full_name: "mr Bilawal", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-20", area: "SECTOR-4-A" },
  { username: "enl670", full_name: "Mr Ejaz", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-24", area: "SECTOR-4-A" },
  { username: "earthnet1441", full_name: "Mr imran Arshad w", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-21", area: "SECTOR-4-A" },
  { username: "earthnet225", full_name: "Mr Mohsin", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "enl213", full_name: "Mr jamshed", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-02-25", area: "SECTOR-4-A" },
  { username: "j.net-100", full_name: "Mr Ayan", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-21", area: "SECTOR-4-A" },
  { username: "j.net-1020", full_name: "Ab Rehman", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-23", area: "SECTOR-4-A" },
  { username: "j.net-48", full_name: "Shan", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-28", area: "SECTOR-4-A" },
  { username: "j.net-13", full_name: "Saim rao", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-05", area: "SECTOR-4-A" },
  { username: "J.net-1009", full_name: "Shani", status: "Active", package: "ABB-Gold", bandwidth: "22", expiry_date: "2026-03-09", area: "SECTOR-4-A" },
  { username: "j.net55", full_name: "Sheriyar warsi", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "j.net1", full_name: "Mosin", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-12", area: "SECTOR-4-A" },
  { username: "j.net-54", full_name: "M azeem", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-12", area: "SECTOR-4-A" },
  { username: "j.net44", full_name: "Ali police ", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-02-27", area: "SECTOR-4-A" },
  { username: "j.net-38", full_name: "M Zain ", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-22", area: "SECTOR-4-A" },
  { username: "j.net-10", full_name: "Zainul", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-18", area: "SECTOR-4-A" },
  { username: "j.net1031", full_name: "Sharry", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-14", area: "SECTOR-4-A" },
  { username: "j.net110", full_name: "Owais", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "j.net51", full_name: "Khurram", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "j.net1025", full_name: "Hadir ali", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
  { username: "j.net-101", full_name: "Talha Nadeem", status: "Active", package: "ABB-Platinum", bandwidth: "27", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "j.net80", full_name: "Abdul ahhad", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-03", area: "SECTOR-4-A" },
  { username: "j.net27", full_name: "M haris", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-12", area: "SECTOR-4-A" },
  { username: "j.net1049", full_name: "Amir", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "J.net1013", full_name: "M aaman", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-09", area: "SECTOR-4-A" },
  { username: "j.net98", full_name: "Mr Shoib", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-20", area: "SECTOR-4-A" },
  { username: "j.net47", full_name: "mohammad", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-17", area: "SECTOR-4-A" },
  { username: "j.net3", full_name: "In Shah ali", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-08", area: "SECTOR-4-A" },
  { username: "J.net1015", full_name: "Saqib", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-21", area: "SECTOR-4-A" },
  { username: "enl211", full_name: "Mr Mobbahat ", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-16", area: "SECTOR-4-A" },
  { username: "earthnet910", full_name: "Umair ", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-15", area: "SECTOR-4-A" },
  { username: "earth37", full_name: "Mr Haseeb R-104", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-10", area: "SECTOR-4-A" },
  { username: "earthnet485", full_name: "Mr Hamza L-1319", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-06", area: "SECTOR-4-A" },
  { username: "earthnet143", full_name: "Mr Osama Chacha R-59", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-04", area: "SECTOR-4-A" },
  { username: "earthnet110", full_name: "Mr Mohsin Mansoori L 123", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-02", area: "SECTOR-4-A" },
  { username: "earthnet803", full_name: "Mr Faiz ", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-02", area: "SECTOR-4-A" },
  { username: "earthnet1204", full_name: "Mr adnan ", status: "Active", package: "ABB-Bronze", bandwidth: "12", expiry_date: "2026-03-04", area: "SECTOR-4-A" },
  { username: "earthnet444", full_name: "Mr Raheel", status: "Active", package: "ABB-Silver", bandwidth: "17", expiry_date: "2026-03-11", area: "SECTOR-4-A" },
];

const checkEmpty = db.prepare("SELECT count(*) as count FROM isp_customers").get() as any;
if (checkEmpty.count === 0) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO isp_customers (username, full_name, status, package, bandwidth, expiry_date, area)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const transaction = db.transaction((data) => {
    for (const item of data) {
      insert.run(item.username, item.full_name, item.status, item.package, item.bandwidth, item.expiry_date, item.area);
    }
  });
  
  transaction(initialData);
  console.log("Database seeded with initial data.");
}

const PRICING = {
  "12 MB": { company: 485, my: 1200 },
  "17 MB": { company: 535, my: 1400 },
  "22 MB": { company: 625, my: 1800 },
  "27 MB": { company: 710, my: 2500 },
  "32 MB": { company: 810, my: 3500 },
  "52 MB": { company: 1950, my: 5000 },
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.post("/api/upload-csv", (req, res) => {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const insert = db.prepare(`
      INSERT INTO isp_customers (
        username, full_name, status, package, bandwidth, expiry_date, area, address, mobile_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET
        full_name = excluded.full_name,
        status = excluded.status,
        package = excluded.package,
        bandwidth = excluded.bandwidth,
        expiry_date = excluded.expiry_date,
        area = excluded.area,
        address = excluded.address,
        mobile_number = excluded.mobile_number
    `);

    const transaction = db.transaction((customers) => {
      for (const customer of customers) {
        if (!customer.username) continue;
        insert.run(
          customer.username,
          customer.full_name || "",
          customer.status || "",
          customer.package || "",
          customer.bandwidth || "",
          customer.expiry_date || "",
          customer.area || "",
          customer.address || "",
          customer.mobile_number || ""
        );
      }
    });

    try {
      transaction(data);
      res.json({ success: true, count: data.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to upload data" });
    }
  });

  app.get("/api/stats", (req, res) => {
    const customers = db.prepare("SELECT * FROM isp_customers").all();
    const now = new Date("2026-02-28"); // Current system date as per prompt
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const stats = {
      totalActive: 0,
      totalTerminated: 0,
      paidCount: 0,
      pendingCount: 0,
      paidProfit: 0,
      pendingProfit: 0,
      totalCollected: 0, // Total from users
      bandwidthStats: {} as Record<string, { count: number; profit: number; companyPayable: number; paid: number; pending: number }>,
      areaStats: {} as Record<string, number>,
      totalProfit: 0, // My Profit
      totalCompanyPayable: 0, // Company Share
      totalPendingBalance: 0, // Total money owed by customers
    };

    customers.forEach((c: any) => {
      stats.totalPendingBalance += (c.pending_balance || 0);
      const status = c.status.toLowerCase();
      if (status === "active" || status === "inactive on expiry") {
        if (status === "active") stats.totalActive++;
        
        const bw = c.bandwidth + " MB";
        const pricing = (PRICING as any)[bw];
        
        // Payment Logic
        const expiryDate = new Date(c.expiry_date);
        const isPaid = expiryDate.getFullYear() > currentYear || (expiryDate.getFullYear() === currentYear && expiryDate.getMonth() > currentMonth);
        
        if (pricing) {
          if (!stats.bandwidthStats[bw]) {
            stats.bandwidthStats[bw] = { count: 0, profit: 0, companyPayable: 0, paid: 0, pending: 0 };
          }
          stats.bandwidthStats[bw].count++;
          const profit = pricing.my - pricing.company;
          stats.bandwidthStats[bw].profit += profit;
          stats.bandwidthStats[bw].companyPayable += pricing.company;
          
          stats.totalCollected += pricing.my;

          if (isPaid) {
            stats.paidCount++;
            stats.paidProfit += profit;
            stats.bandwidthStats[bw].paid++;
          } else {
            stats.pendingCount++;
            stats.pendingProfit += profit;
            stats.bandwidthStats[bw].pending++;
          }

          stats.totalProfit += profit;
          stats.totalCompanyPayable += pricing.company;
        }

        const area = c.area || "Unknown";
        stats.areaStats[area] = (stats.areaStats[area] || 0) + 1;
      } else if (status === "terminated") {
        stats.totalTerminated++;
      }
    });

    res.json(stats);
  });

  app.get("/api/customers", (req, res) => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    
    const customers = db.prepare(`
      SELECT c.*, p.amount_paid, p.payment_date 
      FROM isp_customers c 
      LEFT JOIN payments p ON c.id = p.customer_id AND p.month = ? AND p.year = ?
    `).all(month, year);
    res.json(customers);
  });

  app.patch("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    const { full_name, area, address, mobile_number, custom_price, expiry_date } = req.body;
    
    try {
      db.prepare(`
        UPDATE isp_customers 
        SET full_name = ?, area = ?, address = ?, mobile_number = ?, custom_price = ?, expiry_date = ? 
        WHERE id = ?
      `).run(full_name, area, address, mobile_number, custom_price, expiry_date, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.post("/api/customers/:id/pay", (req, res) => {
    const { id } = req.params;
    const { amount, date, totalBill } = req.body;
    const now = new Date(date || "2026-02-28");
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
      db.transaction(() => {
        // Record payment
        const existing = db.prepare("SELECT id, amount_paid FROM payments WHERE customer_id = ? AND month = ? AND year = ?").get(id, month, year);
        
        if (existing) {
          // Update existing payment for this month (adding to it)
          const newTotalPaid = (existing as any).amount_paid + (amount || 0);
          db.prepare("UPDATE payments SET amount_paid = ?, payment_date = ? WHERE id = ?")
            .run(newTotalPaid, date || "2026-02-28", (existing as any).id);
          
          // Since we paid more, the pending balance decreases by the amount just received
          db.prepare("UPDATE isp_customers SET pending_balance = pending_balance - ? WHERE id = ?").run(amount || 0, id);
        } else {
          // New payment for this month
          db.prepare("INSERT INTO payments (customer_id, amount_paid, payment_date, month, year) VALUES (?, ?, ?, ?, ?)")
            .run(id, amount || 0, date || "2026-02-28", month, year);
          
          // The debt for this month was 'totalBill'. We paid 'amount'.
          // So the pending balance increases by (totalBill - amount)
          const diff = (totalBill || 0) - (amount || 0);
          db.prepare("UPDATE isp_customers SET pending_balance = pending_balance + ? WHERE id = ?").run(diff, id);
        }
      })();
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to record payment" });
    }
  });

  app.get("/api/pending-report", (req, res) => {
    const now = new Date("2026-02-28");
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get all active customers
    const customers = db.prepare(`
      SELECT c.*, p.amount_paid as last_paid_amount, p.payment_date as last_payment_date
      FROM isp_customers c
      LEFT JOIN (
        SELECT customer_id, amount_paid, payment_date
        FROM payments
        WHERE id IN (SELECT MAX(id) FROM payments GROUP BY customer_id)
      ) p ON c.id = p.customer_id
      WHERE LOWER(c.status) = 'active' OR LOWER(c.status) = 'inactive on expiry' OR c.pending_balance > 0
    `).all();

    const result = customers.map((c: any) => {
      const bw = c.bandwidth + " MB";
      const standardPrice = (PRICING as any)[bw]?.my || 0;
      const monthlyBill = c.custom_price || standardPrice;
      
      // Check if they have paid for the current month
      const hasPaidThisMonth = db.prepare("SELECT id FROM payments WHERE customer_id = ? AND month = ? AND year = ?").get(c.id, month, year);
      
      let totalOwed = c.pending_balance || 0;
      
      // If they haven't paid this month AND their expiry is today or in the past, add current bill
      const expiryDate = new Date(c.expiry_date);
      if (!hasPaidThisMonth && expiryDate <= now && (c.status.toLowerCase() === 'active' || c.status.toLowerCase() === 'inactive on expiry')) {
        totalOwed += monthlyBill;
      }

      return {
        ...c,
        pending_balance: totalOwed
      };
    }).filter(c => c.pending_balance > 0);

    res.json(result);
  });

  app.get("/api/paid-report", (req, res) => {
    const now = new Date("2026-02-28");
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const customers = db.prepare(`
      SELECT c.*, p.amount_paid, p.payment_date
      FROM isp_customers c
      JOIN payments p ON c.id = p.customer_id
      WHERE p.month = ? AND p.year = ? AND c.pending_balance = 0
    `).all(month, year);
    res.json(customers);
  });

  app.get("/api/unpaid-report", (req, res) => {
    const now = new Date("2026-02-28");
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const customers = db.prepare(`
      SELECT c.*
      FROM isp_customers c
      LEFT JOIN payments p ON c.id = p.customer_id AND p.month = ? AND p.year = ?
      WHERE p.id IS NULL AND (LOWER(c.status) = 'active' OR LOWER(c.status) = 'inactive on expiry')
    `).all(month, year);
    res.json(customers);
  });

  app.get("/api/reports", (req, res) => {
    const { date, month, year, startDate, endDate } = req.query;
    
    let query = `
      SELECT p.*, c.username, c.full_name, c.bandwidth, c.area, c.pending_balance
      FROM payments p 
      JOIN isp_customers c ON p.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate && endDate) {
      query += " AND p.payment_date >= ? AND p.payment_date <= ?";
      params.push(startDate, endDate);
    } else if (date) {
      query += " AND p.payment_date = ?";
      params.push(date);
    } else if (month && year) {
      query += " AND p.month = ? AND p.year = ?";
      params.push(month, year);
    }

    const paymentRecords = db.prepare(query).all(...params) as any[];

    let totalCollected = 0;
    let companyShare = 0;
    let myProfit = 0;
    // Calculate total pending from ALL customers
    const now = new Date("2026-02-28");
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();
    
    const allCustomers = db.prepare("SELECT * FROM isp_customers").all();
    let totalPending = 0;
    allCustomers.forEach((c: any) => {
      totalPending += (c.pending_balance || 0);
      
      // If unpaid for current month AND expiry is today or past, add their bill
      const hasPaid = db.prepare("SELECT id FROM payments WHERE customer_id = ? AND month = ? AND year = ?").get(c.id, currMonth, currYear);
      const expiryDate = new Date(c.expiry_date);
      if (!hasPaid && expiryDate <= now && (c.status.toLowerCase() === 'active' || c.status.toLowerCase() === 'inactive on expiry')) {
        const bw = c.bandwidth + " MB";
        const standardPrice = (PRICING as any)[bw]?.my || 0;
        totalPending += (c.custom_price || standardPrice);
      }
    });

    const details = paymentRecords.map(p => {
      const bw = p.bandwidth + " MB";
      const pricing = (PRICING as any)[bw];
      const company = pricing ? pricing.company : 0;
      const profit = p.amount_paid - company;

      totalCollected += p.amount_paid;
      companyShare += company;
      myProfit += profit;

      return {
        ...p,
        total: p.amount_paid,
        company,
        profit
      };
    });

    res.json({
      totalCollected,
      companyShare,
      myProfit,
      totalPending,
      userCount: paymentRecords.length,
      details
    });
  });

  // Vite middleware for development
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
