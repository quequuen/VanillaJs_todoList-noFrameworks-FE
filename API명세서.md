# TodoList API 명세서

## 기본 정보

| 항목         | 내용                                     |
| ------------ | ---------------------------------------- |
| Base URL     | `{VITE_API_BASE_URL}`                    |
| 인증 방식    | Cookie 기반 세션 (withCredentials: true) |
| Content-Type | `application/json`                       |
| CORS 설정    | 프론트엔드 도메인 허용 필요              |

### 인증 방식 상세

- **Cookie 기반 세션**: `withCredentials: true`로 쿠키 자동 전송
- **세션 저장**: 백엔드에서 세션 저장소 사용 (Redis, Memory 등)
- **세션 쿠키**: httpOnly 설정 권장 (보안)
- **인증 필요한 API**: Todo CRUD 작업 (로그인 사용자만)
- **인증 불필요한 API**: 매직링크 발송, 매직링크 인증

---

## 인증 API

### 1. 회원가입/로그인 매직링크 발송

**엔드포인트**: `POST /api/auth/send-magic-link`

**인증 필요**: 없음

**설명**: 이메일로 매직링크 발송 (회원가입/로그인 통합)

- 이메일이 DB에 없으면 신규 사용자로 회원가입 처리
- 이메일이 DB에 있으면 기존 사용자로 로그인 처리
- 매직링크 토큰 생성 후 이메일 발송

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**유효성 검사**:

- `email`: 필수, 이메일 형식 검증

**Response 200**:

```json
{
  "message": "인증 링크가 이메일로 발송되었습니다."
}
```

**Response 400**:

```json
{
  "error": "유효하지 않은 이메일입니다."
}
```

**백엔드 구현 가이드**:

1. 이메일 형식 검증
2. DB에서 사용자 조회 (없으면 생성)
3. 매직링크 토큰 생성 (JWT 또는 UUID 권장, 만료시간: 15분~1시간)
4. 토큰을 DB 또는 캐시에 저장 (키: 토큰, 값: 이메일, TTL: 만료시간)
5. 이메일 발송 (매직링크: `{프론트엔드_URL}/verify?token={토큰}`)
6. 응답 반환

---

### 2. 매직링크 인증

**엔드포인트**: `GET /api/auth/verify?token={token}`

**인증 필요**: 없음 (토큰으로 인증)

**설명**: 매직링크 토큰으로 인증 완료

- 토큰 검증 후 세션 생성
- Cookie에 세션 ID 저장

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
| -------- | ------ | ---- | ----------------- |
| `token` | string | O | 매직링크 토큰 |

**Response 200**:

```json
{
  "message": "인증이 완료되었습니다.",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Response 401**:

```json
{
  "error": "유효하지 않은 토큰입니다."
}
```

**Response 400**:

```json
{
  "error": "토큰이 만료되었습니다."
}
```

**백엔드 구현 가이드**:

1. 토큰 조회 (DB 또는 캐시)
2. 토큰 유효성 검증 (존재 여부, 만료 시간 확인)
3. 토큰에서 이메일 추출
4. 사용자 정보 조회
5. 세션 생성 (세션 ID 생성 후 세션 저장소에 저장)
6. Cookie 설정:
   - `httpOnly: true` (보안)
   - `secure: true` (HTTPS 환경)
   - `sameSite: 'lax'` (CORS 환경)
   - `maxAge: 7일` (세션 유지 기간)
7. 사용한 토큰 삭제 (1회용)
8. 사용자 정보 반환

---

### 3. 로그아웃

**엔드포인트**: `POST /api/auth/logout`

**인증 필요**: 필요 (세션 기반)

**설명**: 현재 세션 로그아웃

- 세션 삭제
- Cookie 제거

**Request Body**: 없음

**Response 200**:

```json
{
  "message": "로그아웃되었습니다."
}
```

**Response 401**:

```json
{
  "error": "인증이 필요합니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 정보 확인
2. 세션 삭제 (세션 저장소에서 제거)
3. Cookie 삭제 (세션 쿠키 제거)
4. 응답 반환

---

## Todo API

**⚠️ 모든 Todo API는 인증이 필요합니다. (세션 기반)**

- 인증되지 않은 경우: `401 Unauthorized` 반환
- 사용자는 본인의 Todo만 조회/수정/삭제 가능

---

### 1. Todo 목록 조회

**엔드포인트**: `GET /api/todos`

**인증 필요**: 필요

**설명**: 로그인한 사용자의 Todo 목록 조회 (필터링, 검색, 페이징)

**Query Parameters**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
| -------- | ------ | ---- | ------ | --------------------------------------- |
| `filter` | string | N | "all" | 필터: "all" \| "today" \| "d-minus-three" |
| `search` | string | N | - | 검색어 (content 필드 검색) |
| `page` | number | N | 1 | 페이지 번호 |
| `limit` | number | N | 10 | 페이지당 항목 수 |

**필터 설명**:

- `all`: 모든 Todo
- `today`: 오늘 마감인 Todo (deadLine === 오늘 날짜)
- `d-minus-three`: 오늘부터 3일 이내 마감인 Todo

**Response 200**:

```json
{
  "data": [
    {
      "id": 1,
      "creation": "2025-05-01",
      "deadLine": "2025-05-30",
      "isDone": "Y",
      "content": "javaScript 공부하기"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

**Response 401**:

```json
{
  "error": "인증이 필요합니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. 필터 적용:
   - `today`: `deadLine = 오늘 날짜`
   - `d-minus-three`: `deadLine BETWEEN 오늘 AND 오늘+3일`
   - `all`: 필터 없음
3. 검색 적용 (search가 있으면): `content LIKE '%검색어%'`
4. 정렬: `deadLine ASC` (마감일 가까운 순)
5. 페이징 적용 (LIMIT, OFFSET)
6. 사용자의 Todo만 조회 (`userId = 세션의 사용자 ID`)
7. 총 개수 계산
8. 응답 반환

---

### 2. Todo 상세 조회

**엔드포인트**: `GET /api/todos/:id`

**인증 필요**: 필요

**설명**: 특정 Todo 상세 정보 조회

**Path Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
| -------- | ------ | ---- | ------- |
| `id` | number | O | Todo ID |

**Response 200**:

```json
{
  "data": {
    "id": 1,
    "creation": "2025-05-01",
    "deadLine": "2025-05-30",
    "isDone": "Y",
    "content": "javaScript 공부하기"
  }
}
```

**Response 404**:

```json
{
  "error": "Todo not found"
}
```

**Response 403**:

```json
{
  "error": "접근 권한이 없습니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. Todo 조회 (`id`와 `userId`로 조회)
3. Todo가 없거나 다른 사용자의 Todo면 404 또는 403 반환
4. 응답 반환

---

### 3. Todo 생성

**엔드포인트**: `POST /api/todos`

**인증 필요**: 필요

**설명**: 새로운 Todo 생성

**Request Body**:

```json
{
  "deadLine": "2025-05-30",
  "content": "Todo 내용"
}
```

**유효성 검사**:

- `deadLine`: 필수, 날짜 형식 (YYYY-MM-DD), 오늘 이후 날짜
- `content`: 필수, 문자열, 1자 이상

**Response 201**:

```json
{
  "data": {
    "id": 17,
    "creation": "2025-05-15",
    "deadLine": "2025-05-30",
    "isDone": "N",
    "content": "Todo 내용"
  }
}
```

**Response 400**:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "deadLine",
      "message": "날짜를 선택하세요."
    },
    {
      "field": "content",
      "message": "Todo를 작성하세요."
    }
  ]
}
```

**Response 401**:

```json
{
  "error": "인증이 필요합니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. 유효성 검사 (deadLine, content)
3. `creation`: 현재 날짜 자동 설정
4. `isDone`: "N" 기본값
5. `userId`: 세션의 사용자 ID 저장
6. DB에 저장
7. 저장된 Todo 반환

---

### 4. Todo 수정

**엔드포인트**: `PUT /api/todos/:id`

**인증 필요**: 필요

**설명**: Todo 정보 수정 (본인의 Todo만 수정 가능)

**Path Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
| -------- | ------ | ---- | ------- |
| `id` | number | O | Todo ID |

**Request Body**:

```json
{
  "deadLine": "2025-06-01",
  "content": "수정된 내용",
  "isDone": "Y"
}
```

**유효성 검사**:

- `deadLine`: 필수, 날짜 형식 (YYYY-MM-DD)
- `content`: 필수, 문자열, 1자 이상
- `isDone`: 필수, "Y" 또는 "N"

**Response 200**:

```json
{
  "data": {
    "id": 1,
    "creation": "2025-05-01",
    "deadLine": "2025-06-01",
    "isDone": "Y",
    "content": "수정된 내용"
  }
}
```

**Response 404**:

```json
{
  "error": "Todo not found"
}
```

**Response 403**:

```json
{
  "error": "접근 권한이 없습니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. Todo 조회 (`id`와 `userId`로 조회)
3. Todo가 없거나 다른 사용자의 Todo면 404 또는 403 반환
4. 유효성 검사
5. Todo 업데이트
6. 업데이트된 Todo 반환

---

### 5. Todo 삭제

**엔드포인트**: `DELETE /api/todos/:id`

**인증 필요**: 필요

**설명**: Todo 삭제 (본인의 Todo만 삭제 가능)

**Path Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
| -------- | ------ | ---- | ------- |
| `id` | number | O | Todo ID |

**Response 200**:

```json
{
  "message": "Todo deleted successfully"
}
```

**Response 404**:

```json
{
  "error": "Todo not found"
}
```

**Response 403**:

```json
{
  "error": "접근 권한이 없습니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. Todo 조회 (`id`와 `userId`로 조회)
3. Todo가 없거나 다른 사용자의 Todo면 404 또는 403 반환
4. Todo 삭제
5. 성공 메시지 반환

---

### 6. Todo 완료 상태 토글

**엔드포인트**: `PATCH /api/todos/:id/toggle`

**인증 필요**: 필요

**설명**: Todo 완료 상태 토글 (Y ↔ N)

**Path Parameters**:
| 파라미터 | 타입 | 필수 | 설명 |
| -------- | ------ | ---- | ------- |
| `id` | number | O | Todo ID |

**Response 200**:

```json
{
  "data": {
    "id": 1,
    "creation": "2025-05-01",
    "deadLine": "2025-05-30",
    "isDone": "N",
    "content": "내용"
  }
}
```

**Response 404**:

```json
{
  "error": "Todo not found"
}
```

**Response 403**:

```json
{
  "error": "접근 권한이 없습니다."
}
```

**백엔드 구현 가이드**:

1. 세션에서 사용자 ID 확인
2. Todo 조회 (`id`와 `userId`로 조회)
3. Todo가 없거나 다른 사용자의 Todo면 404 또는 403 반환
4. `isDone` 상태 토글 (Y → N, N → Y)
5. 업데이트된 Todo 반환

---

## 데이터 모델

### User

| 필드명  | 타입   | 필수 | 설명          |
| ------- | ------ | ---- | ------------- |
| `id`    | number | O    | 사용자 ID     |
| `email` | string | O    | 이메일 (고유) |

### Todo

| 필드명     | 타입   | 필수 | 설명                     |
| ---------- | ------ | ---- | ------------------------ |
| `id`       | number | O    | Todo 고유 식별자         |
| `userId`   | number | O    | 사용자 ID (외래키)       |
| `creation` | string | O    | 생성일 (YYYY-MM-DD)      |
| `deadLine` | string | O    | 마감일 (YYYY-MM-DD)      |
| `isDone`   | string | O    | 완료 여부 ("Y" 또는 "N") |
| `content`  | string | O    | Todo 내용                |

### Magic Link Token (임시 저장)

| 필드명    | 타입     | 필수 | 설명        |
| --------- | -------- | ---- | ----------- |
| `token`   | string   | O    | 토큰 (고유) |
| `email`   | string   | O    | 이메일      |
| `expires` | datetime | O    | 만료 시간   |

---

## 데이터베이스 스키마 예시

### Users 테이블

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Todos 테이블

```sql
CREATE TABLE todos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  creation DATE NOT NULL,
  dead_line DATE NOT NULL,
  is_done CHAR(1) DEFAULT 'N' CHECK (is_done IN ('Y', 'N')),
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_deadline (user_id, dead_line),
  INDEX idx_user_done (user_id, is_done)
);
```

### Magic Link Tokens 테이블 (또는 Redis 캐시)

```sql
CREATE TABLE magic_link_tokens (
  token VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expires (expires_at)
);
```

**또는 Redis 사용 (권장)**:

- Key: `magic_link:{token}`
- Value: `{email: "user@example.com"}`
- TTL: 15분 ~ 1시간

---

## 인증 및 세션 관리

### 세션 저장소

- **개발 환경**: 메모리 세션 저장소 사용 가능
- **프로덕션 환경**: Redis 또는 DB 세션 저장소 권장

### 세션 구조

```javascript
{
  userId: 1,
  email: "user@example.com",
  createdAt: "2025-05-15T10:00:00Z"
}
```

### Cookie 설정

```javascript
{
  httpOnly: true,      // JavaScript 접근 불가 (XSS 방지)
  secure: true,        // HTTPS 환경에서만 전송 (프로덕션)
  sameSite: 'lax',    // CORS 요청 허용
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7일
}
```

---

## CORS 설정

**필수 CORS 헤더**:

```
Access-Control-Allow-Origin: {프론트엔드_URL}
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**예시 (Express.js)**:

```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
```

---

## 에러 코드

| HTTP 상태 코드 | 설명                           | 예시                                     |
| -------------- | ------------------------------ | ---------------------------------------- |
| 200            | 성공                           | 목록 조회, 수정, 삭제 성공               |
| 201            | 생성 성공                      | Todo 생성 성공                           |
| 400            | 잘못된 요청 (유효성 검사 실패) | 이메일 형식 오류, 필수 필드 누락         |
| 401            | 인증 실패                      | 세션 없음, 토큰 만료, 토큰 유효하지 않음 |
| 403            | 접근 권한 없음                 | 다른 사용자의 Todo 접근 시도             |
| 404            | 리소스를 찾을 수 없음          | 존재하지 않는 Todo                       |
| 500            | 서버 내부 오류                 | DB 연결 실패, 예상치 못한 에러           |

---

## 구현 순서 추천

1. **인증 API 구현**:

   - 매직링크 발송
   - 매직링크 인증 (세션 생성)
   - 로그아웃

2. **Todo API 구현**:

   - Todo 생성
   - Todo 목록 조회 (필터링, 검색, 페이징)
   - Todo 상세 조회
   - Todo 수정
   - Todo 완료 상태 토글
   - Todo 삭제

3. **미들웨어 구현**:
   - 인증 미들웨어 (세션 검증)
   - 에러 핸들링 미들웨어
   - CORS 설정

---

## 주의사항

1. **보안**:

   - Cookie httpOnly 설정 필수
   - HTTPS 사용 시 secure: true
   - SQL Injection 방지 (Prepared Statement 사용)
   - XSS 방지 (입력값 검증)

2. **성능**:

   - Todo 목록 조회 시 인덱스 활용 (user_id, dead_line)
   - 페이징 필수 (limit 기본값 설정)
   - 매직링크 토큰은 Redis 사용 권장 (만료 시간 자동 처리)

3. **에러 처리**:

   - 일관된 에러 응답 형식 사용
   - 민감한 정보는 에러 메시지에 포함하지 않음
   - 로그에는 상세 정보 기록

4. **데이터 일관성**:
   - Todo 삭제 시 `userId` 확인 (본인 Todo만 삭제)
   - Todo 수정/조회 시도 시 `userId` 확인 (본인 Todo만 접근)
