import type { Owner } from "./types";

/* ── เจ้าของสัตว์เลี้ยง 24 ราย — สัมพันธ์กับทะเบียนสัตว์ 48 ตัวใน index.ts ── */
export const OWNERS: Owner[] = [
  {
    id: 1, name: "สมศักดิ์ ใจดี", nickname: "ศักดิ์", gender: "ชาย", phone: "081-234-5678", email: "somsak@email.com",
    lineId: "@somsak", address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", idCard: "1-1001-00001-00-0",
    pets: ["บัดดี้", "ร็อคกี้"], joinDate: "15 ม.ค. 2567", totalVisits: 24,
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2, name: "วรรณา ศรีสุข", nickname: "นุ้ย", gender: "หญิง", phone: "089-876-5432", email: "wanna@email.com",
    lineId: "@wannas", address: "45 ถ.ลาดพร้าว แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900", idCard: "1-1002-00002-00-0",
    pets: ["ลูน่า", "อัลมอนด์"], joinDate: "22 มี.ค. 2567", totalVisits: 14,
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: 3, name: "ประพันธ์ มงคล", nickname: "พันธ์", gender: "ชาย", phone: "062-111-2233", email: "praphan@email.com",
    lineId: "@praphanm", address: "78 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310", idCard: "1-1003-00003-00-0",
    pets: ["แม็กซ์", "โมจิ"], joinDate: "8 พ.ย. 2566", totalVisits: 41,
    photo: "https://randomuser.me/api/portraits/men/53.jpg",
  },
  {
    id: 4, name: "อรอนงค์ พรมเสน", nickname: "อ้อ", gender: "หญิง", phone: "091-444-5566", email: "oranong@email.com",
    lineId: "@oranongg", address: "12 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400", idCard: "1-1004-00004-00-0",
    pets: ["โคโค่", "หิมะ"], joinDate: "1 มิ.ย. 2567", totalVisits: 11,
    photo: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: 5, name: "ธีรพล วงศ์สุวรรณ", nickname: "ไก่", gender: "ชาย", phone: "085-777-8899", email: "teerapon@email.com",
    lineId: "@teeraponw", address: "99 ถ.เจริญนคร แขวงบางลำภูล่าง เขตคลองสาน กรุงเทพฯ 10600", idCard: "1-1005-00005-00-0",
    pets: ["ชาร์ลี", "เดซี่"], joinDate: "14 ส.ค. 2566", totalVisits: 33,
    photo: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    id: 6, name: "ปรียาภรณ์ ทองดี", nickname: "แพร", gender: "หญิง", phone: "094-321-6543", email: "preeyaporn@email.com",
    lineId: "@preeyaphornt", address: "56 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500", idCard: "1-1006-00006-00-0",
    pets: ["เบลล่า", "น้ำตาล"], joinDate: "10 ก.ย. 2567", totalVisits: 9,
    photo: "https://randomuser.me/api/portraits/women/89.jpg",
  },
  {
    id: 7, name: "นภาพร รุ่งเรือง", nickname: "แนน", gender: "หญิง", phone: "091-555-7788", email: "napaporn@email.com",
    lineId: "@napapornr", address: "88 ถ.รัชดาภิเษก แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900", idCard: "1-1007-00007-00-0",
    pets: ["ทวีป", "บลู"], joinDate: "20 ก.พ. 2569", totalVisits: 6,
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 8, name: "ศิริพร แก้วมณี", nickname: "ต่าย", gender: "หญิง", phone: "083-321-6655", email: "siriporn@email.com",
    lineId: "@siripornk", address: "23 ถ.พระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110", idCard: "1-1008-00008-00-0",
    pets: ["มิลค์", "ชีส"], joinDate: "5 ส.ค. 2566", totalVisits: 10,
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 9, name: "กิตติพงษ์ วงษ์ทอง", nickname: "เบียร์", gender: "ชาย", phone: "086-447-2211", email: "kittipong@email.com",
    lineId: "@kittipongw", address: "15 ถ.นวมินทร์ แขวงนวมินทร์ เขตบึงกุ่ม กรุงเทพฯ 10230", idCard: "1-1009-00009-00-0",
    pets: ["ทองคำ", "เงินล้าน"], joinDate: "12 มิ.ย. 2567", totalVisits: 5,
    photo: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    id: 10, name: "ธนากร ชัยชนะ", nickname: "โอ๊ต", gender: "ชาย", phone: "094-882-0033", email: "tanakorn@email.com",
    lineId: "@tanakornc", address: "67 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260", idCard: "1-1010-00010-00-0",
    pets: ["เร็กซ์", "มังกร"], joinDate: "3 ม.ค. 2569", totalVisits: 7,
    photo: "https://randomuser.me/api/portraits/men/91.jpg",
  },
  {
    id: 11, name: "กัญญา สุวรรณ", nickname: "กัญ", gender: "หญิง", phone: "091-678-9012", email: "kanya@email.com",
    lineId: "@kanyas", address: "34 ถ.เพชรบุรี แขวงถนนเพชรบุรี เขตราชเทวี กรุงเทพฯ 10400", idCard: "1-1011-00011-00-0",
    pets: ["มิ้ว", "บันนี่"], joinDate: "18 เม.ย. 2568", totalVisits: 8,
    photo: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: 12, name: "วิชัย มงคล", nickname: "ชัย", gender: "ชาย", phone: "083-456-7890", email: "wichai@email.com",
    lineId: "@wichaim", address: "120 ถ.งามวงศ์วาน แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210", idCard: "1-1012-00012-00-0",
    pets: ["ป๊อบ", "สกาย"], joinDate: "2 ก.ค. 2568", totalVisits: 6,
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 13, name: "อนันต์ ศรีวิไล", nickname: "นันต์", gender: "ชาย", phone: "089-234-1122", email: "anan@email.com",
    lineId: "@anansri", address: "9 ถ.ประชาชื่น แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800", idCard: "1-1013-00013-00-0",
    pets: ["ลัคกี้", "นมสด"], joinDate: "25 พ.ค. 2567", totalVisits: 13,
    photo: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 14, name: "จิราพร บุญมาก", nickname: "จิ", gender: "หญิง", phone: "081-909-3344", email: "jiraporn@email.com",
    lineId: "@jirapornb", address: "77 ถ.เอกมัย แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110", idCard: "1-1014-00014-00-0",
    pets: ["โอเลี้ยง", "ข้าวตู"], joinDate: "30 ต.ค. 2567", totalVisits: 9,
    photo: "https://randomuser.me/api/portraits/women/56.jpg",
  },
  {
    id: 15, name: "สุนิสา แสงทอง", nickname: "นิ", gender: "หญิง", phone: "092-556-7788", email: "sunisa@email.com",
    lineId: "@sunisas", address: "150 ถ.พหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400", idCard: "1-1015-00015-00-0",
    pets: ["มอคค่า", "บอลลูน"], joinDate: "12 ธ.ค. 2568", totalVisits: 5,
    photo: "https://randomuser.me/api/portraits/women/71.jpg",
  },
  {
    id: 16, name: "ปกรณ์ เลิศวิริยะ", nickname: "กรณ์", gender: "ชาย", phone: "084-777-1234", email: "pakorn@email.com",
    lineId: "@pakornl", address: "42 ถ.ราชพฤกษ์ แขวงบางจาก เขตภาษีเจริญ กรุงเทพฯ 10160", idCard: "1-1016-00016-00-0",
    pets: ["ไทเกอร์", "เจลลี่"], joinDate: "7 ก.พ. 2568", totalVisits: 7,
    photo: "https://randomuser.me/api/portraits/men/64.jpg",
  },
  {
    id: 17, name: "รัตนา จันทร์เพ็ญ", nickname: "รัต", gender: "หญิง", phone: "086-321-9900", email: "rattana@email.com",
    lineId: "@rattanaj", address: "88/12 ถ.ติวานนท์ ต.ตลาดขวัญ อ.เมือง นนทบุรี 11000", idCard: "1-1017-00017-00-0",
    pets: ["ส้มโอ", "เสือน้อย"], joinDate: "19 มิ.ย. 2567", totalVisits: 15,
    photo: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: 18, name: "ชลธิชา อินทร์แก้ว", nickname: "ชล", gender: "หญิง", phone: "095-888-2211", email: "chonticha@email.com",
    lineId: "@chontichai", address: "63 ถ.แจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210", idCard: "1-1018-00018-00-0",
    pets: ["กะทิ", "กีวี่"], joinDate: "28 ส.ค. 2568", totalVisits: 6,
    photo: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    id: 19, name: "มานพ สิงห์โต", nickname: "นพ", gender: "ชาย", phone: "082-445-6677", email: "manop@email.com",
    lineId: "@manops", address: "31 ถ.ศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพฯ 10250", idCard: "1-1019-00019-00-0",
    pets: ["ยูริ", "นีโม่"], joinDate: "16 มี.ค. 2568", totalVisits: 8,
    photo: "https://randomuser.me/api/portraits/men/37.jpg",
  },
  {
    id: 20, name: "พิมพ์ชนก วัฒนกุล", nickname: "พิมพ์", gender: "หญิง", phone: "090-112-3456", email: "pimchanok@email.com",
    lineId: "@pimchanokw", address: "205 ถ.เจริญกรุง แขวงบางคอแหลม เขตบางคอแหลม กรุงเทพฯ 10120", idCard: "1-1020-00020-00-0",
    pets: ["มะลิ", "มุกดา"], joinDate: "4 ม.ค. 2569", totalVisits: 4,
    photo: "https://randomuser.me/api/portraits/women/17.jpg",
  },
  {
    id: 21, name: "สราวุฒิ ตั้งตรงจิตร", nickname: "วุฒิ", gender: "ชาย", phone: "087-654-3210", email: "sarawut@email.com",
    lineId: "@sarawutt", address: "58 ถ.ลาดกระบัง แขวงลาดกระบัง เขตลาดกระบัง กรุงเทพฯ 10520", idCard: "1-1021-00021-00-0",
    pets: ["เรนโบว์", "ซันนี่"], joinDate: "22 ก.ย. 2567", totalVisits: 12,
    photo: "https://randomuser.me/api/portraits/men/58.jpg",
  },
  {
    id: 22, name: "ดวงใจ ประเสริฐ", nickname: "ดวง", gender: "หญิง", phone: "093-210-9876", email: "duangjai@email.com",
    lineId: "@duangjaip", address: "14 ถ.กาญจนาภิเษก แขวงบางแค เขตบางแค กรุงเทพฯ 10160", idCard: "1-1022-00022-00-0",
    pets: ["เพิร์ล", "บอล"], joinDate: "9 พ.ย. 2568", totalVisits: 5,
    photo: "https://randomuser.me/api/portraits/women/82.jpg",
  },
  {
    id: 23, name: "เอกชัย รุ่งโรจน์", nickname: "เอก", gender: "ชาย", phone: "088-999-4455", email: "ekachai@email.com",
    lineId: "@ekachair", address: "99/9 ถ.รามอินทรา แขวงคันนายาว เขตคันนายาว กรุงเทพฯ 10230", idCard: "1-1023-00023-00-0",
    pets: ["ขนุน", "แครอท"], joinDate: "11 เม.ย. 2569", totalVisits: 3,
    photo: "https://randomuser.me/api/portraits/men/14.jpg",
  },
  {
    id: 24, name: "วิภาดา สายทอง", nickname: "วิ", gender: "หญิง", phone: "096-333-8899", email: "wipada@email.com",
    lineId: "@wipadas", address: "27 ถ.สุขสวัสดิ์ แขวงบางปะกอก เขตราษฎร์บูรณะ กรุงเทพฯ 10140", idCard: "1-1024-00024-00-0",
    pets: ["เต่าทอง", "โอริโอ้"], joinDate: "6 พ.ค. 2569", totalVisits: 4,
    photo: "https://randomuser.me/api/portraits/women/38.jpg",
  },
];
