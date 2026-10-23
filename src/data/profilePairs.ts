import { RiasecType } from './questions';

export interface ProfilePair {
  code: string;
  type1: RiasecType;
  type2: RiasecType;
  nameKey: string;
  descriptionKey: string;
  strengthsKeys: string[];
}

export const PROFILE_PAIRS: Record<string, ProfilePair> = {
  // R pairs
  'RI': {
    code: 'RI',
    type1: 'R',
    type2: 'I',
    nameKey: 'profiles.RI.name',
    descriptionKey: 'profiles.RI.desc',
    strengthsKeys: ['profiles.RI.s1', 'profiles.RI.s2', 'profiles.RI.s3'],
  },
  'RA': {
    code: 'RA',
    type1: 'R',
    type2: 'A',
    nameKey: 'profiles.RA.name',
    descriptionKey: 'profiles.RA.desc',
    strengthsKeys: ['profiles.RA.s1', 'profiles.RA.s2', 'profiles.RA.s3'],
  },
  'RS': {
    code: 'RS',
    type1: 'R',
    type2: 'S',
    nameKey: 'profiles.RS.name',
    descriptionKey: 'profiles.RS.desc',
    strengthsKeys: ['profiles.RS.s1', 'profiles.RS.s2', 'profiles.RS.s3'],
  },
  'RE': {
    code: 'RE',
    type1: 'R',
    type2: 'E',
    nameKey: 'profiles.RE.name',
    descriptionKey: 'profiles.RE.desc',
    strengthsKeys: ['profiles.RE.s1', 'profiles.RE.s2', 'profiles.RE.s3'],
  },
  'RC': {
    code: 'RC',
    type1: 'R',
    type2: 'C',
    nameKey: 'profiles.RC.name',
    descriptionKey: 'profiles.RC.desc',
    strengthsKeys: ['profiles.RC.s1', 'profiles.RC.s2', 'profiles.RC.s3'],
  },

  // I pairs
  'IR': {
    code: 'IR',
    type1: 'I',
    type2: 'R',
    nameKey: 'profiles.IR.name',
    descriptionKey: 'profiles.IR.desc',
    strengthsKeys: ['profiles.IR.s1', 'profiles.IR.s2', 'profiles.IR.s3'],
  },
  'IA': {
    code: 'IA',
    type1: 'I',
    type2: 'A',
    nameKey: 'profiles.IA.name',
    descriptionKey: 'profiles.IA.desc',
    strengthsKeys: ['profiles.IA.s1', 'profiles.IA.s2', 'profiles.IA.s3'],
  },
  'IS': {
    code: 'IS',
    type1: 'I',
    type2: 'S',
    nameKey: 'profiles.IS.name',
    descriptionKey: 'profiles.IS.desc',
    strengthsKeys: ['profiles.IS.s1', 'profiles.IS.s2', 'profiles.IS.s3'],
  },
  'IE': {
    code: 'IE',
    type1: 'I',
    type2: 'E',
    nameKey: 'profiles.IE.name',
    descriptionKey: 'profiles.IE.desc',
    strengthsKeys: ['profiles.IE.s1', 'profiles.IE.s2', 'profiles.IE.s3'],
  },
  'IC': {
    code: 'IC',
    type1: 'I',
    type2: 'C',
    nameKey: 'profiles.IC.name',
    descriptionKey: 'profiles.IC.desc',
    strengthsKeys: ['profiles.IC.s1', 'profiles.IC.s2', 'profiles.IC.s3'],
  },

  // A pairs
  'AR': {
    code: 'AR',
    type1: 'A',
    type2: 'R',
    nameKey: 'profiles.RA.name',
    descriptionKey: 'profiles.RA.desc',
    strengthsKeys: ['profiles.RA.s1', 'profiles.RA.s2', 'profiles.RA.s3'],
  },
  'AI': {
    code: 'AI',
    type1: 'A',
    type2: 'I',
    nameKey: 'profiles.IA.name',
    descriptionKey: 'profiles.IA.desc',
    strengthsKeys: ['profiles.IA.s1', 'profiles.IA.s2', 'profiles.IA.s3'],
  },
  'AS': {
    code: 'AS',
    type1: 'A',
    type2: 'S',
    nameKey: 'profiles.AS.name',
    descriptionKey: 'profiles.AS.desc',
    strengthsKeys: ['profiles.AS.s1', 'profiles.AS.s2', 'profiles.AS.s3'],
  },
  'AE': {
    code: 'AE',
    type1: 'A',
    type2: 'E',
    nameKey: 'profiles.AE.name',
    descriptionKey: 'profiles.AE.desc',
    strengthsKeys: ['profiles.AE.s1', 'profiles.AE.s2', 'profiles.AE.s3'],
  },
  'AC': {
    code: 'AC',
    type1: 'A',
    type2: 'C',
    nameKey: 'profiles.AC.name',
    descriptionKey: 'profiles.AC.desc',
    strengthsKeys: ['profiles.AC.s1', 'profiles.AC.s2', 'profiles.AC.s3'],
  },

  // S pairs
  'SR': {
    code: 'SR',
    type1: 'S',
    type2: 'R',
    nameKey: 'profiles.RS.name',
    descriptionKey: 'profiles.RS.desc',
    strengthsKeys: ['profiles.RS.s1', 'profiles.RS.s2', 'profiles.RS.s3'],
  },
  'SI': {
    code: 'SI',
    type1: 'S',
    type2: 'I',
    nameKey: 'profiles.IS.name',
    descriptionKey: 'profiles.IS.desc',
    strengthsKeys: ['profiles.IS.s1', 'profiles.IS.s2', 'profiles.IS.s3'],
  },
  'SA': {
    code: 'SA',
    type1: 'S',
    type2: 'A',
    nameKey: 'profiles.AS.name',
    descriptionKey: 'profiles.AS.desc',
    strengthsKeys: ['profiles.AS.s1', 'profiles.AS.s2', 'profiles.AS.s3'],
  },
  'SE': {
    code: 'SE',
    type1: 'S',
    type2: 'E',
    nameKey: 'profiles.SE.name',
    descriptionKey: 'profiles.SE.desc',
    strengthsKeys: ['profiles.SE.s1', 'profiles.SE.s2', 'profiles.SE.s3'],
  },
  'SC': {
    code: 'SC',
    type1: 'S',
    type2: 'C',
    nameKey: 'profiles.SC.name',
    descriptionKey: 'profiles.SC.desc',
    strengthsKeys: ['profiles.SC.s1', 'profiles.SC.s2', 'profiles.SC.s3'],
  },

  // E pairs
  'ER': {
    code: 'ER',
    type1: 'E',
    type2: 'R',
    nameKey: 'profiles.RE.name',
    descriptionKey: 'profiles.RE.desc',
    strengthsKeys: ['profiles.RE.s1', 'profiles.RE.s2', 'profiles.RE.s3'],
  },
  'EI': {
    code: 'EI',
    type1: 'E',
    type2: 'I',
    nameKey: 'profiles.IE.name',
    descriptionKey: 'profiles.IE.desc',
    strengthsKeys: ['profiles.IE.s1', 'profiles.IE.s2', 'profiles.IE.s3'],
  },
  'EA': {
    code: 'EA',
    type1: 'E',
    type2: 'A',
    nameKey: 'profiles.AE.name',
    descriptionKey: 'profiles.AE.desc',
    strengthsKeys: ['profiles.AE.s1', 'profiles.AE.s2', 'profiles.AE.s3'],
  },
  'ES': {
    code: 'ES',
    type1: 'E',
    type2: 'S',
    nameKey: 'profiles.SE.name',
    descriptionKey: 'profiles.SE.desc',
    strengthsKeys: ['profiles.SE.s1', 'profiles.SE.s2', 'profiles.SE.s3'],
  },
  'EC': {
    code: 'EC',
    type1: 'E',
    type2: 'C',
    nameKey: 'profiles.CE.name',
    descriptionKey: 'profiles.CE.desc',
    strengthsKeys: ['profiles.CE.s1', 'profiles.CE.s2', 'profiles.CE.s3'],
  },

  // C pairs
  'CR': {
    code: 'CR',
    type1: 'C',
    type2: 'R',
    nameKey: 'profiles.RC.name',
    descriptionKey: 'profiles.RC.desc',
    strengthsKeys: ['profiles.RC.s1', 'profiles.RC.s2', 'profiles.RC.s3'],
  },
  'CI': {
    code: 'CI',
    type1: 'C',
    type2: 'I',
    nameKey: 'profiles.IC.name',
    descriptionKey: 'profiles.IC.desc',
    strengthsKeys: ['profiles.IC.s1', 'profiles.IC.s2', 'profiles.IC.s3'],
  },
  'CA': {
    code: 'CA',
    type1: 'C',
    type2: 'A',
    nameKey: 'profiles.AC.name',
    descriptionKey: 'profiles.AC.desc',
    strengthsKeys: ['profiles.AC.s1', 'profiles.AC.s2', 'profiles.AC.s3'],
  },
  'CS': {
    code: 'CS',
    type1: 'C',
    type2: 'S',
    nameKey: 'profiles.SC.name',
    descriptionKey: 'profiles.SC.desc',
    strengthsKeys: ['profiles.SC.s1', 'profiles.SC.s2', 'profiles.SC.s3'],
  },
  'CE': {
    code: 'CE',
    type1: 'C',
    type2: 'E',
    nameKey: 'profiles.CE.name',
    descriptionKey: 'profiles.CE.desc',
    strengthsKeys: ['profiles.CE.s1', 'profiles.CE.s2', 'profiles.CE.s3'],
  },
};
