# TodoList API 명세서

## 기본 정보

| 항목         | 내용                                |
| ------------ | ----------------------------------- |
| Base URL     | `{VITE_API_BASE_URL}`               |
| 인증 방식    | Cookie 기반 (withCredentials: true) |
| Content-Type | `application/json`                  |

---

## 인증 API

### 회원가입/로그인 매직링크 발송

| 항목             | 내용                                                    |
| ---------------- | ------------------------------------------------------- |
| **Method**       | `POST`                                                  |
| **Endpoint**     | `/api/auth/send-magic-link`                             |
| **설명**         | 이메일로 매직링크 발송 (회원가입/로그인 통합)           |
| **Request Body** | `{ "email": "user@example.com" }`                       |
| **Response 200** | `{ "message": "인증 링크가 이메일로 발송되었습니다." }` |

### 매직링크 인증

| 항목                 | 내용                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Method**           | `GET`                                                                                       |
| **Endpoint**         | `/api/auth/verify?token={token}`                                                            |
| **설명**             | 매직링크 토큰으로 인증 완료                                                                 |
| **Query Parameters** | `token`: 이메일로 발송된 인증 토큰                                                          |
| **Response 200**     | `{ "message": "인증이 완료되었습니다.", "user": { "id": 1, "email": "user@example.com" } }` |
| **Response 401**     | `{ "error": "유효하지 않은 토큰입니다." }`                                                  |

### 로그아웃

| 항목             | 내용                                   |
| ---------------- | -------------------------------------- |
| **Method**       | `POST`                                 |
| **Endpoint**     | `/api/auth/logout`                     |
| **설명**         | 현재 세션 로그아웃                     |
| **Response 200** | `{ "message": "로그아웃되었습니다." }` |

---

## Todo API

### Todo 목록 조회

| 항목                 | 내용                                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Method**           | `GET`                                                                                                                                          |
| **Endpoint**         | `/api/todos`                                                                                                                                   |
| **설명**             | Todo 목록 조회 (필터링, 검색, 페이징)                                                                                                          |
| **Query Parameters** | `filter`: "all" \| "today" \| "d-minus-three"<br>`search`: 검색어<br>`page`: 페이지 번호 (기본값: 1)<br>`limit`: 페이지당 항목 수 (기본값: 10) |
| **Response 200**     | `{ "data": [...], "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 50, "itemsPerPage": 10 } }`                                 |

### Todo 상세 조회

| 항목                | 내용                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Method**          | `GET`                                                                                                           |
| **Endpoint**        | `/api/todos/:id`                                                                                                |
| **설명**            | 특정 Todo 상세 정보 조회                                                                                        |
| **Path Parameters** | `id`: Todo ID                                                                                                   |
| **Response 200**    | `{ "data": { "id": 1, "creation": "2025-05-01", "deadLine": "2025-05-30", "isDone": "Y", "content": "내용" } }` |
| **Response 404**    | `{ "error": "Todo not found" }`                                                                                 |

### Todo 생성

| 항목             | 내용                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Method**       | `POST`                                                                                                                |
| **Endpoint**     | `/api/todos`                                                                                                          |
| **설명**         | 새로운 Todo 생성                                                                                                      |
| **Request Body** | `{ "deadLine": "2025-05-30", "content": "Todo 내용" }`                                                                |
| **Response 201** | `{ "data": { "id": 17, "creation": "2025-05-15", "deadLine": "2025-05-30", "isDone": "N", "content": "Todo 내용" } }` |
| **Response 400** | `{ "error": "Validation failed", "details": [...] }`                                                                  |

### Todo 수정

| 항목                | 내용                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Method**          | `PUT`                                                                                                                  |
| **Endpoint**        | `/api/todos/:id`                                                                                                       |
| **설명**            | Todo 정보 수정                                                                                                         |
| **Path Parameters** | `id`: Todo ID                                                                                                          |
| **Request Body**    | `{ "deadLine": "2025-06-01", "content": "수정된 내용", "isDone": "Y" }`                                                |
| **Response 200**    | `{ "data": { "id": 1, "creation": "2025-05-01", "deadLine": "2025-06-01", "isDone": "Y", "content": "수정된 내용" } }` |
| **Response 404**    | `{ "error": "Todo not found" }`                                                                                        |

### Todo 삭제

| 항목                | 내용                                         |
| ------------------- | -------------------------------------------- |
| **Method**          | `DELETE`                                     |
| **Endpoint**        | `/api/todos/:id`                             |
| **설명**            | Todo 삭제                                    |
| **Path Parameters** | `id`: Todo ID                                |
| **Response 200**    | `{ "message": "Todo deleted successfully" }` |
| **Response 404**    | `{ "error": "Todo not found" }`              |

### Todo 완료 상태 토글

| 항목                | 내용                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Method**          | `PATCH`                                                                                                         |
| **Endpoint**        | `/api/todos/:id/toggle`                                                                                         |
| **설명**            | Todo 완료 상태 토글 (Y ↔ N)                                                                                     |
| **Path Parameters** | `id`: Todo ID                                                                                                   |
| **Response 200**    | `{ "data": { "id": 1, "creation": "2025-05-01", "deadLine": "2025-05-30", "isDone": "N", "content": "내용" } }` |
| **Response 404**    | `{ "error": "Todo not found" }`                                                                                 |

---

## 데이터 모델

### Todo

| 필드명     | 타입   | 필수 | 설명                     |
| ---------- | ------ | ---- | ------------------------ |
| `id`       | number | O    | Todo 고유 식별자         |
| `creation` | string | O    | 생성일 (YYYY-MM-DD)      |
| `deadLine` | string | O    | 마감일 (YYYY-MM-DD)      |
| `isDone`   | string | O    | 완료 여부 ("Y" 또는 "N") |
| `content`  | string | O    | Todo 내용                |

---

## 에러 코드

| HTTP 상태 코드 | 설명                           |
| -------------- | ------------------------------ |
| 200            | 성공                           |
| 201            | 생성 성공                      |
| 400            | 잘못된 요청 (유효성 검사 실패) |
| 401            | 인증 실패                      |
| 404            | 리소스를 찾을 수 없음          |
| 500            | 서버 내부 오류                 |
