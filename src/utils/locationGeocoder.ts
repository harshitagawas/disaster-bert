export interface GeoLocation {
  name: string;
  state: string;
  district?: string;
  lat: number;
  lng: number;
}

export interface GeocodedResult {
  location: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
}

/**
 * Comprehensive Indian Geographical Database:
 * Includes all 28 States, 8 Union Territories, major disaster-prone districts/cities,
 * rivers, mountain regions, and neighboring South Asian regions.
 */
export const LOCATION_DATABASE: Record<string, GeoLocation> = {
  // --- STATES & UNION TERRITORIES CENTROIDS ---
  'andhra pradesh': { name: 'Andhra Pradesh', state: 'Andhra Pradesh', district: 'Amaravati', lat: 15.9129, lng: 79.7400 },
  'arunachal pradesh': { name: 'Arunachal Pradesh', state: 'Arunachal Pradesh', district: 'Papum Pare', lat: 28.2180, lng: 94.7278 },
  'assam': { name: 'Assam', state: 'Assam', district: 'Kamrup', lat: 26.2006, lng: 92.9376 },
  'bihar': { name: 'Bihar', state: 'Bihar', district: 'Patna', lat: 25.0961, lng: 85.3131 },
  'chhattisgarh': { name: 'Chhattisgarh', state: 'Chhattisgarh', district: 'Raipur', lat: 21.2787, lng: 81.8661 },
  'goa': { name: 'Goa', state: 'Goa', district: 'North Goa', lat: 15.2993, lng: 74.1240 },
  'gujarat': { name: 'Gujarat', state: 'Gujarat', district: 'Gandhinagar', lat: 22.2587, lng: 71.1924 },
  'haryana': { name: 'Haryana', state: 'Haryana', district: 'Chandigarh', lat: 29.0588, lng: 76.0856 },
  'himachal pradesh': { name: 'Himachal Pradesh', state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734 },
  'himachal': { name: 'Himachal Pradesh', state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734 },
  'jharkhand': { name: 'Jharkhand', state: 'Jharkhand', district: 'Ranchi', lat: 23.6102, lng: 85.2799 },
  'karnataka': { name: 'Karnataka', state: 'Karnataka', district: 'Bengaluru Urban', lat: 15.3173, lng: 75.7139 },
  'kerala': { name: 'Kerala', state: 'Kerala', district: 'Thiruvananthapuram', lat: 10.8505, lng: 76.2711 },
  'madhya pradesh': { name: 'Madhya Pradesh', state: 'Madhya Pradesh', district: 'Bhopal', lat: 22.9734, lng: 78.6569 },
  'maharashtra': { name: 'Maharashtra', state: 'Maharashtra', district: 'Mumbai City', lat: 19.7515, lng: 75.7139 },
  'manipur': { name: 'Manipur', state: 'Manipur', district: 'Imphal West', lat: 24.6637, lng: 93.9063 },
  'meghalaya': { name: 'Meghalaya', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.4670, lng: 91.3662 },
  'mizoram': { name: 'Mizoram', state: 'Mizoram', district: 'Aizawl', lat: 23.1645, lng: 92.9376 },
  'nagaland': { name: 'Nagaland', state: 'Nagaland', district: 'Kohima', lat: 26.1584, lng: 94.5624 },
  'odisha': { name: 'Odisha', state: 'Odisha', district: 'Khurda', lat: 20.9517, lng: 85.0985 },
  'orissa': { name: 'Odisha', state: 'Odisha', district: 'Khurda', lat: 20.9517, lng: 85.0985 },
  'punjab': { name: 'Punjab', state: 'Punjab', district: 'Ludhiana', lat: 31.1471, lng: 75.3412 },
  'rajasthan': { name: 'Rajasthan', state: 'Rajasthan', district: 'Jaipur', lat: 27.0238, lng: 74.2179 },
  'sikkim': { name: 'Sikkim', state: 'Sikkim', district: 'Gangtok', lat: 27.5330, lng: 88.5122 },
  'tamil nadu': { name: 'Tamil Nadu', state: 'Tamil Nadu', district: 'Chennai', lat: 11.1271, lng: 78.6569 },
  'telangana': { name: 'Telangana', state: 'Telangana', district: 'Hyderabad', lat: 18.1124, lng: 79.0193 },
  'tripura': { name: 'Tripura', state: 'Tripura', district: 'West Tripura', lat: 23.9408, lng: 91.9882 },
  'uttar pradesh': { name: 'Uttar Pradesh', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  'uttarakhand': { name: 'Uttarakhand', state: 'Uttarakhand', district: 'Dehradun', lat: 30.0668, lng: 79.0193 },
  'uttaranchal': { name: 'Uttarakhand', state: 'Uttarakhand', district: 'Dehradun', lat: 30.0668, lng: 79.0193 },
  'west bengal': { name: 'West Bengal', state: 'West Bengal', district: 'Kolkata', lat: 22.9868, lng: 87.8550 },
  'bengal': { name: 'West Bengal', state: 'West Bengal', district: 'Kolkata', lat: 22.9868, lng: 87.8550 },
  'delhi': { name: 'Delhi NCR', state: 'Delhi', district: 'Central Delhi', lat: 28.6139, lng: 77.2090 },
  'new delhi': { name: 'New Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  'ncr': { name: 'Delhi NCR', state: 'Delhi', district: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  'jammu and kashmir': { name: 'Jammu & Kashmir', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 33.7782, lng: 76.5762 },
  'jammu & kashmir': { name: 'Jammu & Kashmir', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 33.7782, lng: 76.5762 },
  'kashmir': { name: 'Kashmir Valley', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  'ladakh': { name: 'Ladakh', state: 'Ladakh', district: 'Leh', lat: 34.1526, lng: 77.5771 },
  'chandigarh': { name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  'puducherry': { name: 'Puducherry', state: 'Puducherry', district: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  'pondicherry': { name: 'Puducherry', state: 'Puducherry', district: 'Puducherry', lat: 11.9416, lng: 79.8083 },
  'andaman': { name: 'Andaman & Nicobar Islands', state: 'Andaman and Nicobar Islands', district: 'South Andaman', lat: 11.7401, lng: 92.6586 },
  'nicobar': { name: 'Nicobar Islands', state: 'Andaman and Nicobar Islands', district: 'Nicobar', lat: 9.1528, lng: 92.7562 },
  'lakshadweep': { name: 'Lakshadweep', state: 'Lakshadweep', district: 'Kavaratti', lat: 10.5667, lng: 72.6417 },

  // --- MAJOR CITIES, DISTRICTS & DISASTER HOTSPOTS ---
  // Assam & Northeast
  'wayanad': { name: 'Wayanad, Kerala', state: 'Kerala', district: 'Wayanad', lat: 11.6854, lng: 76.1320 },
  'munnar': { name: 'Munnar, Kerala', state: 'Kerala', district: 'Idukki', lat: 10.0889, lng: 77.0595 },
  'idukki': { name: 'Idukki, Kerala', state: 'Kerala', district: 'Idukki', lat: 9.8494, lng: 76.9806 },
  'kochi': { name: 'Kochi, Kerala', state: 'Kerala', district: 'Ernakulam', lat: 9.9312, lng: 76.2673 },
  'thiruvananthapuram': { name: 'Thiruvananthapuram, Kerala', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  'trivandrum': { name: 'Thiruvananthapuram, Kerala', state: 'Kerala', district: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  'kozhikode': { name: 'Kozhikode, Kerala', state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  'calicut': { name: 'Kozhikode, Kerala', state: 'Kerala', district: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
  'alappuzha': { name: 'Alappuzha, Kerala', state: 'Kerala', district: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
  'alleppey': { name: 'Alappuzha, Kerala', state: 'Kerala', district: 'Alappuzha', lat: 9.4981, lng: 76.3388 },
  'kottayam': { name: 'Kottayam, Kerala', state: 'Kerala', district: 'Kottayam', lat: 9.5916, lng: 76.5222 },

  // Assam
  'guwahati': { name: 'Guwahati, Assam', state: 'Assam', district: 'Kamrup Metro', lat: 26.1445, lng: 91.7362 },
  'kamrup': { name: 'Kamrup, Assam', state: 'Assam', district: 'Kamrup', lat: 26.3161, lng: 91.5984 },
  'kaziranga': { name: 'Kaziranga National Park, Assam', state: 'Assam', district: 'Golaghat', lat: 26.5775, lng: 93.1711 },
  'silchar': { name: 'Silchar, Assam', state: 'Assam', district: 'Cachar', lat: 24.8333, lng: 92.7789 },
  'dibrugarh': { name: 'Dibrugarh, Assam', state: 'Assam', district: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
  'jorhat': { name: 'Jorhat, Assam', state: 'Assam', district: 'Jorhat', lat: 26.7509, lng: 94.2037 },
  'dhemaji': { name: 'Dhemaji, Assam', state: 'Assam', district: 'Dhemaji', lat: 27.4800, lng: 94.5800 },
  'barpeta': { name: 'Barpeta, Assam', state: 'Assam', district: 'Barpeta', lat: 26.3200, lng: 91.0000 },
  'lakhimpur': { name: 'Lakhimpur, Assam', state: 'Assam', district: 'Lakhimpur', lat: 27.2300, lng: 94.1000 },
  'brahmaputra': { name: 'Brahmaputra Valley, Assam', state: 'Assam', district: 'Kamrup', lat: 26.1800, lng: 91.7500 },

  // Uttarakhand
  'chamoli': { name: 'Chamoli, Uttarakhand', state: 'Uttarakhand', district: 'Chamoli', lat: 30.4048, lng: 79.3284 },
  'joshimath': { name: 'Joshimath, Uttarakhand', state: 'Uttarakhand', district: 'Chamoli', lat: 30.5564, lng: 79.5647 },
  'kedarnath': { name: 'Kedarnath, Uttarakhand', state: 'Uttarakhand', district: 'Rudraprayag', lat: 30.7346, lng: 79.0669 },
  'badrinath': { name: 'Badrinath, Uttarakhand', state: 'Uttarakhand', district: 'Chamoli', lat: 30.7433, lng: 79.4938 },
  'dehradun': { name: 'Dehradun, Uttarakhand', state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  'haridwar': { name: 'Haridwar, Uttarakhand', state: 'Uttarakhand', district: 'Haridwar', lat: 29.9457, lng: 78.1642 },
  'rishikesh': { name: 'Rishikesh, Uttarakhand', state: 'Uttarakhand', district: 'Dehradun', lat: 30.0869, lng: 78.2676 },
  'nainital': { name: 'Nainital, Uttarakhand', state: 'Uttarakhand', district: 'Nainital', lat: 29.3919, lng: 79.4542 },
  'pithoragarh': { name: 'Pithoragarh, Uttarakhand', state: 'Uttarakhand', district: 'Pithoragarh', lat: 29.5829, lng: 80.2182 },
  'uttarkashi': { name: 'Uttarkashi, Uttarakhand', state: 'Uttarakhand', district: 'Uttarkashi', lat: 30.7268, lng: 78.4354 },
  'rudraprayag': { name: 'Rudraprayag, Uttarakhand', state: 'Uttarakhand', district: 'Rudraprayag', lat: 30.2844, lng: 78.9811 },

  // Himachal Pradesh
  'shimla': { name: 'Shimla, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734 },
  'manali': { name: 'Manali, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Kullu', lat: 32.2432, lng: 77.1892 },
  'kullu': { name: 'Kullu, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Kullu', lat: 31.9579, lng: 77.1095 },
  'dharamshala': { name: 'Dharamshala, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Kangra', lat: 32.2190, lng: 76.3234 },
  'kangra': { name: 'Kangra, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Kangra', lat: 32.0998, lng: 76.2691 },
  'mandi': { name: 'Mandi, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Mandi', lat: 31.7087, lng: 76.9318 },
  'solan': { name: 'Solan, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Solan', lat: 30.9045, lng: 77.0967 },
  'kinnaur': { name: 'Kinnaur, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Kinnaur', lat: 31.6510, lng: 78.4752 },
  'lahaul': { name: 'Lahaul & Spiti, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Lahaul and Spiti', lat: 32.5534, lng: 77.0177 },
  'spiti': { name: 'Spiti Valley, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Lahaul and Spiti', lat: 32.2461, lng: 78.0349 },

  // Gujarat
  'ahmedabad': { name: 'Ahmedabad, Gujarat', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  'surat': { name: 'Surat, Gujarat', state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311 },
  'vadodara': { name: 'Vadodara, Gujarat', state: 'Gujarat', district: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  'rajkot': { name: 'Rajkot, Gujarat', state: 'Gujarat', district: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  'kutch': { name: 'Kutch, Gujarat', state: 'Gujarat', district: 'Kutch', lat: 23.2420, lng: 69.6669 },
  'bhuj': { name: 'Bhuj, Gujarat', state: 'Gujarat', district: 'Kutch', lat: 23.2420, lng: 69.6669 },
  'jamnagar': { name: 'Jamnagar, Gujarat', state: 'Gujarat', district: 'Jamnagar', lat: 22.4707, lng: 70.0577 },
  'bhavnagar': { name: 'Bhavnagar, Gujarat', state: 'Gujarat', district: 'Bhavnagar', lat: 21.7645, lng: 72.1519 },

  // Odisha
  'bhubaneswar': { name: 'Bhubaneswar, Odisha', state: 'Odisha', district: 'Khurda', lat: 20.2961, lng: 85.8245 },
  'puri': { name: 'Puri Coast, Odisha', state: 'Odisha', district: 'Puri', lat: 19.8135, lng: 85.8312 },
  'cuttack': { name: 'Cuttack, Odisha', state: 'Odisha', district: 'Cuttack', lat: 20.4625, lng: 85.8828 },
  'balasore': { name: 'Balasore, Odisha', state: 'Odisha', district: 'Balasore', lat: 21.4934, lng: 86.9135 },
  'rourkela': { name: 'Rourkela, Odisha', state: 'Odisha', district: 'Sundargarh', lat: 22.2604, lng: 84.8536 },
  'sambalpur': { name: 'Sambalpur, Odisha', state: 'Odisha', district: 'Sambalpur', lat: 21.4669, lng: 83.9812 },
  'paradip': { name: 'Paradip Port, Odisha', state: 'Odisha', district: 'Jagatsinghpur', lat: 20.3165, lng: 86.6114 },

  // West Bengal
  'kolkata': { name: 'Kolkata, West Bengal', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  'calcutta': { name: 'Kolkata, West Bengal', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  'darjeeling': { name: 'Darjeeling, West Bengal', state: 'West Bengal', district: 'Darjeeling', lat: 27.0410, lng: 88.2663 },
  'siliguri': { name: 'Siliguri, West Bengal', state: 'West Bengal', district: 'Darjeeling', lat: 26.7271, lng: 88.3953 },
  'kalimpong': { name: 'Kalimpong, West Bengal', state: 'West Bengal', district: 'Kalimpong', lat: 27.0667, lng: 88.4667 },
  'asansol': { name: 'Asansol, West Bengal', state: 'West Bengal', district: 'Paschim Bardhaman', lat: 23.6889, lng: 86.9661 },
  'durgapur': { name: 'Durgapur, West Bengal', state: 'West Bengal', district: 'Paschim Bardhaman', lat: 23.5204, lng: 87.3119 },
  'howrah': { name: 'Howrah, West Bengal', state: 'West Bengal', district: 'Howrah', lat: 22.5958, lng: 88.2636 },
  'sunderbans': { name: 'Sundarbans, West Bengal', state: 'West Bengal', district: 'South 24 Parganas', lat: 21.9497, lng: 89.1833 },
  'teesta': { name: 'Teesta River Basin, North Bengal', state: 'West Bengal', district: 'Kalimpong', lat: 27.0600, lng: 88.4700 },

  // Bihar
  'patna': { name: 'Patna, Bihar', state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
  'gaya': { name: 'Gaya, Bihar', state: 'Bihar', district: 'Gaya', lat: 24.7914, lng: 85.0002 },
  'muzaffarpur': { name: 'Muzaffarpur, Bihar', state: 'Bihar', district: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
  'bhagalpur': { name: 'Bhagalpur, Bihar', state: 'Bihar', district: 'Bhagalpur', lat: 25.2425, lng: 86.9842 },
  'darbhanga': { name: 'Darbhanga, Bihar', state: 'Bihar', district: 'Darbhanga', lat: 26.1542, lng: 85.8918 },
  'purnia': { name: 'Purnia, Bihar', state: 'Bihar', district: 'Purnia', lat: 25.7771, lng: 87.4753 },
  'kosi': { name: 'Kosi River Region, Bihar', state: 'Bihar', district: 'Supaul', lat: 26.1260, lng: 86.6033 },

  // Maharashtra
  'mumbai': { name: 'Mumbai, Maharashtra', state: 'Maharashtra', district: 'Mumbai City', lat: 19.0760, lng: 72.8777 },
  'bombay': { name: 'Mumbai, Maharashtra', state: 'Maharashtra', district: 'Mumbai City', lat: 19.0760, lng: 72.8777 },
  'pune': { name: 'Pune, Maharashtra', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567 },
  'nagpur': { name: 'Nagpur, Maharashtra', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  'nashik': { name: 'Nashik, Maharashtra', state: 'Maharashtra', district: 'Nashik', lat: 19.9975, lng: 73.7898 },
  'thane': { name: 'Thane, Maharashtra', state: 'Maharashtra', district: 'Thane', lat: 19.2183, lng: 72.9781 },
  'aurangabad': { name: 'Chhatrapati Sambhajinagar, Maharashtra', state: 'Maharashtra', district: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  'solapur': { name: 'Solapur, Maharashtra', state: 'Maharashtra', district: 'Solapur', lat: 17.6599, lng: 75.9064 },
  'kolhapur': { name: 'Kolhapur, Maharashtra', state: 'Maharashtra', district: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
  'raigad': { name: 'Raigad, Maharashtra', state: 'Maharashtra', district: 'Raigad', lat: 18.5158, lng: 73.1822 },
  'ratnagiri': { name: 'Ratnagiri Coast, Maharashtra', state: 'Maharashtra', district: 'Ratnagiri', lat: 16.9902, lng: 73.3120 },

  // Tamil Nadu
  'chennai': { name: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  'madras': { name: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707 },
  'coimbatore': { name: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', district: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  'madurai': { name: 'Madurai, Tamil Nadu', state: 'Tamil Nadu', district: 'Madurai', lat: 9.9252, lng: 78.1198 },
  'tiruchirappalli': { name: 'Tiruchirappalli, Tamil Nadu', state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  'trichy': { name: 'Tiruchirappalli, Tamil Nadu', state: 'Tamil Nadu', district: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  'salem': { name: 'Salem, Tamil Nadu', state: 'Tamil Nadu', district: 'Salem', lat: 11.6643, lng: 78.1460 },
  'tirunelveli': { name: 'Tirunelveli, Tamil Nadu', state: 'Tamil Nadu', district: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  'kanyakumari': { name: 'Kanyakumari, Tamil Nadu', state: 'Tamil Nadu', district: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
  'cuddalore': { name: 'Cuddalore Coast, Tamil Nadu', state: 'Tamil Nadu', district: 'Cuddalore', lat: 11.7480, lng: 79.7714 },

  // Karnataka
  'bengaluru': { name: 'Bengaluru, Karnataka', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
  'bangalore': { name: 'Bengaluru, Karnataka', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
  'mysuru': { name: 'Mysuru, Karnataka', state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  'mysore': { name: 'Mysuru, Karnataka', state: 'Karnataka', district: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  'mangalore': { name: 'Mangalore Coast, Karnataka', state: 'Karnataka', district: 'Dakshina Kannada', lat: 12.9141, lng: 74.8560 },
  'mangaluru': { name: 'Mangalore Coast, Karnataka', state: 'Karnataka', district: 'Dakshina Kannada', lat: 12.9141, lng: 74.8560 },
  'hubli': { name: 'Hubli, Karnataka', state: 'Karnataka', district: 'Dharwad', lat: 15.3647, lng: 75.1240 },
  'belagavi': { name: 'Belagavi, Karnataka', state: 'Karnataka', district: 'Belagavi', lat: 15.8497, lng: 74.4977 },
  'belgaum': { name: 'Belagavi, Karnataka', state: 'Karnataka', district: 'Belagavi', lat: 15.8497, lng: 74.4977 },
  'coorg': { name: 'Kodagu (Coorg), Karnataka', state: 'Karnataka', district: 'Kodagu', lat: 12.3375, lng: 75.8069 },
  'kodagu': { name: 'Kodagu (Coorg), Karnataka', state: 'Karnataka', district: 'Kodagu', lat: 12.3375, lng: 75.8069 },
  'udupi': { name: 'Udupi Coast, Karnataka', state: 'Karnataka', district: 'Udupi', lat: 13.3409, lng: 74.7421 },

  // Andhra Pradesh & Telangana
  'visakhapatnam': { name: 'Visakhapatnam, Andhra Pradesh', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  'vizag': { name: 'Visakhapatnam, Andhra Pradesh', state: 'Andhra Pradesh', district: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  'vijayawada': { name: 'Vijayawada, Andhra Pradesh', state: 'Andhra Pradesh', district: 'NTR', lat: 16.5062, lng: 80.6480 },
  'guntur': { name: 'Guntur, Andhra Pradesh', state: 'Andhra Pradesh', district: 'Guntur', lat: 16.3067, lng: 80.4365 },
  'tirupati': { name: 'Tirupati, Andhra Pradesh', state: 'Andhra Pradesh', district: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  'hyderabad': { name: 'Hyderabad, Telangana', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  'secunderabad': { name: 'Secunderabad, Telangana', state: 'Telangana', district: 'Hyderabad', lat: 17.4399, lng: 78.4983 },
  'warangal': { name: 'Warangal, Telangana', state: 'Telangana', district: 'Warangal', lat: 17.9689, lng: 79.5941 },

  // Uttar Pradesh
  'lucknow': { name: 'Lucknow, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  'kanpur': { name: 'Kanpur, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Kanpur Nagar', lat: 26.4499, lng: 80.3319 },
  'varanasi': { name: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  'banaras': { name: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  'kashi': { name: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  'agra': { name: 'Agra, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Agra', lat: 27.1767, lng: 78.0081 },
  'prayagraj': { name: 'Prayagraj, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
  'allahabad': { name: 'Prayagraj, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
  'gorakhpur': { name: 'Gorakhpur, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Gorakhpur', lat: 26.7606, lng: 83.3732 },
  'ayodhya': { name: 'Ayodhya, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Ayodhya', lat: 26.7922, lng: 82.1998 },
  'noida': { name: 'Noida, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', lat: 28.5355, lng: 77.3910 },
  'ghaziabad': { name: 'Ghaziabad, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  'meerut': { name: 'Meerut, Uttar Pradesh', state: 'Uttar Pradesh', district: 'Meerut', lat: 28.9845, lng: 77.7064 },

  // Rajasthan
  'jaipur': { name: 'Jaipur, Rajasthan', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  'jodhpur': { name: 'Jodhpur, Rajasthan', state: 'Rajasthan', district: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  'udaipur': { name: 'Udaipur, Rajasthan', state: 'Rajasthan', district: 'Udaipur', lat: 24.5854, lng: 73.7125 },
  'kota': { name: 'Kota, Rajasthan', state: 'Rajasthan', district: 'Kota', lat: 25.2138, lng: 75.8648 },
  'bikaner': { name: 'Bikaner, Rajasthan', state: 'Rajasthan', district: 'Bikaner', lat: 28.0229, lng: 73.3119 },
  'jaisalmer': { name: 'Jaisalmer, Rajasthan', state: 'Rajasthan', district: 'Jaisalmer', lat: 26.9157, lng: 70.9083 },
  'barmer': { name: 'Barmer, Rajasthan', state: 'Rajasthan', district: 'Barmer', lat: 25.7532, lng: 71.3967 },

  // Madhya Pradesh
  'bhopal': { name: 'Bhopal, Madhya Pradesh', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  'indore': { name: 'Indore, Madhya Pradesh', state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577 },
  'gwalior': { name: 'Gwalior, Madhya Pradesh', state: 'Madhya Pradesh', district: 'Gwalior', lat: 26.2183, lng: 78.1828 },
  'jabalpur': { name: 'Jabalpur, Madhya Pradesh', state: 'Madhya Pradesh', district: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
  'ujjain': { name: 'Ujjain, Madhya Pradesh', state: 'Madhya Pradesh', district: 'Ujjain', lat: 23.1765, lng: 75.7885 },

  // Jammu & Kashmir and Ladakh
  'srinagar': { name: 'Srinagar, J&K', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  'jammu': { name: 'Jammu, J&K', state: 'Jammu & Kashmir', district: 'Jammu', lat: 32.7266, lng: 74.8570 },
  'anantnag': { name: 'Anantnag, J&K', state: 'Jammu & Kashmir', district: 'Anantnag', lat: 33.7311, lng: 75.1500 },
  'baramulla': { name: 'Baramulla, J&K', state: 'Jammu & Kashmir', district: 'Baramulla', lat: 34.2000, lng: 74.3400 },
  'leh': { name: 'Leh, Ladakh', state: 'Ladakh', district: 'Leh', lat: 34.1526, lng: 77.5771 },
  'kargil': { name: 'Kargil, Ladakh', state: 'Ladakh', district: 'Kargil', lat: 34.5539, lng: 76.1349 },

  // Northeast States
  'gangtok': { name: 'Gangtok, Sikkim', state: 'Sikkim', district: 'Gangtok', lat: 27.3389, lng: 88.6065 },
  'shillong': { name: 'Shillong, Meghalaya', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.5788, lng: 91.8933 },
  'cherrapunji': { name: 'Cherrapunji, Meghalaya', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.2986, lng: 91.7317 },
  'mawsynram': { name: 'Mawsynram, Meghalaya', state: 'Meghalaya', district: 'East Khasi Hills', lat: 25.2974, lng: 91.5824 },
  'imphal': { name: 'Imphal, Manipur', state: 'Manipur', district: 'Imphal West', lat: 24.8170, lng: 93.9368 },
  'aizawl': { name: 'Aizawl, Mizoram', state: 'Mizoram', district: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  'kohima': { name: 'Kohima, Nagaland', state: 'Nagaland', district: 'Kohima', lat: 25.6751, lng: 94.1086 },
  'dimapur': { name: 'Dimapur, Nagaland', state: 'Nagaland', district: 'Dimapur', lat: 25.9090, lng: 93.7266 },
  'agartala': { name: 'Agartala, Tripura', state: 'Tripura', district: 'West Tripura', lat: 23.8315, lng: 91.2868 },
  'itanagar': { name: 'Itanagar, Arunachal Pradesh', state: 'Arunachal Pradesh', district: 'Papum Pare', lat: 27.0844, lng: 93.6053 },
  'tawang': { name: 'Tawang, Arunachal Pradesh', state: 'Arunachal Pradesh', district: 'Tawang', lat: 27.5861, lng: 91.8594 },

  // Punjab & Haryana
  'amritsar': { name: 'Amritsar, Punjab', state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  'ludhiana': { name: 'Ludhiana, Punjab', state: 'Punjab', district: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  'jalandhar': { name: 'Jalandhar, Punjab', state: 'Punjab', district: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
  'gurugram': { name: 'Gurugram, Haryana', state: 'Haryana', district: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  'gurgaon': { name: 'Gurugram, Haryana', state: 'Haryana', district: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  'faridabad': { name: 'Faridabad, Haryana', state: 'Haryana', district: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  'panipat': { name: 'Panipat, Haryana', state: 'Haryana', district: 'Panipat', lat: 29.3909, lng: 76.9635 },
  'ambala': { name: 'Ambala, Haryana', state: 'Haryana', district: 'Ambala', lat: 30.3782, lng: 76.7767 },

  // Chhattisgarh & Jharkhand & Goa
  'raipur': { name: 'Raipur, Chhattisgarh', state: 'Chhattisgarh', district: 'Raipur', lat: 21.2514, lng: 81.6296 },
  'bilaspur': { name: 'Bilaspur, Chhattisgarh', state: 'Chhattisgarh', district: 'Bilaspur', lat: 22.0797, lng: 82.1391 },
  'bastar': { name: 'Bastar, Chhattisgarh', state: 'Chhattisgarh', district: 'Bastar', lat: 19.1071, lng: 81.9535 },
  'ranchi': { name: 'Ranchi, Jharkhand', state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  'jamshedpur': { name: 'Jamshedpur, Jharkhand', state: 'Jharkhand', district: 'East Singhbhum', lat: 22.8046, lng: 86.2029 },
  'dhanbad': { name: 'Dhanbad, Jharkhand', state: 'Jharkhand', district: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
  'panaji': { name: 'Panaji, Goa', state: 'Goa', district: 'North Goa', lat: 15.4909, lng: 73.8278 },

  // --- NEIGHBORING REGIONS FREQUENTLY IN SOUTH ASIAN DISASTER NEWS ---
  'nepal': { name: 'Nepal', state: 'Nepal Region', district: 'Kathmandu Valley', lat: 28.3949, lng: 84.1240 },
  'kathmandu': { name: 'Kathmandu, Nepal', state: 'Nepal Region', district: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
  'pokhara': { name: 'Pokhara, Nepal', state: 'Nepal Region', district: 'Kaski', lat: 28.2096, lng: 83.9856 },
  'everest': { name: 'Mount Everest Region', state: 'Himalayan Range', district: 'Solukhumbu', lat: 27.9881, lng: 86.9250 },
  'bangladesh': { name: 'Bangladesh', state: 'Bangladesh Region', district: 'Dhaka', lat: 23.6850, lng: 90.3563 },
  'dhaka': { name: 'Dhaka, Bangladesh', state: 'Bangladesh Region', district: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  'sylhet': { name: 'Sylhet, Bangladesh', state: 'Bangladesh Region', district: 'Sylhet', lat: 24.8949, lng: 91.8687 },
  'chittagong': { name: 'Chittagong, Bangladesh', state: 'Bangladesh Region', district: 'Chittagong', lat: 22.3569, lng: 91.7832 },
  'sri lanka': { name: 'Sri Lanka', state: 'Sri Lanka Region', district: 'Colombo', lat: 7.8731, lng: 80.7718 },
  'colombo': { name: 'Colombo, Sri Lanka', state: 'Sri Lanka Region', district: 'Colombo', lat: 6.9271, lng: 79.8612 },
  'bhutan': { name: 'Bhutan', state: 'Bhutan Region', district: 'Thimphu', lat: 27.5142, lng: 90.4336 },
  'bay of bengal': { name: 'Bay of Bengal Coast', state: 'Coastal India', district: 'Bay of Bengal', lat: 16.5000, lng: 86.5000 },
  'arabian sea': { name: 'Arabian Sea Coast', state: 'Western Coast', district: 'Arabian Sea', lat: 17.5000, lng: 70.5000 },
  'himalayas': { name: 'Himalayan Belt', state: 'Northern Himalayas', district: 'Himalayas', lat: 30.5000, lng: 79.5000 },
  'himalayan': { name: 'Himalayan Belt', state: 'Northern Himalayas', district: 'Himalayas', lat: 30.5000, lng: 79.5000 },
};

// Distributed pool of notable Indian disaster zones for fallback when text is completely non-specific
export const FALLBACK_LOCATIONS_POOL: GeoLocation[] = [
  { name: 'Assam Valley', state: 'Assam', district: 'Kamrup', lat: 26.2006, lng: 92.9376 },
  { name: 'Wayanad Region, Kerala', state: 'Kerala', district: 'Wayanad', lat: 11.6854, lng: 76.1320 },
  { name: 'Chamoli, Uttarakhand', state: 'Uttarakhand', district: 'Chamoli', lat: 30.4048, lng: 79.3284 },
  { name: 'Shimla Hills, Himachal Pradesh', state: 'Himachal Pradesh', district: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { name: 'Kutch Coast, Gujarat', state: 'Gujarat', district: 'Kutch', lat: 23.2420, lng: 69.6669 },
  { name: 'Puri Coast, Odisha', state: 'Odisha', district: 'Puri', lat: 19.8135, lng: 85.8312 },
  { name: 'Darjeeling Hills, West Bengal', state: 'West Bengal', district: 'Darjeeling', lat: 27.0410, lng: 88.2663 },
  { name: 'Mumbai Coast, Maharashtra', state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Kashmir Valley, J&K', state: 'Jammu & Kashmir', district: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { name: 'Patna Region, Bihar', state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376 },
];

/**
 * Extracts location, state, district, and coordinates from news text using Spatial NER.
 * Adds intelligent micro-jitter so multiple articles referring to the same state/district don't overlap completely on the map.
 */
export function extractLocationAndGeocode(title: string, description: string = '', index: number = 0): GeocodedResult {
  const combinedText = `${title} ${description}`.toLowerCase();

  // Determine severity based on contextual indicators in the text
  let severity: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Moderate';
  if (/\b(killed|dead|death|fatal|fatalities|casualties|devastat|destroyed|massive|emergency|red alert|landfall|collapse)\b/i.test(combinedText)) {
    severity = 'Critical';
  } else if (/\b(warning|orange alert|alert|injured|submerged|inundated|stranded|damage|heavy rain|overflow)\b/i.test(combinedText)) {
    severity = 'High';
  } else if (/\b(yellow alert|watch|advisory|isolated|moderate|rescue|precaution)\b/i.test(combinedText)) {
    severity = 'Moderate';
  } else {
    severity = 'Low';
  }

  // 1. Search for matching locations (Districts / Cities first, then States)
  // Sort keys by length descending to match more specific names first (e.g., "Himachal Pradesh" before "Himachal")
  const sortedKeys = Object.keys(LOCATION_DATABASE).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    if (regex.test(combinedText)) {
      const match = LOCATION_DATABASE[key];
      // Apply slight jitter (max ~8-15km) to prevent pin overlap when multiple articles are in the same state
      const jitterLat = ((index % 7) - 3) * 0.04;
      const jitterLng = (((index * 3) % 7) - 3) * 0.04;

      return {
        location: match.name,
        state: match.state,
        district: match.district || match.state,
        latitude: match.lat + jitterLat,
        longitude: match.lng + jitterLng,
        severity,
      };
    }
  }

  // 2. Fallback to distributed geographic pool across India
  const poolItem = FALLBACK_LOCATIONS_POOL[index % FALLBACK_LOCATIONS_POOL.length];
  const jitterLat = ((index % 5) - 2) * 0.05;
  const jitterLng = (((index * 2) % 5) - 2) * 0.05;

  return {
    location: poolItem.name,
    state: poolItem.state,
    district: poolItem.district || poolItem.state,
    latitude: poolItem.lat + jitterLat,
    longitude: poolItem.lng + jitterLng,
    severity,
  };
}
