import { Brand } from '../utils/brand';

export type Nickname = string;

export type NicknameTag = `${number}${number}`;

export type DisplayName = string;

export type UserId = Brand<string, 'UserId'>;
