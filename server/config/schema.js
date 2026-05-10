const pool = require('./database');
const mysql = require('mysql2/promise');

const ADMIN_EMAILS = [
  'punam.papri@gmail.com',
  'rebekasultanaorce455@gmail.com'
];

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS torisom_db`);
    await connection.query(`USE torisom_db`);

    await connection.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      profile_pic VARCHAR(500) DEFAULT '',
      phone VARCHAR(20) DEFAULT '',
      address TEXT,
      is_verified TINYINT(1) DEFAULT 0,
      role ENUM('user','admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    try {
      await connection.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT ""');
      await connection.query('ALTER TABLE users ADD COLUMN address TEXT');
    } catch (e) {
      // Columns might already exist, ignore errors safely
    }

    await connection.query(`CREATE TABLE IF NOT EXISTS divisions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS districts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      division_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE CASCADE,
      UNIQUE KEY unique_dist_div (name, division_id)
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS spots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      district_id INT,
      division_id INT,
      category VARCHAR(100) DEFAULT 'General',
      description TEXT,
      history TEXT,
      image VARCHAR(500) DEFAULT '',
      budget_category ENUM('Low','High') DEFAULT 'Low',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL,
      FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      spot_id INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS saved_spots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      spot_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_spot (user_id, spot_id)
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('hotel', 'guide', 'package') NOT NULL,
      target_name VARCHAR(255) NOT NULL,
      price INT DEFAULT 0,
      booking_date DATE,
      status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS guides (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      experience VARCHAR(100) DEFAULT '',
      rating DECIMAL(2,1) DEFAULT 0.0,
      languages VARCHAR(255) DEFAULT '',
      specialties VARCHAR(255) DEFAULT '',
      price INT DEFAULT 0,
      contact VARCHAR(255) DEFAULT '',
      spot_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE SET NULL
    )`);

    await connection.query(`CREATE TABLE IF NOT EXISTS otp_verifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(128) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure existing databases can store hashed OTP values.
    await connection.query(`ALTER TABLE otp_verifications MODIFY COLUMN otp VARCHAR(128) NOT NULL`);

    await connection.query(`CREATE TABLE IF NOT EXISTS otp_attempt_limits (
      email VARCHAR(255) PRIMARY KEY,
      failed_attempts INT NOT NULL DEFAULT 0,
      window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      blocked_until TIMESTAMP NULL DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    console.log('All tables created');

    const [divRows] = await connection.query('SELECT COUNT(*) as count FROM divisions');
    if (divRows[0].count === 0) {
      const divisions = ['Dhaka','Chattogram','Sylhet','Rangpur','Barishal','Jessore','Rajshahi','Mymensingh'];
      for (const name of divisions) {
        await connection.query('INSERT INTO divisions (name) VALUES (?)', [name]);
      }
      console.log('Divisions seeded');
    }

    const [distRows] = await connection.query('SELECT COUNT(*) as count FROM districts');
    if (distRows[0].count === 0) {
      const districtMap = {
        'Dhaka': ['Dhaka','Narayanganj','Gazipur','Manikganj','Munshiganj','Narsingdi'],
        'Chattogram': ['Chittagong',"Cox's Bazar",'Rangamati','Bandarban','Khagrachhari','Comilla','Feni','Noakhali'],
        'Sylhet': ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
        'Rangpur': ['Rangpur','Dinajpur','Kurigram','Lalmonirhat','Nilphamari','Gaibandha','Thakurgaon','Panchagarh'],
        'Barishal': ['Barishal','Patuakhali','Barguna','Jhalokati','Pirojpur','Bhola'],
        'Jessore': ['Jessore','Khulna','Satkhira','Bagerhat','Narail','Magura','Jhenaidah','Chuadanga','Kushtia','Meherpur'],
        'Rajshahi': ['Rajshahi','Natore','Naogaon','Chapainawabganj','Pabna','Bogra','Joypurhat','Sirajganj'],
        'Mymensingh': ['Mymensingh','Jamalpur','Sherpur','Netrokona','Kishoreganj','Tangail']
      };
      const [allDivs] = await connection.query('SELECT id, name FROM divisions');
      const divMap = {};
      allDivs.forEach(d => { divMap[d.name] = d.id; });
      for (const [divName, districts] of Object.entries(districtMap)) {
        const divId = divMap[divName];
        if (!divId) continue;
        for (const distName of districts) {
          await connection.query('INSERT INTO districts (name, division_id) VALUES (?, ?)', [distName, divId]);
        }
      }
      console.log('Districts seeded');
    }

    const [spotRows] = await connection.query('SELECT COUNT(*) as count FROM spots');
    if (spotRows[0].count === 0) {
      const [allDistricts] = await connection.query('SELECT id, name FROM districts');
      const [allDivs] = await connection.query('SELECT id, name FROM divisions');
      const distMap = {}; allDistricts.forEach(d => { distMap[d.name] = d.id; });
      const divMap = {}; allDivs.forEach(d => { divMap[d.name] = d.id; });

      const spots = [
        {name:"Cox's Bazar Beach",district:"Cox's Bazar",division:'Chattogram',category:'Beach',description:"The world's longest natural beach stretching 120 km along the Bay of Bengal.",history:"Discovered in 1798 by British officer Captain Hiram Cox.",image:"Coxs bazar.jpg",budget:'Low'},
        {name:'Sundarbans',district:'Khulna',division:'Jessore',category:'Wildlife',description:'Largest mangrove forest in the world, home to the Royal Bengal Tiger.',history:'Declared a UNESCO World Heritage Site in 1997.',image:'Sundarban_Tiger.jpg',budget:'Low'},
        {name:'Saint Martin Island',district:"Cox's Bazar",division:'Chattogram',category:'Island',description:'A small island with pristine beaches and coral reefs.',history:'Originally known as Narikel Jinjira (Coconut Island).',image:'Saint martin.jpg',budget:'Low'},
        {name:'Rangamati',district:'Rangamati',division:'Chattogram',category:'Mountain',description:'Scenic hill tracts with beautiful waterfalls and tribal culture.',history:'Established as an administrative center in 1860.',image:'Rangamati.jpg',budget:'Low'},
        {name:'Bandarban',district:'Bandarban',division:'Chattogram',category:'Mountain',description:'Adventure destination with trekking trails and indigenous villages.',history:'Bandarban was historically part of the Arakan Kingdom.',image:'Bandarban.jpg',budget:'Low'},
        {name:'Sylhet Tea Gardens',district:'Sylhet',division:'Sylhet',category:'Nature',description:'Vast green tea estates across rolling hills.',history:'Tea cultivation began in Sylhet in 1849.',image:'tea garden.jpg',budget:'Low'},
        {name:'Sreemangal',district:'Moulvibazar',division:'Sylhet',category:'Nature',description:'Center of tea and rubber plantations with eco-tourism.',history:'Known as the Tea Capital of Bangladesh.',image:'SRIMANGAL.jpg',budget:'Low'},
        {name:'Jaflong',district:'Sylhet',division:'Sylhet',category:'Nature',description:'A picturesque location with stone mines and local flora.',history:'Jaflong has been a significant trading post for centuries.',image:'Jaflang.jpg',budget:'Low'},
        {name:'Lawachara National Park',district:'Moulvibazar',division:'Sylhet',category:'Wildlife',description:'Rainforest sanctuary with diverse bird species and hiking trails.',history:'Established in 1996 as a national park.',image:'LAWYACHORA GARDEN.jpg',budget:'Low'},
        {name:'Kuakata Beach',district:'Patuakhali',division:'Barishal',category:'Beach',description:'Beautiful beach where you can see both sunrise and sunset.',history:'Kuakata gets its name from Kua (well) dug by early Rakhine settlers.',image:'Kuyakata.jpg',budget:'Low'},
        {name:'Chittagong Hill Tracts',district:'Chittagong',division:'Chattogram',category:'Mountain',description:'Scenic mountainous area with waterfalls and tribal heritage.',history:'Inhabited by indigenous tribes for over 2,000 years.',image:'Chittagong hill tracks.jpg',budget:'Low'},
        {name:'Sonargaon',district:'Narayanganj',division:'Dhaka',category:'Historical',description:'Historic city with traditional architecture and folk art museum.',history:'The ancient capital of Bengal from the 13th to 16th century.',image:'Sonargaon .jpg',budget:'Low'},
        {name:'Lalbagh Fort',district:'Dhaka',division:'Dhaka',category:'Historical',description:'Mughal-era fortress showcasing rich architectural heritage.',history:'Built in 1678 by Prince Azam Shah.',image:'Lalbagh fort.jpg',budget:'Low'},
        {name:'Ahsan Manzil',district:'Dhaka',division:'Dhaka',category:'Historical',description:'Stunning palace complex from the 19th century.',history:'Built in 1872 by Nawab Abdul Gani.',image:'ahsan-monjil.jpg',budget:'Low'},
        {name:'Nilgiri',district:'Bandarban',division:'Chattogram',category:'Mountain',description:'Mountain resort with panoramic views and trekking.',history:'Sacred site for indigenous tribes for centuries.',image:'Nilgiri.jpg',budget:'High'},
        {name:'Ramsagar National Park',district:'Dinajpur',division:'Rangpur',category:'Wildlife',description:'Historic natural park with scenic lake and botanical gardens.',history:'The Ramsagar Lake was constructed in 1750-1758.',image:'Ramsagar national park.jpg',budget:'Low'},
        {name:'Bisnakandi',district:'Sylhet',division:'Sylhet',category:'Nature',description:'Scenic area with stone-laden streams and natural beauty.',history:'Center of stone trade for centuries.',image:'Bishankandi-4.jpg',budget:'Low'},
        {name:"Foy's Lake",district:'Chittagong',division:'Chattogram',category:'Lake',description:'Artificial lake surrounded by hills.',history:"Created in 1924 by the British.",image:'Foys lake.jpg',budget:'Low'},
        {name:'Patenga Beach',district:'Chittagong',division:'Chattogram',category:'Beach',description:'Popular beach near Chittagong with maritime views.',history:'Patenga has been a crucial maritime port for centuries.',image:'Potenga sea Beach .jpg',budget:'Low'},
        {name:'Tajhat Palace',district:'Rangpur',division:'Rangpur',category:'Historical',description:'Magnificent Raj-era palace with impressive architecture.',history:'Built in the early 20th century by Maharaja Kumar Gopal Lal Roy.',image:'Tazhat palace.jpg',budget:'Low'}
      ];

      for (const s of spots) {
        await connection.query(
          'INSERT INTO spots (name,district_id,division_id,category,description,history,image,budget_category) VALUES (?,?,?,?,?,?,?,?)',
          [s.name, distMap[s.district]||null, divMap[s.division]||null, s.category, s.description, s.history, s.image, s.budget]
        );
      }
      console.log('Spots seeded');
    }

    const [guideRows] = await connection.query('SELECT COUNT(*) as count FROM guides');
    if (guideRows[0].count === 0) {
      const [allSpots] = await connection.query('SELECT id, name FROM spots');
      const spotMap = {}; allSpots.forEach(s => { spotMap[s.name] = s.id; });
      const guides = [
        {name:'Rahman Khan',experience:'5 years',rating:4.7,languages:'Bengali, English, Hindi',specialties:'History, Culture, Photography',price:5500,contact:'+880 1711-123456',spot:"Cox's Bazar Beach"},
        {name:'Amina Begum',experience:'3 years',rating:4.5,languages:'Bengali, English',specialties:'Nature, Wildlife, Trekking',price:4400,contact:'+880 1812-234567',spot:'Sundarbans'},
        {name:'Mohammed Ali',experience:'7 years',rating:4.9,languages:'Bengali, English, Arabic',specialties:'Religious Sites, Architecture',price:6600,contact:'+880 1913-345678',spot:'Lalbagh Fort'},
        {name:'Fatima Rahman',experience:'4 years',rating:4.6,languages:'Bengali, English, Chakma',specialties:'Hill Trekking, Indigenous Culture',price:5000,contact:'+880 1614-456789',spot:'Rangamati'},
        {name:'Karim Uddin',experience:'6 years',rating:4.8,languages:'Bengali, English, Manipuri',specialties:'Tea Gardens, Eco-tourism',price:4800,contact:'+880 1715-567890',spot:'Sylhet Tea Gardens'},
        {name:'Nasreen Akter',experience:'2 years',rating:4.3,languages:'Bengali, English',specialties:'Beach Tours, Water Sports',price:3500,contact:'+880 1816-678901',spot:'Saint Martin Island'}
      ];
      for (const g of guides) {
        await connection.query(
          'INSERT INTO guides (name,experience,rating,languages,specialties,price,contact,spot_id) VALUES (?,?,?,?,?,?,?,?)',
          [g.name,g.experience,g.rating,g.languages,g.specialties,g.price,g.contact,spotMap[g.spot]||null]
        );
      }
      console.log('Guides seeded');
    }

    console.log('Database initialization complete');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS torisom_db');
  } finally {
    await connection.end();
  }
}

module.exports = { initializeDatabase, ensureDatabaseExists, ADMIN_EMAILS };