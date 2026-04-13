interface Scheme {
  name: string;
  conditions: string[];
  coverage: string;
  ageRange: string;
  income: string;
  documents: string[];
  hospitals: string[];
}

export const schemes: Scheme[] = [
  {
    name: 'Ayushman Bharat PM-JAY',
    conditions: ['cardiac', 'diabetes', 'hypertension'],
    coverage: 'Up to Rs. 5 lakh per family per year',
    ageRange: 'All',
    income: 'SECC eligible families',
    documents: ['Aadhaar', 'Ration card'],
    hospitals: ['AIIMS', 'District General Hospital', 'Apollo (empanelled units)'],
  },
  {
    name: 'State NCD Support Program',
    conditions: ['asthma', 'copd', 'hypertension'],
    coverage: 'Subsidized diagnostics and medicine support',
    ageRange: '30+',
    income: 'Low and middle income families',
    documents: ['Aadhaar', 'Income certificate'],
    hospitals: ['City Community Hospital', 'Government Medical College'],
  },
  {
    name: 'Senior Citizen Wellness Cover',
    conditions: ['arthritis', 'diabetes', 'cardiac'],
    coverage: 'OPD support and annual preventive screening',
    ageRange: '60+',
    income: 'All',
    documents: ['Aadhaar', 'Age proof'],
    hospitals: ['Regional Wellness Center', 'Civil Hospital'],
  },
];

export const getMatchingSchemes = (conditionKeyword: string) => {
  const keyword = conditionKeyword.toLowerCase();
  return schemes.filter((scheme) =>
    scheme.conditions.some((condition) => condition.toLowerCase().includes(keyword)),
  );
};
