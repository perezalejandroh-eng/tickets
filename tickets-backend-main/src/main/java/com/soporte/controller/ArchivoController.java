package com.soporte.controller;

import com.soporte.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;

@Slf4j
@RestController
@RequestMapping("/archivos")
@RequiredArgsConstructor
public class ArchivoController {

    private final FileStorageService fileStorageService;

    @GetMapping("/{*rutaArchivo}")
    public ResponseEntity<Resource> descargar(@PathVariable String rutaArchivo) {
        try {
            Path filePath = fileStorageService.obtenerRutaCompleta(rutaArchivo);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(filePath);
            } catch (Exception e) {
                log.warn("No se pudo determinar el tipo de contenido");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
