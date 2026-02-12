# Hexagonal Architecture Research

**Họ tên:** Le Thanh Cong  
**Ngày nộp:** 11/02/2026

---

## 1. GIỚI THIỆU

Kiến trúc Hexagonal (Hexagonal Architecture), còn được gọi là **Ports and Adapters**, là một mẫu kiến trúc phần mềm được Alistair Cockburn đề xuất vào năm 2005. Kiến trúc này nhằm tạo ra các ứng dụng được phân tách lỏng lẻo (loosely coupled), có thể dễ dàng kiểm thử và duy trì.

Ý tưởng chính của kiến trúc này là **tách biệt logic nghiệp vụ cốt lõi khỏi các thành phần bên ngoài** như giao diện người dùng (UI), cơ sở dữ liệu, hoặc các dịch vụ bên thứ ba. Điều này giúp ứng dụng trở nên linh hoạt hơn, dễ kiểm thử, bảo trì và dễ dàng thích nghi với những thay đổi trong tương lai.

---

## 2. NGUYÊN LÝ CƠ BẢN VÀ CÁC THÀNH PHẦN

### 2.1. Khái niệm Hexagonal Architecture

Tên gọi "Hexagonal" (hình lục giác) chỉ mang tính tượng trưng và không có ý nghĩa đặc biệt về mặt toán học. Hình lục giác được chọn để minh họa rằng **ứng dụng có thể có nhiều điểm kết nối (ports) với thế giới bên ngoài**, và mỗi điểm kết nối này đều có vai trò như nhau.

### 2.2. Các thành phần chính

#### 2.2.1. Domain/Core (Miền nghiệp vụ)

Đây là trung tâm của ứng dụng, chứa:
- Logic nghiệp vụ (business logic) thuần túy
- Các quy tắc và luồng xử lý nghiệp vụ
- Domain models và entities

**⚠️ Lưu ý quan trọng:** Domain layer **không phụ thuộc** vào bất kỳ framework, thư viện hay công nghệ cụ thể nào. Nó hoàn toàn độc lập và có thể chạy mà không cần các thành phần bên ngoài.

#### 2.2.2. Ports (Cổng)

Ports là các **interface định nghĩa cách thức giao tiếp** giữa domain và thế giới bên ngoài. Có hai loại ports chính:

**Primary/Driving Ports (Cổng chính/điều khiển)**
- Định nghĩa các use cases mà ứng dụng cung cấp
- Đây là các interface để thế giới bên ngoài gọi vào ứng dụng
- Ví dụ: REST API, GraphQL, CLI

**Secondary/Driven Ports (Cổng phụ/bị điều khiển)**
- Định nghĩa các phụ thuộc mà ứng dụng cần từ bên ngoài
- Đây là các interface mà ứng dụng gọi ra ngoài
- Ví dụ: repository interfaces, external service interfaces

#### 2.2.3. Adapters (Bộ chuyển đổi)

Adapters là các **implementation cụ thể của ports**, kết nối ứng dụng với các công nghệ và framework bên ngoài:

**Primary Adapters:**
- REST controllers
- GraphQL resolvers
- CLI commands
- Message queue consumers

**Secondary Adapters:**
- Database repositories
- HTTP clients
- Email services
- File system access

### 2.3. Cách hoạt động

Luồng xử lý trong Hexagonal Architecture diễn ra theo trình tự sau:

```
1. Primary Adapter nhận request từ bên ngoài (ví dụ: HTTP request)
   ↓
2. Adapter chuyển đổi request thành domain model và gọi Primary Port
   ↓
3. Domain Core xử lý logic nghiệp vụ
   ↓
4. Nếu cần, Domain Core gọi Secondary Port để truy xuất dữ liệu
   ↓
5. Secondary Adapter thực hiện thao tác với hệ thống bên ngoài 
   (database, API, etc.)
   ↓
6. Kết quả được trả về qua các tầng và Primary Adapter chuyển đổi 
   thành response phù hợp
```

---

## 3. ƯU ĐIỂM VÀ NHƯỢC ĐIỂM

### 3.1. Ưu điểm

| Ưu điểm | Mô tả |
|---------|-------|
| **Tách biệt mối quan tâm** | Logic nghiệp vụ được tách biệt hoàn toàn khỏi các thành phần kỹ thuật như UI, database, framework. Điều này giúp code dễ hiểu, dễ bảo trì và giảm coupling. |
| **Dễ kiểm thử** | Domain logic có thể được test độc lập mà không cần database, web server hay các dependency phức tạp. Có thể dễ dàng mock các ports để viết unit tests. |
| **Linh hoạt công nghệ** | Dễ dàng thay đổi hoặc thêm adapters mới mà không ảnh hưởng đến domain core. Ví dụ: chuyển từ MySQL sang PostgreSQL, hoặc thêm GraphQL API bên cạnh REST API. |
| **Bảo vệ domain logic** | Domain không bị ô nhiễm bởi các framework hay thư viện bên ngoài. Logic nghiệp vụ vẫn ổn định ngay cả khi thay đổi công nghệ infrastructure. |
| **Hỗ trợ tích hợp** | Dễ dàng tích hợp với nhiều hệ thống và giao thức khác nhau thông qua việc tạo adapters mới. Hỗ trợ microservices và distributed systems. |

### 3.2. Nhược điểm

| Nhược điểm | Mô tả |
|-----------|-------|
| **Độ phức tạp ban đầu** | Yêu cầu nhiều boilerplate code hơn so với kiến trúc đơn giản. Cần tạo nhiều interfaces, adapters, và DTOs. Có thể gây khó khăn cho các dự án nhỏ hoặc prototype. |
| **Đường cong học tập** | Team cần hiểu rõ các khái niệm như dependency inversion, ports, adapters. Đòi hỏi kỷ luật cao để duy trì ranh giới giữa các layer. Người mới có thể gặp khó khăn ban đầu. |
| **Over-engineering** | Có thể gây ra over-engineering cho các ứng dụng đơn giản, CRUD cơ bản hoặc MVP (Minimum Viable Product). Không phù hợp cho mọi loại dự án. |
| **Chi phí phát triển** | Thời gian phát triển ban đầu có thể dài hơn do cần thiết kế và implement nhiều layers. Cần cân nhắc giữa lợi ích dài hạn và chi phí trước mắt. |

---

## 4. KHI NÀO NÊN ÁP DỤNG

### 4.1. Các trường hợp phù hợp

✅ **Dự án có logic nghiệp vụ phức tạp**  
Khi ứng dụng có nhiều quy tắc nghiệp vụ phức tạp cần được bảo vệ và tách biệt.

✅ **Dự án dài hạn và cần bảo trì**  
Các ứng dụng enterprise hoặc sản phẩm lớn cần phát triển và duy trì trong nhiều năm.

✅ **Yêu cầu tích hợp đa dạng**  
Cần kết nối với nhiều hệ thống khác nhau (multiple databases, external APIs, message queues).

✅ **Nhiều giao diện người dùng**  
Ứng dụng cần hỗ trợ đồng thời REST API, GraphQL, CLI, mobile app, web app.

✅ **Công nghệ hay thay đổi**  
Dự án có khả năng cao phải thay đổi database, framework, hoặc infrastructure trong tương lai.

✅ **Yêu cầu testing nghiêm ngặt**  
Các ứng dụng trong lĩnh vực tài chính, y tế, hoặc các hệ thống critical cần test coverage cao.

### 4.2. Các trường hợp không nên áp dụng

❌ **Ứng dụng CRUD đơn giản**  
Các ứng dụng chỉ thực hiện các thao tác Create, Read, Update, Delete cơ bản không cần kiến trúc phức tạp.

❌ **Prototype hoặc MVP**  
Khi cần validate ý tưởng nhanh và chưa chắc chắn về hướng phát triển.

❌ **Dự án ngắn hạn**  
Scripts nhỏ, tools nội bộ, hoặc các dự án có thời gian sống ngắn.

❌ **Team thiếu kinh nghiệm**  
Khi team chưa có kinh nghiệm với kiến trúc phân lớp hoặc DDD (Domain-Driven Design).

### 4.3. Ví dụ use cases cụ thể

#### Ví dụ 1: Hệ thống E-commerce

Một nền tảng thương mại điện tử có thể hưởng lợi từ Hexagonal Architecture vì:
- Logic tính giá, khuyến mãi, thuế phức tạp cần được tách biệt
- Cần tích hợp với nhiều payment gateways (Stripe, PayPal, VNPay)
- Hỗ trợ nhiều kênh bán hàng (web, mobile app, marketplace)
- Có thể cần thay đổi database từ SQL sang NoSQL để scale

#### Ví dụ 2: Hệ thống quản lý bệnh viện

Phù hợp với Hexagonal Architecture bởi vì:
- Quy trình nghiệp vụ phức tạp (lịch hẹn, kê đơn, điều trị)
- Cần tích hợp với nhiều thiết bị y tế và hệ thống khác
- Testing nghiêm ngặt để đảm bảo an toàn cho bệnh nhân
- Yêu cầu bảo mật cao và tuân thủ quy định y tế

---

## 5. SO SÁNH VỚI CÁC KIẾN TRÚC KHÁC

### 5.1. So sánh với Layered Architecture (N-Tier)

| Tiêu chí | Hexagonal Architecture | Layered Architecture |
|----------|------------------------|----------------------|
| **Hướng phụ thuộc** | Tất cả phụ thuộc vào Domain (dependency inversion) | Phụ thuộc từ trên xuống dưới (top-down) |
| **Tính linh hoạt** | Rất linh hoạt, dễ thay đổi infrastructure | Khó thay đổi data layer do dependency |
| **Khả năng test** | Domain có thể test độc lập hoàn toàn | Business logic phụ thuộc vào data layer |
| **Độ phức tạp** | Phức tạp hơn, nhiều abstractions | Đơn giản hơn, dễ hiểu |

### 5.2. So sánh với Clean Architecture

Clean Architecture của Robert C. Martin (Uncle Bob) và Hexagonal Architecture có nhiều điểm tương đồng:

**Giống nhau:**
- Cả hai đều áp dụng Dependency Inversion Principle
- Domain/Business logic ở trung tâm, độc lập với infrastructure
- Sử dụng interfaces để tách biệt các layers

**Khác nhau:**
- Clean Architecture có cấu trúc 4 layers cụ thể (Entities, Use Cases, Interface Adapters, Frameworks)
- Hexagonal Architecture tập trung vào khái niệm ports và adapters, linh hoạt hơn về số lượng layers

### 5.3. So sánh với Microservices Architecture

Hexagonal Architecture và Microservices giải quyết các vấn đề khác nhau:

- **Hexagonal Architecture:** Là kiến trúc bên trong một service/application, tập trung vào cách tổ chức code
- **Microservices:** Là kiến trúc hệ thống phân tán, tập trung vào cách chia nhỏ hệ thống thành các services độc lập

**Thực tế:** Hexagonal Architecture thường được áp dụng bên trong mỗi microservice để đảm bảo code quality và maintainability.

---

## 6. KẾT LUẬN

Hexagonal Architecture là một mẫu kiến trúc mạnh mẽ giúp xây dựng các ứng dụng có khả năng bảo trì cao, dễ kiểm thử và linh hoạt về mặt công nghệ. Bằng cách tách biệt logic nghiệp vụ khỏi các thành phần kỹ thuật thông qua ports và adapters, kiến trúc này cho phép developers tập trung vào giải quyết vấn đề nghiệp vụ mà không bị ràng buộc bởi framework hay công nghệ cụ thể.

### Kiến trúc này đặc biệt có giá trị cho:

- Các ứng dụng enterprise với logic nghiệp vụ phức tạp
- Dự án dài hạn cần bảo trì và phát triển trong nhiều năm
- Hệ thống cần tích hợp với nhiều dịch vụ và công nghệ khác nhau
- Ứng dụng yêu cầu test coverage cao và quality assurance nghiêm ngặt

### Chiến lược áp dụng khôn ngoan:

Khi quyết định áp dụng Hexagonal Architecture, team cần cân nhắc kỹ giữa **lợi ích dài hạn** (maintainability, testability, flexibility) và **chi phí ban đầu** (learning curve, boilerplate code, development time).

Một chiến lược khôn ngoan là **bắt đầu với kiến trúc đơn giản** hơn cho MVP, sau đó **dần dần refactor** sang Hexagonal Architecture khi dự án phát triển và yêu cầu trở nên phức tạp hơn.

Cuối cùng, việc thành công trong việc áp dụng Hexagonal Architecture không chỉ phụ thuộc vào **kiến thức về mẫu thiết kế**, mà còn vào **kỷ luật của team** trong việc duy trì ranh giới giữa các layers, tuân thủ các nguyên tắc SOLID, và liên tục refactor để giữ code clean và maintainable.

---

## 📚 TÀI LIỆU THAM KHẢO

1. Cockburn, A. (2005). "Hexagonal Architecture". Alistair Cockburn's website.
2. Martin, R. C. (2017). "Clean Architecture: A Craftsman's Guide to Software Structure and Design". Prentice Hall.
3. Vernon, V. (2013). "Implementing Domain-Driven Design". Addison-Wesley Professional.
4. Freeman, S. & Pryce, N. (2009). "Growing Object-Oriented Software, Guided by Tests". Addison-Wesley Professional.