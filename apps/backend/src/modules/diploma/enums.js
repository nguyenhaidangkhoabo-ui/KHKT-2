
export const DiplomaStatus = Object.freeze({
  NOT_STORED: 'NOT_STORED',     
  STORED: 'STORED',             
  HANDED_OVER: 'HANDED_OVER'    
});


export const DayOfWeek = Object.freeze({
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY'
});


export const RegistrationStatus = Object.freeze({
  PENDING: 'PENDING',       
  CONFIRMED: 'CONFIRMED',   
  COMPLETED: 'COMPLETED',   
  CANCELLED: 'CANCELLED'    
});


export const DAY_NAMES = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY
];

export const DIPLOMA_STATUS_TRANSITIONS = Object.freeze({
  [DiplomaStatus.NOT_STORED]: [DiplomaStatus.STORED],
  [DiplomaStatus.STORED]: [DiplomaStatus.HANDED_OVER],
  [DiplomaStatus.HANDED_OVER]: []
});