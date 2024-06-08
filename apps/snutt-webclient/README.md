# snutt-webclient-v2

## Deployment

- dev: https://snutt-dev.wafflestudio.com
- prod: https://snutt.wafflestudio.com

## Development

### 실제 서버에 붙어서 개발하기

`apps/snutt-webclient/.env.local` 에 아래 환경변수를 세팅해 주세요.

```env
VITE_API_KEY=
```

그리고 아래 명령어를 실행합니다.

```sh
yarn workspace snutt-webclient dev:dev # dev 서버에 붙을 경우
yarn workspace snutt-webclient dev:prod # prod 서버에 붙을 경우
```

### 목서버에 붙어서 개발하기

```sh
yarn workspace snutt-webclient dev:mock
```

<br/><br/>

## Deployment

### dev 서버에 배포하기

```sh
yarn workspace snutt-webclient deploy:dev
```
