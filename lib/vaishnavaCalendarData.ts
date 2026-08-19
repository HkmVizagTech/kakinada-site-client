/**
 * Gaudiya Vaishnava Calendar 2026
 * Comprehensive list of important dates: Ekadashis, Festivals, and Observances
 * Based on calculations for Mayapur/Nabadwip (IST)
 */

export type VaishnavaDateType = "Ekadashi" | "Festival" | "Appearance" | "Disappearance" | "Observance";

export interface VaishnavaDate {
  date: string; // YYYY-MM-DD
  title: string;
  type: VaishnavaDateType;
  description?: string;
  fastUntilNoon?: boolean;
  completeFast?: boolean;
}

export const vaishnavaCalendar2026: VaishnavaDate[] = [
  // ═══════════════════════════════════════════
  // JANUARY 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-01-06",
    title: "Appearance of Srila Gopal Bhatta Goswami",
    type: "Appearance",
    description: "Appearance day of Srila Gopal Bhatta Goswami, one of the six Goswamis of Vrindavan.",
  },
  {
    date: "2026-01-09",
    title: "Disappearance of Srila Jayadev Goswami",
    type: "Disappearance",
    description: "Disappearance day of Srila Jayadev Goswami, the author of Gita Govinda.",
  },
  {
    date: "2026-01-11",
    title: "Disappearance of Srila Lochan Das Thakur",
    type: "Disappearance",
    description: "Disappearance day of Srila Lochan Das Thakur, author of Chaitanya Mangala.",
  },
  {
    date: "2026-01-14",
    title: "Shat-tila Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi in the month of Magha. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-01-23",
    title: "Sri Krishna Vasanta Panchami / Saraswati Puja",
    type: "Festival",
    description: "Sri Krishna Vasanta Panchami. Appearance day of Sri Vishnu Priya Devi. Appearance of Srila Pundarik Vidyanidhi, Srila Raghunath Das Goswami, and Srila Raghunandan Thakur. Sri Saraswati Puja.",
    fastUntilNoon: true,
  },
  {
    date: "2026-01-25",
    title: "Appearance of Sri Advaita Acharya",
    type: "Appearance",
    description: "Appearance day of Mahavishnu Avatar, Sri Advaita Acharya. Fast until noon.",
    fastUntilNoon: true,
  },
  {
    date: "2026-01-29",
    title: "Bhaimi Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-01-31",
    title: "Appearance of Sri Nityananda Prabhu",
    type: "Appearance",
    description: "Appearance day of Sri Nityananda Prabhu. Fast until noon. Grand festival.",
    fastUntilNoon: true,
  },

  // ═══════════════════════════════════════════
  // FEBRUARY 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-02-01",
    title: "Appearance of Srila Narottam Das Thakur",
    type: "Appearance",
    description: "Appearance day of Srila Narottam Das Thakur, author of Prarthana and Prema-bhakti-chandrika.",
  },
  {
    date: "2026-02-06",
    title: "Appearance of Srila Bhakti Siddhanta Saraswati",
    type: "Appearance",
    description: "153rd divine appearance festival of Srila Bhakti Siddhanta Saraswati Goswami Prabhupad, founder of Sri Chaitanya Math and worldwide Sri Gaudiya Maths.",
  },
  {
    date: "2026-02-13",
    title: "Vijaya Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-02-16",
    title: "Sri Sri Shivaratri",
    type: "Festival",
    description: "Maha Shivaratri. Optional fast. Night-long worship of Lord Shiva.",
    completeFast: false,
  },
  {
    date: "2026-02-18",
    title: "Disappearance of Srila Jagannath Das Babaji",
    type: "Disappearance",
    description: "Disappearance of Vaishnava Sarvabhauma Srila Jagannath Das Babaji Maharaj, Srila Rasikananda Dev Goswami, and Tridandi Swami Srimad Bhakti Dayita Madhav Maharaj.",
  },
  {
    date: "2026-02-27",
    title: "Amalaki Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans. Sri Nabadwip Dham Parikrama begins.",
    fastUntilNoon: false,
  },

  // ═══════════════════════════════════════════
  // MARCH 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-03-03",
    title: "Sri Gaura Purnima",
    type: "Festival",
    description: "Divine appearance day of Sri Chaitanya Mahaprabhu. Total fast until moonrise, then no grains. Grand festival. End of year 540 Gaurabda.",
    completeFast: true,
  },
  {
    date: "2026-03-11",
    title: "Appearance of Srila Srivas Pandit",
    type: "Appearance",
    description: "Appearance day of Srila Srivas Pandit, one of the panca-tattva's associates.",
  },
  {
    date: "2026-03-15",
    title: "Papamochani Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-03-23",
    title: "Appearance of Sripad Ramanuja Acharya",
    type: "Appearance",
    description: "Appearance day of Sripad Ramanuja Acharya, the great Vaishnava acharya.",
  },
  {
    date: "2026-03-27",
    title: "Sri Rama Navami",
    type: "Festival",
    description: "Appearance day of Sri Ramachandra at noon. Fast until noon.",
    fastUntilNoon: true,
  },
  {
    date: "2026-03-29",
    title: "Kamada Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },

  // ═══════════════════════════════════════════
  // APRIL 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-04-02",
    title: "Vasanta Rasa / Appearance of Srila Shyamananda Prabhu",
    type: "Festival",
    description: "Vasanta Rasa of Sri Krishna. Appearance of Srila Vamshi Vadanananda Thakur and Srila Shyamananda Prabhu.",
  },
  {
    date: "2026-04-12",
    title: "Disappearance of Srila Vrindavan Das Thakur",
    type: "Disappearance",
    description: "Disappearance day of Srila Vrindavan Das Thakur, author of Chaitanya Bhagavata.",
  },
  {
    date: "2026-04-13",
    title: "Varuthini Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-04-17",
    title: "Appearance of Srila Gadadhar Pandit",
    type: "Appearance",
    description: "Appearance day of Srila Gadadhar Pandit, one of the panca-tattva.",
  },
  {
    date: "2026-04-19",
    title: "Akshaya Tritiya / Chandan Yatra begins",
    type: "Festival",
    description: "Akshaya Tritiya - auspicious day to begin new endeavors. Beginning of 21-day Chandan Yatra of Sri Sri Jagannathdev.",
  },
  {
    date: "2026-04-22",
    title: "Appearance of Sripad Shankar Acharya",
    type: "Appearance",
    description: "Appearance day of Sripad Shankaracharya, the great Advaita philosopher.",
  },
  {
    date: "2026-04-23",
    title: "Sri Jahnavi Puja (Ganga Puja)",
    type: "Festival",
    description: "Jahnu Saptami. Sri Jahnavi Puja (Sri Ganga Puja).",
  },
  {
    date: "2026-04-25",
    title: "Appearance of Sri Jahnava Devi & Sri Sita Devi",
    type: "Appearance",
    description: "Appearance of Sri Nityananda-shakti, Sri Jahnava Devi, and Sri Rama-shakti, Sri Sita Devi.",
  },
  {
    date: "2026-04-27",
    title: "Mohini Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-04-30",
    title: "Sri Nrisimha Chaturdashi",
    type: "Festival",
    description: "Appearance day of Sri Nrisimhadev. Full fast until after sunset, then no grains (anukalpa).",
    completeFast: true,
  },

  // ═══════════════════════════════════════════
  // MAY 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-05-01",
    title: "Sri Nrisimha Chaturdashi Paran / Buddha Purnima",
    type: "Festival",
    description: "Sri Nrisimha Chaturdashi paran. Sri Krishna's Phul Dol and Salila Bihar. Buddha Purnima: appearance day of Lord Buddha. Appearance of Srila Srinivas Acharya.",
  },
  {
    date: "2026-05-07",
    title: "Disappearance of Srila Ramananda Ray",
    type: "Disappearance",
    description: "Disappearance day of Srila Ramananda Ray, a great associate of Sri Chaitanya Mahaprabhu.",
  },
  {
    date: "2026-05-13",
    title: "Apara Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-05-14",
    title: "Appearance of Srila Vrindavan Das Thakur",
    type: "Appearance",
    description: "Appearance day of Srila Vrindavan Das Thakur, author of Chaitanya Bhagavata.",
  },
  {
    date: "2026-05-27",
    title: "Padmini Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },

  // ═══════════════════════════════════════════
  // JUNE 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-06-11",
    title: "Parama Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-06-24",
    title: "Dashahara / Sri Ganga Puja",
    type: "Festival",
    description: "Dashahara. Sri Ganga Puja. Appearance of Sri Ganga Mata Goswamini. Disappearance of Srila Baladev Vidyabhushan Prabhu.",
  },
  {
    date: "2026-06-25",
    title: "Nirjala Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and water (Nirjala - waterless).",
    completeFast: true,
  },
  {
    date: "2026-06-29",
    title: "Snan Yatra (Bathing of Jagannathdev)",
    type: "Festival",
    description: "Snan Yatra of Sri Jagannathdev. Disappearance of Srila Mukunda Datta and Srila Sridhar Pandit.",
  },

  // ═══════════════════════════════════════════
  // JULY 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-07-05",
    title: "Appearance of Srila Vakreshvar Pandit",
    type: "Appearance",
    description: "Appearance day of Srila Vakreshvar Pandit, a great devotee of Sri Chaitanya Mahaprabhu.",
  },
  {
    date: "2026-07-11",
    title: "Yogini Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-07-14",
    title: "Disappearance of Srila Gadadhar Pandit & Srila Bhakti Vinod Thakur",
    type: "Disappearance",
    description: "Disappearance day of Srila Gadadhar Pandit and Srila Sachchidananda Bhakti Vinod Thakur.",
  },
  {
    date: "2026-07-15",
    title: "Gundicha Marjan",
    type: "Festival",
    description: "Cleaning of the Gundicha Temple at Sri Puri Dham, and cleaning of all Temples of the Lord.",
  },
  {
    date: "2026-07-16",
    title: "Sri Ratha Yatra",
    type: "Festival",
    description: "Grand Ratha Yatra (Chariot Festival) of Sri Jagannathdev at Puri. Disappearance of Srila Svarup Damodar Goswami Prabhu.",
  },
  {
    date: "2026-07-20",
    title: "Hera Panchami",
    type: "Festival",
    description: "Sri Sri Laksmi Vijay in Sri Puri Dham.",
  },
  {
    date: "2026-07-24",
    title: "Punar Yatra (Return Car Festival)",
    type: "Festival",
    description: "Punara Yatra of Sri Jagannathdev (Return car festival).",
  },
  {
    date: "2026-07-25",
    title: "Shayan Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-07-29",
    title: "Sri Guru Purnima / Appearance of Srila Vyasadev",
    type: "Festival",
    description: "Sri Guru Purnima. Appearance of Srila Vyasadev. Disappearance of Srila Sanatan Goswami Prabhu. Beginning of Chaturmasya.",
  },

  // ═══════════════════════════════════════════
  // AUGUST 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-08-03",
    title: "Disappearance of Srila Gopal Bhatta Goswami",
    type: "Disappearance",
    description: "Disappearance day of Srila Gopal Bhatta Goswami.",
  },
  {
    date: "2026-08-06",
    title: "Disappearance of Srila Lokanath Goswami",
    type: "Disappearance",
    description: "Disappearance day of Srila Lokanath Goswami, a great devotee of Sri Chaitanya Mahaprabhu.",
  },
  {
    date: "2026-08-09",
    title: "Kamika Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-08-12",
    title: "Disappearance of Srila Sridhar Dev-Goswami Maharaj",
    type: "Disappearance",
    description: "Festival in honour of the disappearance of Om Vishnupad Paramahamsa Srila Bhakti Raksak Sridhar Dev-Goswami Maharaj.",
  },
  {
    date: "2026-08-23",
    title: "Jhulan Yatra begins",
    type: "Festival",
    description: "Beginning of Jhulan Yatra of Sri Sri Radha-Govinda and start of the one month festival of Sri Hari Smaran.",
  },
  {
    date: "2026-08-24",
    title: "Vyanjuli Mahadvadashi (Ekadashi)",
    type: "Ekadashi",
    description: "Gaura Mahadvadashi. Fasting from grains and beans. Disappearance of Srila Rupa Goswami and Srila Gauri Das Pandit Goswami.",
    fastUntilNoon: false,
  },
  {
    date: "2026-08-28",
    title: "Appearance of Sri Baladev (Balarama Purnima)",
    type: "Festival",
    description: "Appearance day of Sri Baladev. Fast until noon. End of Jhulan Yatra.",
    fastUntilNoon: true,
  },

  // ═══════════════════════════════════════════
  // SEPTEMBER 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-09-04",
    title: "Sri Krishna Janmashtami",
    type: "Festival",
    description: "Sri Sri Krishna Janmashtami. Complete fast until midnight, then no grains. Appearance of Lord Sri Krishna.",
    completeFast: true,
  },
  {
    date: "2026-09-05",
    title: "Sri Nandotsav / Appearance of Srila Prabhupada",
    type: "Festival",
    description: "Sri Nandotsav. Sri Janmashtami Paran. Appearance of Tridandi Swami Srimad Bhaktivedanta Swami Maharaj Prabhupad (Founder of ISKCON).",
  },
  {
    date: "2026-09-07",
    title: "Annada Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-09-18",
    title: "Sri Lalita Saptami",
    type: "Festival",
    description: "Appearance of Sri Lalita Devi, one of the primary gopis.",
  },
  {
    date: "2026-09-19",
    title: "Sri Radhashtami",
    type: "Festival",
    description: "Srimati Radharani's appearance at noon. Fast until noon.",
    fastUntilNoon: true,
  },
  {
    date: "2026-09-22",
    title: "Ekadashi (Month of Bhadra)",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-09-23",
    title: "Appearance of Srila Jiva Goswami",
    type: "Appearance",
    description: "Appearance of Sri Vamanadev. Appearance of Srila Jiva Goswami Prabhu.",
  },
  {
    date: "2026-09-24",
    title: "Appearance of Srila Bhakti Vinod Thakur",
    type: "Appearance",
    description: "Appearance day of Srila Sachchidananda Bhakti Vinod Thakur.",
  },
  {
    date: "2026-09-25",
    title: "Disappearance of Srila Haridas Thakur",
    type: "Disappearance",
    description: "Disappearance day of Srila Haridas Thakur, the namacharya.",
  },
  {
    date: "2026-09-26",
    title: "Vishvarup Mahotsav",
    type: "Festival",
    description: "End of month-long festival at Nabadwip.",
  },

  // ═══════════════════════════════════════════
  // OCTOBER 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-10-06",
    title: "Indira Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-10-21",
    title: "Vijay Utsav / Appearance of Sri Madhva Acharya",
    type: "Festival",
    description: "Vijay Utsav of Sri Ramachandra. Appearance of Sri Madhva Acharya.",
  },
  {
    date: "2026-10-22",
    title: "Papankusha Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-10-23",
    title: "Disappearance of Srila Raghunath Das Goswami",
    type: "Disappearance",
    description: "Disappearance of Srila Raghunath Das Goswami, Srila Raghunath Bhatta Goswami, and Srila Krishnadas Kaviraj Goswami.",
  },
  {
    date: "2026-10-26",
    title: "Sharadiya Rasa Yatra",
    type: "Festival",
    description: "Sharadiya Rasa Yatra of Sri Krishna. Disappearance of Srila Murari Gupta. Beginning of Urja Vrata / Kartik Vrata.",
  },

  // ═══════════════════════════════════════════
  // NOVEMBER 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-11-02",
    title: "Bahulashtami / Radha Kunda",
    type: "Festival",
    description: "Bahulashtami. Manifestation day of Sri Radha Kunda.",
  },
  {
    date: "2026-11-03",
    title: "Appearance of Srila Sridhar Dev-Goswami Maharaj",
    type: "Appearance",
    description: "The grand 132nd appearance day celebration of Srila Bhakti Raksak Sridhar Dev-Goswami Maharaj. Appearance of Srila Virachandra Prabhu.",
  },
  {
    date: "2026-11-05",
    title: "Rama Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-11-08",
    title: "Dhanteras",
    type: "Festival",
    description: "Offering and placing of lamps on Vishnu Mandirs.",
  },
  {
    date: "2026-11-09",
    title: "Diwali / Dipavali",
    type: "Festival",
    description: "Dipavali. Offering and placing of lamps on Vishnu Mandirs. Go Puja (cow-worship) and Go Krida.",
  },
  {
    date: "2026-11-10",
    title: "Govardhan Puja / Annakut Mahotsav",
    type: "Festival",
    description: "Sri Govardhan Puja. Grand Annakut Mahotsav ('Rice Mountain Festival').",
  },
  {
    date: "2026-11-11",
    title: "Bhratri Dvitiya (Govardhan Puja)",
    type: "Festival",
    description: "Disappearance of Srila Vasudev Ghosh Thakur. Bhratri Dvitiya (festival where brothers and sisters honour each other).",
  },
  {
    date: "2026-11-13",
    title: "Disappearance of Srila Prabhupada (ISKCON)",
    type: "Disappearance",
    description: "Disappearance festival of Tridandi Swami Srimad Bhaktivedanta Swami Maharaj Prabhupad (Founder of ISKCON).",
  },
  {
    date: "2026-11-17",
    title: "Sri Gopashtami / Go Puja",
    type: "Festival",
    description: "Sri Gopashtami, Sri Goshthastami, Go Puja, and Go Gras-dan. Disappearance of Sri Gadadhar Das Goswami.",
  },
  {
    date: "2026-11-20",
    title: "Utthan Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans. Disappearance of Srila Gaura Kishor Das Babaji Maharaj.",
    fastUntilNoon: false,
  },
  {
    date: "2026-11-23",
    title: "Disappearance of Srila Bhugarbha Goswami",
    type: "Disappearance",
    description: "Disappearance of Srila Bhugarbha Goswami and Srila Kashishvar Pandit.",
  },
  {
    date: "2026-11-24",
    title: "Rasa Yatra / Appearance of Srila Nimbarka Acharya",
    type: "Festival",
    description: "Rasa Yatra of Sri Krishna. End of Chaturmasya. Appearance of Srila Nimbarka Acharya.",
  },
  {
    date: "2026-11-30",
    title: "Oran Shashthi",
    type: "Festival",
    description: "Grand festival for honouring the appearance of Sri Sri Nitai-Chaitanya Jiu at Sri Puri Dham.",
  },

  // ═══════════════════════════════════════════
  // DECEMBER 2026
  // ═══════════════════════════════════════════
  {
    date: "2026-12-04",
    title: "Utpanna Ekadashi",
    type: "Ekadashi",
    description: "Krishna Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-12-05",
    title: "Disappearance of Srila Narahari Sarkar Thakur",
    type: "Disappearance",
    description: "Disappearance of Srila Narahari Sarkar Thakur and Srila Kaliya Krishnadas.",
  },
  {
    date: "2026-12-06",
    title: "Disappearance of Srila Saranga Thakur",
    type: "Disappearance",
    description: "Disappearance day of Srila Saranga Thakur.",
  },
  {
    date: "2026-12-17",
    title: "Disappearance of Srila Madhusudan Das Babaji",
    type: "Disappearance",
    description: "Disappearance day of Srila Madhusudan Das Babaji Maharaj.",
  },
  {
    date: "2026-12-20",
    title: "Moksada Ekadashi",
    type: "Ekadashi",
    description: "Gaura Ekadashi. Fasting from grains and beans.",
    fastUntilNoon: false,
  },
  {
    date: "2026-12-25",
    title: "Appearance of Srila Bhakti Sundar Govinda Maharaj",
    type: "Appearance",
    description: "The grand 98th appearance day celebration of Srila Bhakti Sundar Govinda Dev-Goswami Maharaj.",
  },
  {
    date: "2026-12-27",
    title: "Disappearance of Srila Bhakti Siddhanta Saraswati",
    type: "Disappearance",
    description: "Disappearance festival of Srila Bhakti Siddhanta Saraswati Goswami Prabhupad, founder of Sri Chaitanya Math and worldwide Sri Gaudiya Maths.",
  },
];

/**
 * Get all dates for a specific month (0-indexed)
 */
export function getDatesForMonth(month: number): VaishnavaDate[] {
  return vaishnavaCalendar2026.filter((d) => {
    const date = new Date(d.date);
    return date.getMonth() === month;
  });
}

/**
 * Get the next upcoming event from today
 */
export function getNextUpcomingEvent(): VaishnavaDate | undefined {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return vaishnavaCalendar2026
    .filter((d) => new Date(d.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

/**
 * Get events for a specific date string (YYYY-MM-DD)
 */
export function getEventsForDate(dateStr: string): VaishnavaDate[] {
  return vaishnavaCalendar2026.filter((d) => d.date === dateStr);
}
