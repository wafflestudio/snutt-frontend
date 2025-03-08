export const convertToMinute = (time: string): number => {
  const hour = Number(time.split(':')[0]) || 0;
  const minute = Number(time.split(':')[1]) || 0;

  return hour * 60 + minute;
};
