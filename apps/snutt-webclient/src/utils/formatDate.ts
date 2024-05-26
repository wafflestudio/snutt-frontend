export const formatDate = <S extends string>(
  date: Date,
  format: (_: { YYYY: string; MM: string; DD: string }) => S,
) => {
  return format({
    YYYY: date.getFullYear().toString().padStart(4, '0'),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    DD: date.getDate().toString().padStart(2, '0'),
  });
};
