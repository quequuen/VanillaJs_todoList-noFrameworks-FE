# API 에러 상태 코드 명세서

프론트엔드에서 에러 처리를 위한 API 에러 상태 코드 및 메시지 명세입니다.

---

## 📋 목차

1. [에러 응답 형식](#에러-응답-형식)
2. [인증 (Auth) API 에러](#인증-auth-api-에러)
3. [Todo API 에러](#todo-api-에러)
4. [전역 에러 처리](#전역-에러-처리)

---

## 에러 응답 형식

### JSON 응답 형식 (일반 API)

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/send-magic-link",
  "message": "유효하지 않은 이메일입니다."
}
```

### HTML 응답 형식 (GET /api/auth/verify)

에러가 발생하면 HTML 에러 페이지가 반환됩니다. (3초 후 자동 리다이렉트)

---

## 인증 (Auth) API 에러

### POST `/api/auth/send-magic-link`

매직링크 이메일 발송

#### 성공 응답 (200)

```json
{
  "message": "인증 링크가 이메일로 발송되었습니다."
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지                                                          | 발생 조건                                                                          |
| --------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **400**   | `"유효하지 않은 이메일입니다."`                                      | 이메일 형식이 올바르지 않음<br/>또는 DTO 검증 실패 (이메일이 빈 값, 255자 초과 등) |
| **429**   | `"ThrottlerException: Too Many Requests"`                            | Rate Limit 초과<br/>- 1분에 5회 초과<br/>- 1시간에 10회 초과                       |
| **500**   | `"이메일 발송에 실패했습니다: {에러 메시지}"`                        | SendGrid 이메일 발송 실패                                                          |
| **500**   | `"이메일 발송 서비스가 설정되지 않았습니다. 관리자에게 문의하세요."` | SENDGRID_API_KEY 또는 SENDGRID_SENDER 환경변수 누락                                |
| **500**   | `"데이터베이스 연결에 실패했습니다."`                                | DB 연결 오류                                                                       |
| **500**   | `"매직링크 발송에 실패했습니다: {에러 메시지}"`                      | 기타 서버 오류                                                                     |

#### DTO 검증 에러 (400)

다음과 같은 경우 400 에러가 발생합니다:

```json
{
  "statusCode": 400,
  "message": [
    "이메일은 필수입니다.",
    "유효하지 않은 이메일입니다.",
    "이메일은 문자열이어야 합니다.",
    "이메일은 255자 이하여야 합니다."
  ],
  "error": "Bad Request"
}
```

---

### GET `/api/auth/verify`

매직링크 토큰 검증 및 자동 인증 (브라우저 직접 접근용)

**⚠️ 주의**: 이 엔드포인트는 HTML 페이지를 반환합니다. (프론트엔드에서 직접 호출하지 않음)

#### 성공 응답 (302 Redirect)

```
Location: {FRONTEND_URL}?success=인증이 완료되었습니다.
```

#### 에러 응답 (HTML 페이지)

| 상태 코드 | 에러 메시지                                             | 발생 조건                                   |
| --------- | ------------------------------------------------------- | ------------------------------------------- |
| **400**   | `"토큰이 필요합니다. 유효한 인증 링크를 확인해주세요."` | `token` 쿼리 파라미터가 없음                |
| **400**   | `"토큰이 만료되었습니다."`                              | 토큰 만료 시간(10분) 초과                   |
| **401**   | `"유효하지 않은 토큰입니다."`                           | DB에 존재하지 않는 토큰                     |
| **401**   | `"이미 사용된 토큰입니다."`                             | 1회용 토큰이 이미 사용됨                    |
| **401**   | `"사용자를 찾을 수 없습니다."`                          | 토큰의 이메일에 해당하는 사용자가 DB에 없음 |
| **401**   | `"인증에 실패했습니다."`                                | 기타 인증 오류                              |
| **500**   | `"{서버 오류 메시지}"`                                  | 서버 내부 오류                              |

---

### GET `/api/auth/verify-api`

매직링크 토큰 검증 (API 호출용)

프론트엔드에서 프로그래밍 방식으로 호출할 때 사용합니다.

#### 성공 응답 (200)

```json
{
  "message": "인증이 완료되었습니다.",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지                    | 발생 조건                                   |
| --------- | ------------------------------ | ------------------------------------------- |
| **400**   | `"토큰이 필요합니다."`         | `token` 쿼리 파라미터가 없음                |
| **400**   | `"토큰이 만료되었습니다."`     | 토큰 만료 시간(10분) 초과                   |
| **401**   | `"유효하지 않은 토큰입니다."`  | DB에 존재하지 않는 토큰 또는 사용자 없음    |
| **401**   | `"이미 사용된 토큰입니다."`    | 1회용 토큰이 이미 사용됨                    |
| **401**   | `"사용자를 찾을 수 없습니다."` | 토큰의 이메일에 해당하는 사용자가 DB에 없음 |

---

### GET `/api/auth/me`

현재 로그인한 사용자 정보 조회

#### 성공 응답 (200)

```json
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지              | 발생 조건                                |
| --------- | ------------------------ | ---------------------------------------- |
| **401**   | `"로그인이 필요합니다."` | 세션에 `userId`가 없음 (로그인하지 않음) |

#### 프론트엔드 처리 예시

```javascript
// 세션이 없으면 로그인 페이지로 리다이렉트
if (response.status === 401) {
  window.location.href = '/login';
}
```

---

### POST `/api/auth/logout`

로그아웃

#### 성공 응답 (200)

```json
{
  "message": "로그아웃되었습니다."
}
```

#### 에러 응답

없음 (항상 성공)

---

## Todo API 에러

### GET `/api/todo`

전체 Todo 목록 조회

#### 성공 응답 (200)

```json
[
  {
    "id": 1,
    "title": "Todo 제목",
    "content": "Todo 내용",
    "deadLine": "2024-12-31",
    "isDone": "N",
    "creation": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 에러 응답

| 상태 코드 | 에러 메시지               | 발생 조건                      |
| --------- | ------------------------- | ------------------------------ |
| **500**   | `"Internal server error"` | DB 연결 오류 등 서버 내부 오류 |

---

### GET `/api/todo/:id`

특정 Todo 조회

#### 성공 응답 (200)

```json
{
  "id": 1,
  "title": "Todo 제목",
  "content": "Todo 내용",
  "deadLine": "2024-12-31",
  "isDone": "N",
  "creation": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지               | 발생 조건                      |
| --------- | ------------------------- | ------------------------------ |
| **404**   | `"Todo not found"`        | 해당 ID의 Todo가 존재하지 않음 |
| **500**   | `"Internal server error"` | DB 연결 오류 등 서버 내부 오류 |

---

### POST `/api/todo`

Todo 생성

#### Request Body

```json
{
  "title": "Todo 제목",
  "content": "Todo 내용"
}
```

#### 성공 응답 (200)

```json
{
  "id": 1,
  "title": "Todo 제목",
  "content": "Todo 내용",
  "deadLine": "2024-12-31",
  "isDone": "N",
  "creation": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지                                              | 발생 조건                                                                              |
| --------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **400**   | `["title must be a string", "content must be a string"]` | DTO 검증 실패<br/>- `title` 또는 `content`가 `string` 타입이 아님<br/>- 필수 필드 누락 |
| **500**   | `"Internal server error"`                                | DB 연결 오류 등 서버 내부 오류                                                         |

#### DTO 검증 에러 예시 (400)

```json
{
  "statusCode": 400,
  "message": ["title must be a string", "content must be a string"],
  "error": "Bad Request"
}
```

---

### PUT `/api/todo/:id`

Todo 수정

#### Request Body

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용",
  "completed": false
}
```

**모든 필드는 선택사항 (optional)**

#### 성공 응답 (200)

```json
{
  "id": 1,
  "title": "수정된 제목",
  "content": "수정된 내용",
  "deadLine": "2024-12-31",
  "isDone": "N",
  "creation": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지                       | 발생 조건                                          |
| --------- | --------------------------------- | -------------------------------------------------- |
| **400**   | `["title must be a string", ...]` | DTO 검증 실패<br/>- 전달된 필드가 타입과 맞지 않음 |
| **404**   | `"Todo not found"`                | 해당 ID의 Todo가 존재하지 않음                     |
| **500**   | `"Internal server error"`         | DB 연결 오류 등 서버 내부 오류                     |

---

### DELETE `/api/todo/:id`

Todo 삭제

#### 성공 응답 (200)

```json
{
  "raw": [],
  "affected": 1
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지               | 발생 조건                      |
| --------- | ------------------------- | ------------------------------ |
| **404**   | `"Todo not found"`        | 해당 ID의 Todo가 존재하지 않음 |
| **500**   | `"Internal server error"` | DB 연결 오류 등 서버 내부 오류 |

---

### PATCH `/api/todo/:id/toggle`

Todo 완료 여부 토글

#### 성공 응답 (200)

```json
{
  "id": 1,
  "title": "Todo 제목",
  "content": "Todo 내용",
  "deadLine": "2024-12-31",
  "isDone": "Y",
  "creation": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

| 상태 코드 | 에러 메시지               | 발생 조건                      |
| --------- | ------------------------- | ------------------------------ |
| **404**   | `"Todo not found"`        | 해당 ID의 Todo가 존재하지 않음 |
| **500**   | `"Internal server error"` | DB 연결 오류 등 서버 내부 오류 |

---

## 전역 에러 처리

### ValidationPipe (DTO 검증)

모든 엔드포인트에서 DTO 검증 실패 시 자동으로 400 에러가 반환됩니다.

#### 에러 응답 형식

```json
{
  "statusCode": 400,
  "message": [
    "필드명 must be a string",
    "필드명 must be an email",
    "필드명 should not be empty"
  ],
  "error": "Bad Request"
}
```

#### ValidationPipe 옵션

- `transform: true` - 자동 타입 변환
- `whitelist: true` - DTO에 정의되지 않은 필드는 제거
- `forbidNonWhitelisted: true` - DTO에 정의되지 않은 필드가 있으면 에러

---

### 전역 Exception Filter

모든 예외는 `AllExceptionsFilter`에서 처리됩니다.

#### 에러 응답 형식

```json
{
  "statusCode": 500,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/todo",
  "message": "Internal server error"
}
```

#### 처리되는 예외

- `HttpException` - 상태 코드와 메시지 그대로 반환
- 일반 `Error` - 500 Internal Server Error로 변환
- 알 수 없는 예외 - 500 Internal Server Error로 변환

---

## 프론트엔드 에러 처리 가이드

### 1. 기본 에러 처리 함수

```javascript
async function handleApiError(response) {
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);

    switch (error.statusCode) {
      case 400:
        // 잘못된 요청
        alert(error.message || '잘못된 요청입니다.');
        break;
      case 401:
        // 인증 필요
        window.location.href = '/login';
        break;
      case 404:
        // 리소스 없음
        alert(error.message || '찾을 수 없습니다.');
        break;
      case 429:
        // Rate Limit 초과
        alert('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
      case 500:
        // 서버 오류
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        break;
      default:
        alert('알 수 없는 오류가 발생했습니다.');
    }

    throw new Error(error.message || 'API Error');
  }

  return response.json();
}
```

### 2. 사용 예시

```javascript
// API 호출 예시
try {
  const response = await fetch('/api/auth/me', {
    credentials: 'include', // 쿠키 포함
  });

  if (response.status === 401) {
    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
    return;
  }

  const data = await handleApiError(response);
  console.log('User:', data);
} catch (error) {
  console.error('Error:', error);
}
```

### 3. Rate Limit 에러 처리

```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const waitTime = retryAfter ? parseInt(retryAfter) : 60;

  alert(`${waitTime}초 후 다시 시도해주세요.`);
  // 또는 재시도 로직 구현
}
```

---

## 상태 코드 요약

| 상태 코드 | 의미                  | 주요 발생 케이스                              |
| --------- | --------------------- | --------------------------------------------- |
| **400**   | Bad Request           | DTO 검증 실패, 토큰 만료, 잘못된 요청         |
| **401**   | Unauthorized          | 인증 실패, 로그인 필요                        |
| **404**   | Not Found             | 리소스를 찾을 수 없음 (Todo, User 등)         |
| **429**   | Too Many Requests     | Rate Limit 초과                               |
| **500**   | Internal Server Error | 서버 내부 오류 (DB 오류, 이메일 발송 실패 등) |

---

## 참고사항

1. **세션 기반 인증**: 모든 인증은 세션(쿠키) 기반입니다. `credentials: 'include'` 옵션을 사용해야 합니다.

2. **CORS**: 크로스 도메인 요청 시 적절한 CORS 헤더가 설정되어 있습니다.

3. **Rate Limiting**: `/api/auth/send-magic-link` 엔드포인트는 Rate Limit이 적용됩니다.
   - 1분에 5회 초과 시 429 에러
   - 1시간에 10회 초과 시 429 에러

4. **매직링크 토큰**:
   - 만료 시간: 10분
   - 1회용 (사용 후 즉시 만료)

5. **에러 로깅**: 모든 에러는 서버 측에서 로깅됩니다. 프론트엔드는 사용자에게 적절한 메시지를 표시해야 합니다.

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2024-01-01
