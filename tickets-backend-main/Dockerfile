# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S ventus && adduser -S ventus -G ventus
RUN mkdir -p /app/ventus/uploads/tickets && chown -R ventus:ventus /app/ventus/uploads
COPY --from=builder /app/build/libs/*.jar app.jar
RUN chown ventus:ventus app.jar

USER ventus
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
