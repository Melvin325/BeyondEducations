export interface SampleCollege {
  id: string;
  name: string;
  location: string;
  category: 'Government' | 'Private' | 'Deemed';
  popularFor: string[];
  isPartner?: boolean;
  indicativeFee: string;
}

export const SAMPLE_COLLEGES: Record<'Government' | 'Private' | 'Deemed', SampleCollege[]> = {
  Government: [
    {
      id: 'gov-1',
      name: 'UVCE (University Visvesvaraya College of Engg)',
      location: 'KR Circle, Bengaluru',
      category: 'Government',
      popularFor: ['BTech CSE', 'BTech Mechanical', 'BTech Civil'],
      indicativeFee: '₹45,000 - ₹90,000 / yr',
    },
    {
      id: 'gov-2',
      name: 'Bangalore University (Jnana Bharathi Campus)',
      location: 'Mysore Road, Bengaluru',
      category: 'Government',
      popularFor: ['BSc', 'BCom', 'BA Economics', 'BCA'],
      indicativeFee: '₹20,000 - ₹50,000 / yr',
    },
    {
      id: 'gov-3',
      name: 'BMCRI (Bangalore Medical College & Research Inst.)',
      location: 'Fort, Bengaluru',
      category: 'Government',
      popularFor: ['MBBS', 'BSc Nursing', 'BDS'],
      indicativeFee: '₹60,000 - ₹1.1 Lakh / yr',
    },
  ],
  Private: [
    {
      id: 'pvt-1',
      name: 'Christ University',
      location: 'Hosur Road / Central Campus, Bengaluru',
      category: 'Private',
      popularFor: ['BBA', 'BCom', 'BCA', 'BA Psychology', 'BA LLB'],
      isPartner: true,
      indicativeFee: '₹1.8 - ₹3.5 Lakh / yr',
    },
    {
      id: 'pvt-2',
      name: 'RV College of Engineering (RVCE)',
      location: 'Mysuru Road, Bengaluru',
      category: 'Private',
      popularFor: ['BTech CSE', 'BTech AI', 'BTech ECE'],
      isPartner: true,
      indicativeFee: '₹2.5 - ₹4.5 Lakh / yr',
    },
    {
      id: 'pvt-3',
      name: 'St. Joseph’s University',
      location: 'Langford Road, Bengaluru',
      category: 'Private',
      popularFor: ['BCom Banking', 'BSc Data Science', 'BA Journalism'],
      indicativeFee: '₹1.2 - ₹2.4 Lakh / yr',
    },
  ],
  Deemed: [
    {
      id: 'dmd-1',
      name: 'PES University (Ring Road Campus)',
      location: 'Banashankari, Bengaluru',
      category: 'Deemed',
      popularFor: ['BTech CSE', 'B.Des', 'BBA Entrepreneurship', 'BArch'],
      isPartner: true,
      indicativeFee: '₹3.6 - ₹5.0 Lakh / yr',
    },
    {
      id: 'dmd-2',
      name: 'Jain (Deemed-to-be University)',
      location: 'Jayanagar / Global Campus, Bengaluru',
      category: 'Deemed',
      popularFor: ['BBA Aviation', 'BCom ACCA', 'BSc Animation & VFX'],
      isPartner: true,
      indicativeFee: '₹2.2 - ₹4.0 Lakh / yr',
    },
    {
      id: 'dmd-3',
      name: 'Manipal Academy of Higher Education (MAHE)',
      location: 'Bengaluru Campus (Yelahanka)',
      category: 'Deemed',
      popularFor: ['B.Des', 'BA Media & Comm', 'BTech Tech'],
      indicativeFee: '₹3.2 - ₹5.2 Lakh / yr',
    },
  ],
};
