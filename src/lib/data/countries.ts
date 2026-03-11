export interface CountryData {
  code: string;
  name: string;
  cities: string[];
}

export const countries: CountryData[] = [
  {
    code: "TR",
    name: "Turkiye",
    cities: [
      "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya",
      "Gaziantep", "Mersin", "Diyarbakir", "Kayseri", "Eskisehir", "Samsun",
      "Denizli", "Sanliurfa", "Malatya", "Trabzon", "Erzurum", "Van",
      "Kahramanmaras", "Manisa", "Balikesir", "Sakarya", "Kocaeli", "Mugla",
      "Aydin", "Tekirdağ", "Elazig", "Hatay",
    ],
  },
  {
    code: "US",
    name: "United States",
    cities: [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
      "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
      "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis",
      "Seattle", "Denver", "Washington DC", "Nashville", "Oklahoma City",
      "El Paso", "Boston", "Portland", "Las Vegas", "Memphis", "Louisville",
      "Baltimore", "Milwaukee", "Miami", "Atlanta", "Detroit",
    ],
  },
  {
    code: "DE",
    name: "Deutschland",
    cities: [
      "Berlin", "Hamburg", "Munchen", "Koln", "Frankfurt", "Stuttgart",
      "Dusseldorf", "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden",
      "Hannover", "Nurnberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld",
      "Bonn", "Munster",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: [
      "London", "Birmingham", "Manchester", "Glasgow", "Leeds", "Liverpool",
      "Newcastle", "Sheffield", "Bristol", "Edinburgh", "Cardiff", "Belfast",
      "Leicester", "Coventry", "Nottingham", "Southampton", "Aberdeen",
      "Brighton", "Oxford", "Cambridge",
    ],
  },
  {
    code: "FR",
    name: "France",
    cities: [
      "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier",
      "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre",
      "Saint-Etienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nimes",
    ],
  },
  {
    code: "ES",
    name: "Espana",
    cities: [
      "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Malaga",
      "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Cordoba",
      "Valladolid", "Vigo", "Gijon", "Granada", "Cadiz",
    ],
  },
  {
    code: "IT",
    name: "Italia",
    cities: [
      "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna",
      "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova",
      "Trieste", "Brescia", "Parma",
    ],
  },
  {
    code: "NL",
    name: "Nederland",
    cities: [
      "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen",
      "Tilburg", "Almere", "Breda", "Nijmegen", "Arnhem", "Haarlem",
    ],
  },
  {
    code: "RU",
    name: "Russia",
    cities: [
      "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan",
      "Nizhny Novgorod", "Chelyabinsk", "Samara", "Omsk", "Rostov-on-Don",
      "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd",
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    cities: [
      "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk",
      "Buraidah", "Khamis Mushait", "Abha", "Najran", "Yanbu",
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    cities: [
      "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah",
      "Fujairah",
    ],
  },
  {
    code: "AZ",
    name: "Azerbaijan",
    cities: [
      "Baku", "Ganja", "Sumqayit", "Mingachevir", "Shirvan", "Nakhchivan",
      "Sheki", "Lankaran",
    ],
  },
  {
    code: "KZ",
    name: "Kazakhstan",
    cities: [
      "Almaty", "Astana", "Shymkent", "Karaganda", "Aktobe", "Taraz",
      "Pavlodar", "Ust-Kamenogorsk", "Semey", "Atyrau",
    ],
  },
  {
    code: "UZ",
    name: "Uzbekistan",
    cities: [
      "Tashkent", "Samarkand", "Namangan", "Andijan", "Bukhara", "Nukus",
      "Fergana", "Karshi",
    ],
  },
  {
    code: "BR",
    name: "Brasil",
    cities: [
      "Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza",
      "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre",
      "Belem", "Goiania", "Guarulhos", "Campinas",
    ],
  },
  {
    code: "JP",
    name: "Japan",
    cities: [
      "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe",
      "Kawasaki", "Kyoto", "Saitama", "Hiroshima", "Sendai",
    ],
  },
  {
    code: "KR",
    name: "South Korea",
    cities: [
      "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon",
      "Ulsan", "Changwon", "Seongnam",
    ],
  },
  {
    code: "CN",
    name: "China",
    cities: [
      "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou",
      "Wuhan", "Xi'an", "Nanjing", "Tianjin", "Chongqing", "Suzhou",
      "Dongguan", "Shenyang", "Qingdao",
    ],
  },
  {
    code: "IN",
    name: "India",
    cities: [
      "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
      "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur",
    ],
  },
  {
    code: "PT",
    name: "Portugal",
    cities: [
      "Lisbon", "Porto", "Amadora", "Braga", "Funchal", "Coimbra", "Setubal",
      "Almada", "Aveiro",
    ],
  },
  {
    code: "PL",
    name: "Polska",
    cities: [
      "Warszawa", "Krakow", "Lodz", "Wroclaw", "Poznan", "Gdansk", "Szczecin",
      "Bydgoszcz", "Lublin", "Bialystok", "Katowice",
    ],
  },
  {
    code: "SE",
    name: "Sverige",
    cities: [
      "Stockholm", "Goteborg", "Malmo", "Uppsala", "Vasteras", "Orebro",
      "Linkoping", "Helsingborg", "Jonkoping", "Norrkoping",
    ],
  },
  {
    code: "EG",
    name: "Egypt",
    cities: [
      "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez",
      "Luxor", "Asyut", "Ismailia", "Tanta", "Mansoura",
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    cities: [
      "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City",
      "Maiduguri", "Zaria", "Aba", "Jos",
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    cities: [
      "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Leon",
      "Juarez", "Zapopan", "Merida", "Cancun", "Queretaro",
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    cities: [
      "Buenos Aires", "Cordoba", "Rosario", "Mendoza", "La Plata", "Tucuman",
      "Mar del Plata", "Salta", "Santa Fe",
    ],
  },
  {
    code: "AU",
    name: "Australia",
    cities: [
      "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast",
      "Canberra", "Newcastle", "Hobart", "Darwin",
    ],
  },
  {
    code: "CA",
    name: "Canada",
    cities: [
      "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa",
      "Winnipeg", "Quebec City", "Hamilton", "Halifax",
    ],
  },
  {
    code: "PK",
    name: "Pakistan",
    cities: [
      "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Islamabad", "Multan",
      "Hyderabad", "Gujranwala", "Peshawar", "Quetta",
    ],
  },
  {
    code: "ID",
    name: "Indonesia",
    cities: [
      "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar",
      "Palembang", "Depok", "Tangerang", "Bekasi", "Bali",
    ],
  },
];

export function getCountryByCode(code: string): CountryData | undefined {
  return countries.find((c) => c.code === code);
}

export function getCountryByName(name: string): CountryData | undefined {
  return countries.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getCitiesByCountry(countryName: string): string[] {
  const country = getCountryByName(countryName);
  return country?.cities || [];
}
