package com.soporte.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class TicketResponse {
    private Long id;
    private String folio;
    private String asunto;
    private String descripcion;
    private String solucion;

    private String usuarioNombre;
    private Long usuarioId;
    private String dependenciaNombre;
    private String edificioNombre;
    private String pisoNombre;
    private String area;

    private String tipoSolicitud;
    private String categoriaServicio;
    private String subcategoriaServicio;

    private String impacto;
    private String urgencia;
    private String prioridad;
    private String prioridadColor;

    private String estatus;
    private String estatusColor;

    private String agenteNombre;
    private Long agenteId;
    private String canalOrigen;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaAsignacion;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaResolucion;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaCierre;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime slaRespuesta;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime slaResolucion;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    private List<ComentarioResponse> comentarios;
    private List<EvidenciaResponse> evidencias;
    private List<HistorialEstatusResponse> historial;

    @Data @Builder
    public static class ComentarioResponse {
        private Long id;
        private String comentario;
        private String autorNombre;
        private Long autorId;
        private boolean esInterno;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
        private List<EvidenciaResponse> evidencias;
    }

    @Data @Builder
    public static class EvidenciaResponse {
        private Long id;
        private String nombreOriginal;
        private String nombreArchivo;
        private String url;
        private String tipoMime;
        private Long tamanoBytes;
        private String subioPor;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class HistorialEstatusResponse {
        private String estatusAnterior;
        private String estatusNuevo;
        private String cambiadoPor;
        private String comentario;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }
}
