package com.soporte.controller;

import com.soporte.dto.request.LoginRequest;
import com.soporte.dto.request.RegisterRequest;
import com.soporte.dto.response.ApiResponse;
import com.soporte.dto.response.JwtResponse;
import com.soporte.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Usuario registrado. Revisa tu correo para confirmar la cuenta.", null));
    }

    @GetMapping("/verificar")
    public ResponseEntity<ApiResponse<Void>> verificar(@RequestParam String token) {
        authService.verificarCorreo(token);
        return ResponseEntity.ok(ApiResponse.ok("Correo verificado exitosamente.", null));
    }

    @PostMapping("/recuperar")
    public ResponseEntity<ApiResponse<Void>> recuperar(@RequestBody Map<String, String> body) {
        authService.solicitarRecuperacion(body.get("correo"));
        return ResponseEntity.ok(ApiResponse.ok("Si el correo existe, recibirás instrucciones de recuperación.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("password"));
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada exitosamente.", null));
    }
}
