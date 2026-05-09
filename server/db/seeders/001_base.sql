INSERT IGNORE INTO roles (name) VALUES ('admin'), ('user');

INSERT IGNORE INTO districts (name, division) VALUES
('Dhaka', 'Dhaka'),
('Cox''s Bazar', 'Chattogram'),
('Khulna', 'Khulna'),
('Rangamati', 'Chattogram'),
('Bandarban', 'Chattogram'),
('Sylhet', 'Sylhet'),
('Moulvibazar', 'Sylhet'),
('Patuakhali', 'Barishal'),
('Chittagong', 'Chattogram'),
('Narayanganj', 'Dhaka'),
('Dinajpur', 'Rangpur'),
('Rangpur', 'Rangpur');

INSERT IGNORE INTO categories (name) VALUES
('Beach'),
('Wildlife'),
('Island'),
('Mountain'),
('Nature'),
('Historical'),
('Lake');

INSERT IGNORE INTO spots (name, district_id, category_id, description, history, image_url, is_active)
VALUES
('Cox''s Bazar Beach', (SELECT id FROM districts WHERE name='Cox''s Bazar'), (SELECT id FROM categories WHERE name='Beach'), 'The world''s longest natural beach stretching 120 km along the Bay of Bengal.', 'Discovered in 1798 by British officer Captain Hiram Cox, this beach gets its name from him.', NULL, 1),
('Sundarbans', (SELECT id FROM districts WHERE name='Khulna'), (SELECT id FROM categories WHERE name='Wildlife'), 'Largest mangrove forest in the world, home to the Royal Bengal Tiger.', 'Declared a UNESCO World Heritage Site in 1997.', NULL, 1),
('Saint Martin Island', (SELECT id FROM districts WHERE name='Cox''s Bazar'), (SELECT id FROM categories WHERE name='Island'), 'A small island with pristine beaches and coral reefs perfect for diving.', 'Originally known as Narikel Jinjira.', NULL, 1),
('Rangamati', (SELECT id FROM districts WHERE name='Rangamati'), (SELECT id FROM categories WHERE name='Mountain'), 'Scenic hill tracts with beautiful waterfalls and tribal culture.', 'Established as an administrative center in 1860 by the British.', NULL, 1),
('Bandarban', (SELECT id FROM districts WHERE name='Bandarban'), (SELECT id FROM categories WHERE name='Mountain'), 'Adventure destination with trekking trails and indigenous villages.', 'Historically part of the Arakan Kingdom.', NULL, 1),
('Sylhet Tea Gardens', (SELECT id FROM districts WHERE name='Sylhet'), (SELECT id FROM categories WHERE name='Nature'), 'Vast green tea estates across rolling hills.', 'Tea cultivation began in 1849.', NULL, 1),
('Sreemangal', (SELECT id FROM districts WHERE name='Moulvibazar'), (SELECT id FROM categories WHERE name='Nature'), 'Center of tea and rubber plantations with eco-tourism activities.', 'Known as the Tea Capital of Bangladesh.', NULL, 1),
('Jaflong', (SELECT id FROM districts WHERE name='Sylhet'), (SELECT id FROM categories WHERE name='Nature'), 'A picturesque location with stone mines and local flora.', 'Significant trading post for centuries.', NULL, 1),
('Lawachara National Park', (SELECT id FROM districts WHERE name='Moulvibazar'), (SELECT id FROM categories WHERE name='Wildlife'), 'Rainforest sanctuary with diverse bird species and hiking trails.', 'Established in 1996.', NULL, 1),
('Kuakata Beach', (SELECT id FROM districts WHERE name='Patuakhali'), (SELECT id FROM categories WHERE name='Beach'), 'Beautiful beach where you can see both sunrise and sunset.', 'Named after wells dug by early settlers.', NULL, 1),
('Chittagong Hill Tracts', (SELECT id FROM districts WHERE name='Chittagong'), (SELECT id FROM categories WHERE name='Mountain'), 'Scenic mountainous area with waterfalls and tribal heritage.', 'Inhabited by indigenous tribes for over 2,000 years.', NULL, 1),
('Sonargaon', (SELECT id FROM districts WHERE name='Narayanganj'), (SELECT id FROM categories WHERE name='Historical'), 'Historic city with traditional architecture and folk art museum.', 'Ancient capital of Bengal.', NULL, 1),
('Lalbagh Fort', (SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM categories WHERE name='Historical'), 'Mughal-era fortress showcasing rich architectural heritage.', 'Built in 1678 by Prince Azam Shah.', NULL, 1),
('Ahsan Manzil', (SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM categories WHERE name='Historical'), 'Stunning palace complex from the 19th century.', 'Built in 1872 by Nawab Abdul Gani.', NULL, 1),
('Nilgiri', (SELECT id FROM districts WHERE name='Bandarban'), (SELECT id FROM categories WHERE name='Mountain'), 'Mountain resort with panoramic views and trekking opportunities.', 'Sacred site for indigenous tribes.', NULL, 1),
('Ramsagar National Park', (SELECT id FROM districts WHERE name='Dinajpur'), (SELECT id FROM categories WHERE name='Wildlife'), 'Historic natural park with scenic lake and botanical gardens.', 'Ramsagar lake built in 1750-1758.', NULL, 1),
('Bisnakandi', (SELECT id FROM districts WHERE name='Sylhet'), (SELECT id FROM categories WHERE name='Nature'), 'Scenic area with stone-laden streams and natural beauty.', 'Center of stone trade for centuries.', NULL, 1),
('Foy''s Lake', (SELECT id FROM districts WHERE name='Chittagong'), (SELECT id FROM categories WHERE name='Lake'), 'Artificial lake surrounded by hills, ideal for water activities.', 'Created in 1924 by the British.', NULL, 1),
('Patenga Beach', (SELECT id FROM districts WHERE name='Chittagong'), (SELECT id FROM categories WHERE name='Beach'), 'Popular beach near Chittagong with maritime views.', 'Crucial maritime port region for centuries.', NULL, 1),
('Tajhat Palace', (SELECT id FROM districts WHERE name='Rangpur'), (SELECT id FROM categories WHERE name='Historical'), 'Magnificent Raj-era palace with impressive architecture.', 'Built in early 20th century.', NULL, 1);

INSERT IGNORE INTO guides (name, district_id, experience_years, price_per_day, rating_avg, is_available) VALUES
('Rahman Khan', (SELECT id FROM districts WHERE name='Cox''s Bazar'), 5, 5500, 4.70, 1),
('Amina Begum', (SELECT id FROM districts WHERE name='Sylhet'), 3, 4400, 4.50, 1),
('Mohammed Ali', (SELECT id FROM districts WHERE name='Dhaka'), 7, 6600, 4.90, 1);

INSERT IGNORE INTO guide_languages (guide_id, language)
SELECT id, 'Bengali' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'English' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'Hindi' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'Bengali' FROM guides WHERE name='Amina Begum'
UNION ALL SELECT id, 'English' FROM guides WHERE name='Amina Begum'
UNION ALL SELECT id, 'Bengali' FROM guides WHERE name='Mohammed Ali'
UNION ALL SELECT id, 'English' FROM guides WHERE name='Mohammed Ali'
UNION ALL SELECT id, 'Arabic' FROM guides WHERE name='Mohammed Ali'
UNION ALL SELECT id, 'Urdu' FROM guides WHERE name='Mohammed Ali';

INSERT IGNORE INTO guide_specialties (guide_id, specialty)
SELECT id, 'History' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'Culture' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'Photography' FROM guides WHERE name='Rahman Khan'
UNION ALL SELECT id, 'Nature' FROM guides WHERE name='Amina Begum'
UNION ALL SELECT id, 'Wildlife' FROM guides WHERE name='Amina Begum'
UNION ALL SELECT id, 'Trekking' FROM guides WHERE name='Amina Begum'
UNION ALL SELECT id, 'Religious Sites' FROM guides WHERE name='Mohammed Ali'
UNION ALL SELECT id, 'Architecture' FROM guides WHERE name='Mohammed Ali'
UNION ALL SELECT id, 'Local History' FROM guides WHERE name='Mohammed Ali';

INSERT IGNORE INTO hotels (name, district_id, hotel_type, price_per_night, rating_avg, is_active) VALUES
('Sea Pearl Resort', (SELECT id FROM districts WHERE name='Cox''s Bazar'), 'Resort', 8500, 4.50, 1),
('Dhaka Grand Hotel', (SELECT id FROM districts WHERE name='Dhaka'), 'Business', 6200, 4.30, 1),
('Sylhet Eco Stay', (SELECT id FROM districts WHERE name='Sylhet'), 'Eco-Resort', 5200, 4.20, 1),
('Bandarban Hill View', (SELECT id FROM districts WHERE name='Bandarban'), 'Boutique', 7000, 4.40, 1);

INSERT IGNORE INTO hotel_features (hotel_id, feature)
SELECT id, 'WiFi' FROM hotels WHERE name='Sea Pearl Resort'
UNION ALL SELECT id, 'Pool' FROM hotels WHERE name='Sea Pearl Resort'
UNION ALL SELECT id, 'Sea View' FROM hotels WHERE name='Sea Pearl Resort'
UNION ALL SELECT id, 'WiFi' FROM hotels WHERE name='Dhaka Grand Hotel'
UNION ALL SELECT id, 'Conference Room' FROM hotels WHERE name='Dhaka Grand Hotel'
UNION ALL SELECT id, 'Airport Shuttle' FROM hotels WHERE name='Dhaka Grand Hotel'
UNION ALL SELECT id, 'WiFi' FROM hotels WHERE name='Sylhet Eco Stay'
UNION ALL SELECT id, 'Nature View' FROM hotels WHERE name='Sylhet Eco Stay'
UNION ALL SELECT id, 'Breakfast' FROM hotels WHERE name='Sylhet Eco Stay'
UNION ALL SELECT id, 'WiFi' FROM hotels WHERE name='Bandarban Hill View'
UNION ALL SELECT id, 'Mountain View' FROM hotels WHERE name='Bandarban Hill View'
UNION ALL SELECT id, '24/7 Power Backup' FROM hotels WHERE name='Bandarban Hill View';

INSERT IGNORE INTO routes (origin_district_id, destination_district_id, transport_type, provider_name, duration_text, price_text)
VALUES
((SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM districts WHERE name='Cox''s Bazar'), 'Bus', 'Green Line Paribahan', '10-12 hours', '৳1200-1800'),
((SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM districts WHERE name='Cox''s Bazar'), 'Flight', 'US-Bangla Airlines', '1 hour', '৳4500-9000'),
((SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM districts WHERE name='Sylhet'), 'Train', 'Bangladesh Railway', '6-7 hours', '৳350-1200'),
((SELECT id FROM districts WHERE name='Dhaka'), (SELECT id FROM districts WHERE name='Bandarban'), 'Bus', 'Hanif Enterprise', '8-10 hours', '৳900-1500');
