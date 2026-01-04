+++
title = "Building APIs That Don't Suck: A Spring Boot Journey"
date = 2025-12-31
description = "Lessons learned from building REST APIs that people actually want to use (and maintaining them at 3 AM)"

[taxonomies]
tags = ["java", "spring-boot", "backend", "api", "development"]
categories = ["Backend Development"]
+++

I've built a lot of APIs. Some were good. Most were "good enough." A few were trainwrecks that still haunt me. Here's what I've learned about building REST APIs with Spring Boot that won't make your teammates (or your future self) want to cry.

## Why Spring Boot Though?

Let's be honest - Java gets a lot of hate. "Too verbose." "Boilerplate hell." "Why is everything an AbstractFactoryBean?"

Spring Boot fixed most of that. It's opinionated enough to get you started fast, but flexible enough to not box you in. Plus:

- Auto-configuration that actually works
- Embedded Tomcat (no more XML deployment nightmares)
- Production-ready features out of the box
- A massive ecosystem for literally everything
- Great documentation (rare for Java)

Is it perfect? No. But it's solid, battle-tested, and won't randomly explode in production (unlike some frameworks I won't name).

## The Anatomy of a Not-Terrible API

Let's build something real - a basic user management API that doesn't make API consumers want to quit their job.

### Project Setup

```xml
<dependencies>
    <!-- Core Web stuff -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Database magic -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Validation (please validate your inputs) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- PostgreSQL because we're not animals -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
</dependencies>
```

### The Controller (Where HTTP Happens)

```java
@RestController
@RequestMapping("/api/v1/users")  // Version your APIs, past you will thank future you
@RequiredArgsConstructor  // Lombok instead of constructor boilerplate
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
        @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable
    ) {
        // ALWAYS paginate list endpoints
        // Your database will thank you
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody UserCreateRequest request
    ) {
        UserResponse user = userService.create(request);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(user.getId())
            .toUri();
        return ResponseEntity.created(location).body(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

## The Lessons I Learned the Hard Way

### 1. Use DTOs, Not Entities

**Bad:**

```java
@PostMapping
public User create(@RequestBody User user) {
    return userRepository.save(user);  // NOPE
}
```

Why bad? You're exposing your entire entity structure. Client sends a password hash? Saved. Client sends an admin flag? Now they're admin. Congrats, you've been hacked.

**Good:**

```java
public record UserCreateRequest(
    @NotBlank String username,
    @Email String email,
    @Size(min = 8) String password
) {}

public record UserResponse(
    Long id,
    String username,
    String email,
    LocalDateTime createdAt
) {
    // No password here, notice?
}
```

### 2. Exception Handling That Doesn't Suck

Global exception handler with `@ControllerAdvice`:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
        MethodArgumentNotValidException ex
    ) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .toList();

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors,
                LocalDateTime.now()
            ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // Log the actual error
        log.error("Unexpected error", ex);

        // Don't expose internal errors to clients
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Something went wrong",
                LocalDateTime.now()
            ));
    }
}
```

### 3. Pagination Is Not Optional

If your endpoint returns a list, paginate it. Period.

```java
@GetMapping
public ResponseEntity<Page<UserResponse>> getAllUsers(
    @PageableDefault(size = 20, sort = "createdAt", direction = DESC)
    Pageable pageable,
    @RequestParam(required = false) String search
) {
    Page<UserResponse> users = search != null
        ? userService.search(search, pageable)
        : userService.findAll(pageable);

    return ResponseEntity.ok(users);
}
```

### 4. Database Queries That Don't Kill Performance

**N+1 queries will destroy you:**

```java
// BAD - fires N+1 queries
@OneToMany(mappedBy = "user")
private List<Order> orders;  // Fetches orders lazily = N extra queries

// GOOD - fetch with JOIN
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);
```

**Use projections for list endpoints:**

```java
public interface UserSummary {
    Long getId();
    String getUsername();
    String getEmail();
    // Only what you need, not the whole entity
}

@Query("SELECT u.id as id, u.username as username, u.email as email FROM User u")
Page<UserSummary> findAllSummaries(Pageable pageable);
```

## The Performance Stuff That Actually Matters

### 1. Caching (Use it)

```java
@Service
public class UserService {

    @Cacheable(value = "users", key = "#id")
    public Optional<UserResponse> findById(Long id) {
        // Only hits DB if not in cache
        return userRepository.findById(id)
            .map(this::toResponse);
    }

    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
```

### 2. Connection Pooling

```properties
# application.properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

### 3. Indexes (Add them before your DB melts)

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_username", columnList = "username")
})
public class User {
    // ...
}
```

## Things I Wish Someone Told Me Earlier

1. **Version your API from day one.** Adding `/v1/` later is painful.
2. **Log everything important** (requests, errors, slow queries). Future you debugging at 3 AM will be grateful.
3. **Write integration tests** for critical endpoints. Unit tests are great, but integration tests catch the real issues.
4. **Document your API** with OpenAPI/Swagger. Consumers will actually use your API if they understand it.
5. **Rate limit from the start.** Waiting until someone DoS's you is... not ideal.

## The Reality Check

Perfect APIs don't exist. You'll make tradeoffs. You'll ship bugs. You'll realize your architecture needs refactoring 6 months in.

That's fine. Ship something that works, iterate, and make it better. Just avoid the obvious pitfalls:

- Exposing entities directly
- No pagination
- No validation
- No error handling
- SQL injection vulnerabilities
- No logging

Do those things right, and you're already ahead of 70% of APIs out there.

## Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot) - Actually read them
- [Baeldung](https://www.baeldung.com/) - Saved me countless times
- Spring Boot source code - When docs fail, read the code
- Random Stack Overflow answers at 2 AM

\- Dhanur
