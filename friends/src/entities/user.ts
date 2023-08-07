export type Nickname = string;

export type NicknameTag = `${number}${number}`;

export type UserId = string & { _brand: 'UserId' };
