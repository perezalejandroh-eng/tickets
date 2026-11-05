package com.soporte.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {

    private Long id;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String telefono;
    private String extension;
    private DependenciaResponse dependencia;
    private EdificioResponse edificio;
    private PisoResponse piso;
    private String area;
    private RoleResponse rol;
    private Boolean activo = true;
    private Boolean correoVerificado = false;
    private String estatus;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class DependenciaResponse {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activo = true;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }
    @Data
    @Builder
    public static class EdificioResponse {
        private Long id;
        private String nombre;
        private String direccion;
        private String descripcion;
        private Boolean activo = true;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class PisoResponse {
        private Long id;
        private EdificioResponse edificio;
        private String nombre;
        private String numero;
        private String descripcion;
        private Boolean activo = true;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    public static class RoleResponse {
        private Long id;
        private String nombre;
        private String descripcion;
        private Boolean activo = true;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime updatedAt;
    }

}
