export interface Country {
  code:   string
  name:   string
  flag:   string
  cities: string[]
}

export const COUNTRIES: Country[] = [
  // ── Afrique de l'Ouest ─────────────────────────────────────────────
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', cities: ['Dakar', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Diourbel', 'Tambacounda', 'Mbour', 'Louga'] },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', cities: ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'Man', 'San-Pédro', 'Yamoussoukro', 'Divo'] },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', cities: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao', 'Kidal'] },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', cities: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Mamou'] },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', cities: ['Accra', 'Kumasi', 'Tamale', 'Sekondi', 'Cape Coast', 'Sunyani'] },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', cities: ['Lomé', 'Sokodé', 'Kara', 'Atakpamé', 'Bassar', 'Tsévié'] },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Abomey'] },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', cities: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Tillabéri'] },
  { code: 'MR', name: 'Mauritanie', flag: '🇲🇷', cities: ['Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouerate'] },
  { code: 'GM', name: 'Gambie', flag: '🇬🇲', cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau'] },
  { code: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', cities: ['Bissau', 'Bafatá', 'Gabú', 'Bissorã'] },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱', cities: ['Freetown', 'Bo', 'Kenema', 'Makeni'] },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷', cities: ['Monrovia', 'Gbarnga', 'Kakata', 'Buchanan'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', cities: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City', 'Kaduna', 'Enugu'] },

  // ── Maghreb ────────────────────────────────────────────────────────
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', cities: ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Agadir', 'Tanger', 'Meknès', 'Oujda', 'Tétouan', 'Kénitra', 'Laâyoune', 'Nador', 'Béni Mellal', 'El Jadida', 'Taza'] },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', cities: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tlemcen', 'Sétif', 'Béjaïa', 'Tizi Ouzou', 'Batna'] },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Monastir', 'Nabeul'] },
  { code: 'LY', name: 'Libye', flag: '🇱🇾', cities: ['Tripoli', 'Benghazi', 'Misrata', 'Tobruk', 'Sabha'] },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬', cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Port Saïd', 'Suez', 'Assouan', 'Louxor'] },

  // ── Afrique centrale ───────────────────────────────────────────────
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', cities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Maroua', 'Ngaoundéré'] },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', cities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi'] },
  { code: 'CD', name: 'Congo (RDC)', flag: '🇨🇩', cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Goma', 'Bukavu'] },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem'] },
  { code: 'TD', name: 'Tchad', flag: '🇹🇩', cities: ["N'Djamena", 'Moundou', 'Sarh', 'Abéché'] },

  // ── Afrique de l'Est ───────────────────────────────────────────────
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'] },
  { code: 'ET', name: 'Éthiopie', flag: '🇪🇹', cities: ['Addis-Abeba', 'Dire Dawa', 'Mekele', 'Gondar', 'Hawassa'] },
  { code: 'TZ', name: 'Tanzanie', flag: '🇹🇿', cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Zanzibar'] },
  { code: 'UG', name: 'Ouganda', flag: '🇺🇬', cities: ['Kampala', 'Gulu', 'Lira', 'Jinja', 'Mbarara'] },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri'] },

  // ── Afrique australe ───────────────────────────────────────────────
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'] },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬', cities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga'] },

  // ── France ─────────────────────────────────────────────────────────
  { code: 'FR', name: 'France', flag: '🇫🇷', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes', 'Strasbourg', 'Montpellier', 'Nice', 'Rennes', 'Grenoble', 'Lille', 'Rouen', 'Toulon', 'Saint-Étienne', 'Le Havre', 'Reims', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand', 'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Amiens', 'Perpignan', 'Metz', 'Nancy'] },

  // ── Belgique ───────────────────────────────────────────────────────
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', cities: ['Bruxelles', 'Anvers', 'Gand', 'Liège', 'Bruges', 'Namur', 'Leuven', 'Mons'] },

  // ── Suisse ─────────────────────────────────────────────────────────
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', cities: ['Genève', 'Zurich', 'Berne', 'Bâle', 'Lausanne', 'Lugano', 'Winterthour'] },

  // ── Espagne ────────────────────────────────────────────────────────
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', cities: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao', 'Malaga', 'Las Palmas', 'Saragosse', 'Murcie', 'Palma de Majorque'] },

  // ── Portugal ───────────────────────────────────────────────────────
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', cities: ['Lisbonne', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Setúbal'] },

  // ── Italie ─────────────────────────────────────────────────────────
  { code: 'IT', name: 'Italie', flag: '🇮🇹', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palerme', 'Gênes', 'Bologne', 'Florence', 'Bari', 'Catane'] },

  // ── Pays-Bas ───────────────────────────────────────────────────────
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱', cities: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Tilburg'] },

  // ── Allemagne ──────────────────────────────────────────────────────
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', cities: ['Berlin', 'Munich', 'Hambourg', 'Francfort', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Brême'] },

  // ── Royaume-Uni ────────────────────────────────────────────────────
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', cities: ['Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Édimbourg', 'Liverpool', 'Leeds', 'Bristol', 'Sheffield', 'Cardiff'] },

  // ── Canada ─────────────────────────────────────────────────────────
  { code: 'CA', name: 'Canada', flag: '🇨🇦', cities: ['Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Calgary', 'Québec', 'Edmonton', 'Winnipeg', 'Hamilton'] },

  // ── États-Unis ─────────────────────────────────────────────────────
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami', 'Atlanta', 'Boston', 'Washington', 'San Francisco', 'Seattle', 'Dallas', 'Phoenix', 'Philadelphie', 'San Antonio', 'San Diego'] },

  // ── Caraïbes & DOM-TOM ─────────────────────────────────────────────
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶', cities: ['Fort-de-France', 'Le Lamentin', 'Le Robert', 'Sainte-Marie'] },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵', cities: ['Pointe-à-Pitre', 'Les Abymes', 'Baie-Mahault', 'Le Gosier'] },
  { code: 'RE', name: 'La Réunion', flag: '🇷🇪', cities: ['Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon'] },
  { code: 'GF', name: 'Guyane', flag: '🇬🇫', cities: ['Cayenne', 'Saint-Laurent-du-Maroni', 'Kourou'] },
  { code: 'HT', name: 'Haïti', flag: '🇭🇹', cities: ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves', 'Saint-Marc'] },

  // ── Moyen-Orient ──────────────────────────────────────────────────
  { code: 'AE', name: 'Émirats arabes unis', flag: '🇦🇪', cities: ['Dubaï', 'Abou Dhabi', 'Sharjah', 'Al Ain'] },
  { code: 'SA', name: 'Arabie saoudite', flag: '🇸🇦', cities: ['Riyad', 'Djeddah', 'La Mecque', 'Médine', 'Dammam'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', cities: ['Doha', 'Al Wakrah', 'Al Rayyan'] },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Adana'] },
]

export function getCitiesByCountry(countryCode: string): string[] {
  return COUNTRIES.find((c) => c.code === countryCode)?.cities ?? []
}

export const ALL_CITIES: string[] = COUNTRIES.flatMap((c) => c.cities)